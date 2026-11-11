#!/usr/bin/env python3
"""Read-only JSON-RPC proxy in front of carson's BCHN, for the CI tunnel.

BCHN has no -rpcwhitelist, so any RPC user can call stop, setban or
invalidateblock. The Cloudflare Tunnel's ingress points here instead of at
bitcoind. This proxy forwards a request only when it is one JSON-RPC call to a
method scripts/utxo-stats.mjs uses. It refuses everything else with HTTP 403
before bitcoind sees it, so no credential can change that answer. Allowed calls
keep their Authorization header, and bitcoind still checks the RPC password.

Installed on carson by scripts/ops/carson-rpc-tunnel.sh and run by systemd
as a dynamic user. Standard library only.

USAGE: bchn-rpc-readonly-proxy.py [--port 8340] [--upstream-port 8332]
"""

import argparse
import http.client
import json
import sys
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

# Keep in step with the rpc() calls in scripts/utxo-stats.mjs.
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
UPSTREAM_TIMEOUT = 600  # getblock verbosity 3 on a large block is slow
CHUNK = 64 * 1024
# Response headers passed back from bitcoind. WWW-Authenticate carries the
# jsonrpc realm that the tunnel script's verify step looks for.
PASS_HEADERS = ("Content-Type", "Content-Length", "WWW-Authenticate")


class Handler(BaseHTTPRequestHandler):
    upstream_port = 8332
    timeout = 30  # seconds to read a request from cloudflared

    def version_string(self):
        return "bchn-rpc-readonly-proxy"

    def refuse(self, status, message, rpc_id=None):
        body = json.dumps({"result": None, "error": {"code": -32601, "message": message}, "id": rpc_id}).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("X-RPC-Proxy", "refused")
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        self.refuse(405, "only POST is accepted")

    def do_POST(self):
        if self.path != "/":
            return self.refuse(403, "only the / endpoint is proxied")
        try:
            length = int(self.headers.get("Content-Length", ""))
        except ValueError:
            return self.refuse(411, "Content-Length is required")
        if length <= 0 or length > MAX_BODY:
            return self.refuse(413, "request body is empty or too large")
        raw = self.rfile.read(length)
        try:
            req = json.loads(raw)
        except ValueError:
            return self.refuse(400, "request body is not JSON")
        if not isinstance(req, dict):
            return self.refuse(403, "batch requests are not allowed")
        method, rpc_id = req.get("method"), req.get("id")
        if not isinstance(method, str) or method not in ALLOWED:
            self.log_message("refused method %r", method if isinstance(method, str) else type(method).__name__)
            return self.refuse(403, "method not allowed by the read-only proxy", rpc_id)

        headers = {"Content-Type": "application/json"}
        if self.headers.get("Authorization"):
            headers["Authorization"] = self.headers["Authorization"]
        conn = http.client.HTTPConnection("127.0.0.1", self.upstream_port, timeout=UPSTREAM_TIMEOUT)
        try:
            conn.request("POST", "/", body=raw, headers=headers)
            resp = conn.getresponse()
        except OSError as err:
            conn.close()
            self.log_message("upstream error on %s: %s", method, err)
            return self.refuse(502, "bitcoind is unreachable", rpc_id)
        try:
            self.send_response(resp.status)
            for name in PASS_HEADERS:
                value = resp.getheader(name)
                if value is not None:
                    self.send_header(name, value)
            self.end_headers()
            # HTTP/1.0 response: without a Content-Length, closing ends the body.
            while chunk := resp.read(CHUNK):
                self.wfile.write(chunk)
        except OSError as err:
            self.log_message("stream error on %s: %s", method, err)
        finally:
            conn.close()

    def log_request(self, code="-", size="-"):
        pass  # one line per refusal or error is enough; never log headers

    def log_message(self, fmt, *args):
        sys.stderr.write(f"{fmt % args}\n")


def main():
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--port", type=int, default=8340)
    parser.add_argument("--upstream-port", type=int, default=8332)
    args = parser.parse_args()
    Handler.upstream_port = args.upstream_port
    server = ThreadingHTTPServer(("127.0.0.1", args.port), Handler)
    server.daemon_threads = True
    sys.stderr.write(f"listening on 127.0.0.1:{args.port} -> 127.0.0.1:{args.upstream_port}\n")
    server.serve_forever()


if __name__ == "__main__":
    main()
