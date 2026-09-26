// Minimal Electrum Cash protocol client over WebSocket, for the browser.
// Public Fulcrum servers, tried in random order; the first that answers
// server.version wins. A dropped socket rejects what is in flight and the
// next request reconnects. No keys, no accounts, no third-party API.
// The site CSP (connect-src in astro.config.mjs) lists these same hosts.

export const SERVERS = [
	"wss://bch.imaginary.cash:50004",
	"wss://electrum.imaginary.cash:50004",
	"wss://bch.loping.net:50004",
	"wss://fulcrum.jettscythe.xyz:50004",
	"wss://blackie.c3-soft.com:50004",
];

const CONNECT_TIMEOUT = 6_000;
const REQUEST_TIMEOUT = 20_000;

type Pending = {
	resolve: (v: unknown) => void;
	reject: (e: Error) => void;
	timer: ReturnType<typeof setTimeout>;
};

export class Electrum {
	private ws: WebSocket | null = null;
	private connecting: Promise<WebSocket> | null = null;
	private pending = new Map<number, Pending>();
	private nextId = 1;
	server = "";

	private open(url: string): Promise<WebSocket> {
		return new Promise((resolve, reject) => {
			const ws = new WebSocket(url);
			const timer = setTimeout(() => {
				ws.close();
				reject(new Error(`${url} timed out`));
			}, CONNECT_TIMEOUT);
			ws.onerror = () => {
				clearTimeout(timer);
				reject(new Error(`${url} refused`));
			};
			ws.onopen = () => {
				ws.onmessage = (m) => this.onMessage(m);
				ws.onclose = () => this.onClose(ws);
				ws.onerror = null;
				this.ws = ws;
				this.send("server.version", ["bchworks-utxo-machine", "1.5"]).then(
					() => {
						clearTimeout(timer);
						this.server = new URL(url).hostname;
						resolve(ws);
					},
					(e) => {
						clearTimeout(timer);
						ws.close();
						reject(e);
					},
				);
			};
		});
	}

	private async connect(): Promise<WebSocket> {
		if (this.ws && this.ws.readyState === WebSocket.OPEN) return this.ws;
		if (this.connecting) return this.connecting;
		const order = [...SERVERS].sort(() => Math.random() - 0.5);
		this.connecting = (async () => {
			let last: Error | null = null;
			for (const url of order) {
				try {
					return await this.open(url);
				} catch (e) {
					last = e as Error;
				}
			}
			throw new Error(
				`No Fulcrum server answered (${last?.message ?? "unknown"})`,
			);
		})().finally(() => {
			this.connecting = null;
		});
		return this.connecting;
	}

	private onMessage(m: MessageEvent) {
		let msg: { id?: number; result?: unknown; error?: { message?: string } };
		try {
			msg = JSON.parse(String(m.data));
		} catch {
			return;
		}
		if (typeof msg.id !== "number") return; // subscription notice
		const p = this.pending.get(msg.id);
		if (!p) return;
		this.pending.delete(msg.id);
		clearTimeout(p.timer);
		if (msg.error) p.reject(new Error(msg.error.message ?? "server error"));
		else p.resolve(msg.result);
	}

	private onClose(ws: WebSocket) {
		if (this.ws !== ws) return;
		this.ws = null;
		for (const [id, p] of this.pending) {
			clearTimeout(p.timer);
			p.reject(new Error("connection closed"));
			this.pending.delete(id);
		}
	}

	private send(method: string, params: unknown[]): Promise<unknown> {
		const ws = this.ws;
		if (!ws) return Promise.reject(new Error("not connected"));
		const id = this.nextId++;
		return new Promise((resolve, reject) => {
			const timer = setTimeout(() => {
				this.pending.delete(id);
				reject(new Error(`${method} timed out`));
			}, REQUEST_TIMEOUT);
			this.pending.set(id, { resolve, reject, timer });
			ws.send(JSON.stringify({ jsonrpc: "2.0", id, method, params }));
		});
	}

	async request<T>(method: string, params: unknown[] = []): Promise<T> {
		await this.connect();
		return (await this.send(method, params)) as T;
	}
}
