#!/usr/bin/env python3
"""Read-only JSON-RPC proxy in front of carson's BCHN, for the CI tunnel.

BCHN has no -rpcwhitelist (v29.0.0's -help-debug lists none), so any RPC user
can call stop, setban or invalidateblock. The Cloudflare Tunnel's ingress
points here instead of at bitcoind. This proxy forwards a request only when it
is one JSON-RPC call to a method scripts/utxo-stats.mjs uses. It refuses
everything else with HTTP 403 before bitcoind sees it, so no credential can
change that answer. Allowed calls keep their Authorization header, and
bitcoind still checks the RPC password.

bitcoind never sees the client's bytes. The proxy forwards a fresh encoding of
the fields it checked, so a body that two JSON parsers read differently (a
duplicate "method" key, say) cannot smuggle a second method through.

Installed on carson by scripts/ops/carson-rpc-tunnel.sh and run by systemd
as a dynamic user. Standard library only. Tests: test_bchn_rpc_readonly_proxy.py.

USAGE: bchn-rpc-readonly-proxy.py [--port 8340] [--upstream-port 8332]
"""

import argparse
import http.client
import json
import sys
import threading
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

# Keep in step with the rpc() calls in scripts/utxo-stats.mjs (the test checks).
ALLOWED = frozenset(
    {
        "getblockcount",
        "getblockhash",
        "getblockheader",
        "getblock",
        "gettxoutsetinfo",
        "getnetworkinfo",
    }
)
MAX_BODY = 64 * 1024  # utxo-stats requests are under 200 bytes
# Cloudflare drops a proxied request at about 100 s; a little past that, the
# answer has no one left to read it.
UPSTREAM_TIMEOUT = 120
# utxo-stats keeps 4 block fetches in flight (AHEAD). Past this many calls at
# bitcoind the proxy answers 503, so a leaked token cannot pile heavy calls on
# the node.
MAX_IN_FLIGHT = 6
CHUNK = 64 * 1024
# Response headers passed back from bitcoind. WWW-Authenticate carries the
# jsonrpc realm that the tunnel script's verify step looks for.
PASS_HEADERS = ("Content-Type", "Content-Length", "WWW-Authenticate")


class Refused(Exception):
    def __init__(self, status, message):
        super().__init__(message)
        self.status = status


def _no_duplicates(pairs):
    keys = [k for k, _ in pairs]
    if len(keys) != len(set(keys)):
        raise Refused(403, "duplicate keys are not allowed")
    return dict(pairs)


def _no_constants(name):
    raise Refused(400, f"{name} is not valid JSON")


def parse_request(raw):
    """Returns (method, canonical body) for an allowed call, or raises Refused."""
    try:
        req = json.loads(
            raw.decode("utf-8"),  # strict: no BOM or UTF-16/32 guessing
            object_pairs_hook=_no_duplicates,
            parse_constant=_no_constants,
        )
    except (UnicodeDecodeError, ValueError, RecursionError) as err:
        raise Refused(400, "request body is not JSON") from err
    if not isinstance(req, dict):
        raise Refused(403, "batch requests are not allowed")
    method, params, rpc_id = req.get("method"), req.get("params", []), req.get("id")
    if not isinstance(method, str) or method not in ALLOWED:
        raise Refused(403, "method not allowed by the read-only proxy")
    if not isinstance(params, list):
        raise Refused(403, "params must be a list")
    body = json.dumps(
        {"jsonrpc": "1.0", "id": rpc_id, "method": method, "params": params}
    )
    return method, body.encode()


class Handler(BaseHTTPRequestHandler):
    upstream_port = 8332
    slots = threading.BoundedSemaphore(MAX_IN_FLIGHT)
    timeout = 30  # seconds to read a request from cloudflared

    def version_string(self):
        return "bchn-rpc-readonly-proxy"

    def refuse(self, status, message):
        body = json.dumps(
            {"result": None, "error": {"code": -32601, "message": message}, "id": None}
        ).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("X-RPC-Proxy", "refused")
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        self.refuse(405, "only POST is accepted")

    def do_POST(self):
        length = self.headers.get("Content-Length", "")
        if self.path != "/":
            return self.refuse(403, "only the / endpoint is proxied")
        if not (length.isascii() and length.isdigit()):
            return self.refuse(411, "Content-Length is required")
        if not 0 < int(length) <= MAX_BODY:
            return self.refuse(413, "request body is empty or too large")
        try:
            method, body = parse_request(self.rfile.read(int(length)))
        except Refused as err:
            self.log_message("refused: %s", err)
            return self.refuse(err.status, str(err))
        if not self.slots.acquire(blocking=False):
            self.log_message("busy: refused %s", method)
            return self.refuse(503, "too many requests in flight")
        try:
            self.forward(method, body)
        finally:
            self.slots.release()

    def forward(self, method, body):
        headers = {"Content-Type": "application/json"}
        if self.headers.get("Authorization"):
            headers["Authorization"] = self.headers["Authorization"]
        conn = http.client.HTTPConnection(
            "127.0.0.1", self.upstream_port, timeout=UPSTREAM_TIMEOUT
        )
        try:
            try:
                conn.request("POST", "/", body=body, headers=headers)
                resp = conn.getresponse()
            except (OSError, http.client.HTTPException) as err:
                self.log_message("upstream error on %s: %s", method, err)
                return self.refuse(502, "bitcoind is unreachable")
            self.send_response(resp.status)
            for name in PASS_HEADERS:
                value = resp.getheader(name)
                if value is not None:
                    self.send_header(name, value)
            self.end_headers()
            # HTTP/1.0 response: without a Content-Length, closing ends the body.
            while chunk := resp.read(CHUNK):
                self.wfile.write(chunk)
        except (OSError, http.client.HTTPException) as err:
            self.log_message("stream error on %s: %s", method, err)
        finally:
            conn.close()

    def log_request(self, code="-", size="-"):
        pass  # one line per refusal or error is enough; never log headers

    def log_message(self, fmt, *args):
        sys.stderr.write(f"{(fmt % args)[:200]}\n")


def main():
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--port", type=int, default=8340)
    parser.add_argument("--upstream-port", type=int, default=8332)
    args = parser.parse_args()
    Handler.upstream_port = args.upstream_port
    server = ThreadingHTTPServer(("127.0.0.1", args.port), Handler)
    sys.stderr.write(
        f"listening on 127.0.0.1:{args.port} -> 127.0.0.1:{args.upstream_port}\n"
    )
    server.serve_forever()


if __name__ == "__main__":
    main()
