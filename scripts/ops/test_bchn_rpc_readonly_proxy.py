"""Tests for bchn-rpc-readonly-proxy.py against a mock bitcoind.

RUN: python3 -B -m unittest discover -s scripts/ops -p 'test_*.py'
"""

import http.client
import importlib.util
import json
import re
import socket
import subprocess
import sys
import threading
import time
import unittest
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import ClassVar

HERE = Path(__file__).resolve().parent
PROXY = HERE / "bchn-rpc-readonly-proxy.py"
UTXO_STATS = HERE.parent / "utxo-stats.mjs"
AUTH = {"Authorization": "Basic Y2k6cHc="}
BIG = "x" * (5 * 1024 * 1024)

sys.dont_write_bytecode = True  # no __pycache__ in the repo
spec = importlib.util.spec_from_file_location("proxy", PROXY)
proxy = importlib.util.module_from_spec(spec)
spec.loader.exec_module(proxy)


class MockBitcoind(BaseHTTPRequestHandler):
    # (raw body, Authorization) of every request that got through
    seen: ClassVar[list] = []

    def do_POST(self):
        raw = self.rfile.read(int(self.headers["Content-Length"]))
        MockBitcoind.seen.append((raw, self.headers.get("Authorization")))
        if not self.headers.get("Authorization"):
            self.send_response(401)
            self.send_header("WWW-Authenticate", 'Basic realm="jsonrpc"')
            self.send_header("Content-Length", "0")
            self.end_headers()
            return
        req = json.loads(raw)
        result = BIG if req["method"] == "getblock" else 123
        out = json.dumps({"result": result, "error": None, "id": req["id"]}).encode()
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(out)))
        self.end_headers()
        self.wfile.write(out)

    def log_message(self, *args):
        pass


def free_port():
    with socket.socket() as s:
        s.bind(("127.0.0.1", 0))
        return s.getsockname()[1]


def rpc(method, **extra):
    return {"jsonrpc": "1.0", "id": 7, "method": method, "params": [], **extra}


class ParseRequest(unittest.TestCase):
    def refused(self, raw):
        with self.assertRaises(proxy.Refused) as ctx:
            proxy.parse_request(raw)
        return ctx.exception.status

    def test_allowed_call_is_reencoded(self):
        method, body = proxy.parse_request(
            b'{"method":"getblock","params":["00ab",3],"id":5,"extra":1}'
        )
        self.assertEqual(method, "getblock")
        self.assertEqual(
            json.loads(body),
            {"jsonrpc": "1.0", "id": 5, "method": "getblock", "params": ["00ab", 3]},
        )

    def test_duplicate_method_key_is_refused_either_order(self):
        self.assertEqual(
            self.refused(b'{"method":"stop","method":"getblockcount"}'), 403
        )
        self.assertEqual(
            self.refused(b'{"method":"getblockcount","method":"stop"}'), 403
        )

    def test_duplicate_key_nested_in_params_is_refused(self):
        self.assertEqual(
            self.refused(b'{"method":"getblockcount","params":[{"a":1,"a":2}]}'), 403
        )

    def test_denied_and_malformed(self):
        for raw in [
            b'{"method":"stop"}',
            b'{"method":"GETBLOCKCOUNT"}',
            b'{"method":["stop"]}',
            b'[{"method":"getblockcount"}]',
            b'{"method":"getblockcount","params":{"verbose":true}}',
        ]:
            self.assertEqual(self.refused(raw), 403, raw)
        for raw in [
            b"not json",
            b'{"method":"getblockcount"} {"method":"stop"}',
            b'{"method":"getblockcount","params":[NaN]}',
            '{"method":"getblockcount"}'.encode("utf-16"),
            b"\xef\xbb\xbf" + b'{"method":"getblockcount"}',
            b"[" * 60000,
        ]:
            self.assertEqual(self.refused(raw), 400, raw[:40])

    def test_allowlist_matches_utxo_stats(self):
        called = set(re.findall(r'\brpc\("([a-z]+)"', UTXO_STATS.read_text()))
        self.assertEqual(called, set(proxy.ALLOWED))


class ProxyOverHttp(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.up, cls.port = free_port(), free_port()
        cls.mock = ThreadingHTTPServer(("127.0.0.1", cls.up), MockBitcoind)
        threading.Thread(target=cls.mock.serve_forever, daemon=True).start()
        cls.proc = subprocess.Popen(
            [
                sys.executable,
                "-I",
                str(PROXY),
                "--port",
                str(cls.port),
                "--upstream-port",
                str(cls.up),
            ],
            stderr=subprocess.DEVNULL,
        )
        for _ in range(50):
            try:
                socket.create_connection(("127.0.0.1", cls.port), timeout=0.1).close()
                break
            except OSError:
                time.sleep(0.1)

    @classmethod
    def tearDownClass(cls):
        cls.proc.terminate()
        cls.proc.wait()
        cls.mock.shutdown()
        cls.mock.server_close()

    def call(self, body, headers=None, path="/", method="POST"):
        conn = http.client.HTTPConnection("127.0.0.1", self.port, timeout=30)
        raw = (
            body
            if isinstance(body, bytes) or body is None
            else json.dumps(body).encode()
        )
        conn.request(method, path, body=raw, headers=headers or {})
        resp = conn.getresponse()
        data = resp.read()
        conn.close()
        return resp.status, resp, data

    def test_allowed_call_forwards_auth_and_canonical_body(self):
        before = len(MockBitcoind.seen)
        status, _, data = self.call(rpc("getblockcount"), AUTH)
        self.assertEqual((status, json.loads(data)["result"]), (200, 123))
        raw, auth = MockBitcoind.seen[before]
        self.assertEqual(auth, AUTH["Authorization"])
        self.assertEqual(json.loads(raw), rpc("getblockcount"))

    def test_refusals_never_reach_bitcoind(self):
        before = len(MockBitcoind.seen)
        for body in [
            rpc("stop"),
            rpc("setban"),
            rpc("invalidateblock"),
            b'{"method":"stop","method":"getblockcount"}',
        ]:
            status, resp, _ = self.call(body, AUTH)
            self.assertEqual(
                (status, resp.getheader("X-RPC-Proxy")), (403, "refused"), body
            )
        self.assertEqual(self.call(rpc("getblockcount"), AUTH, path="/wallet/")[0], 403)
        self.assertEqual(self.call(None, AUTH, method="GET")[0], 405)
        self.assertEqual(self.call(b"x" * (64 * 1024 + 1), AUTH)[0], 413)
        self.assertEqual(len(MockBitcoind.seen), before)

    def test_unauthenticated_call_gets_bitcoinds_realm(self):
        status, resp, _ = self.call(rpc("getblockcount"))
        self.assertEqual(
            (status, resp.getheader("WWW-Authenticate")), (401, 'Basic realm="jsonrpc"')
        )

    def test_large_response_streams_intact(self):
        status, _, data = self.call(rpc("getblock"), AUTH)
        self.assertEqual((status, json.loads(data)["result"]), (200, BIG))


if __name__ == "__main__":
    unittest.main()
