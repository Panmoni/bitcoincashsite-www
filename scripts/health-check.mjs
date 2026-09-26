#!/usr/bin/env node
// Pings every directory project and writes src/data/health.json.
// Run daily by .github/workflows/refresh-data.yml. Set GITHUB_TOKEN to lift
// the GitHub API rate limit (60/h unauthenticated, 5000/h with a token).
//
// state:
//   alive   — URL answers 2xx/3xx, and the repo (if any) moved in the last year
//   stale   — URL answers, but the repo is archived or has no push in a year
//   dead    — URL failed on this run and the previous one (one blip is not death)
//   unknown — URL answers 401/403/429 (bot wall) or has not been checked twice
import { readFile, writeFile } from "node:fs/promises";

const PROJECTS = "src/data/projects.json";
const HEALTH = "src/data/health.json";
const STALE_AFTER_DAYS = 365;
const CONCURRENCY = 12;
const TIMEOUT_MS = 15_000;
const UA =
	"Mozilla/5.0 (compatible; BCHWorksHealthCheck/1.0; +https://bchworks.com/directory)";
const BOT_WALL = new Set([401, 403, 429]);

const projects = JSON.parse(await readFile(PROJECTS, "utf8"));
const previous = new Map(
	JSON.parse(await readFile(HEALTH, "utf8").catch(() => "[]")).map((h) => [
		h.id,
		h,
	]),
);

const fetchWithTimeout = (url, init = {}) =>
	fetch(url, {
		redirect: "follow",
		signal: AbortSignal.timeout(TIMEOUT_MS),
		...init,
		headers: { "user-agent": UA, ...init.headers },
	});

// Registrable domain, roughly: www.zapit.io → zapit.io, and keep three labels
// under second-level country domains (korbit.co.kr, not co.kr).
const baseDomain = (url) => {
	const labels = new URL(url).hostname.split(".");
	const sld = labels.at(-2) ?? "";
	const keep = labels.at(-1)?.length === 2 && sld.length <= 3 ? 3 : 2;
	return labels.slice(-keep).join(".");
};

async function probe(url) {
	try {
		let res = await fetchWithTimeout(url, { method: "HEAD" });
		// Many servers reject HEAD; retry with GET before calling it a failure.
		if (res.status >= 400 && !BOT_WALL.has(res.status)) {
			res = await fetchWithTimeout(url, { method: "GET" });
		}
		// A redirect to another domain means the project moved or the domain
		// lapsed (zapit.io → a streaming site, 2026-09). Either way the listed
		// URL is wrong, so it counts as a failure until a person updates it.
		const from = baseDomain(url);
		const to = baseDomain(res.url || url);
		if (from !== to) return { httpStatus: null, error: `redirects to ${to}` };
		return { httpStatus: res.status, error: null };
	} catch (err) {
		return { httpStatus: null, error: err.cause?.code || err.name || "error" };
	}
}

const ghHeaders = {
	accept: "application/vnd.github+json",
	...(process.env.GITHUB_TOKEN
		? { authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
		: {}),
};

async function github(repo) {
	try {
		const res = await fetchWithTimeout(`https://api.github.com/repos/${repo}`, {
			headers: ghHeaders,
		});
		if (!res.ok) return null;
		const data = await res.json();
		const rel = await fetchWithTimeout(
			`https://api.github.com/repos/${repo}/releases/latest`,
			{ headers: ghHeaders },
		);
		const release = rel.ok ? await rel.json() : null;
		return {
			lastCommit: data.pushed_at ?? null,
			archived: Boolean(data.archived),
			lastRelease: release?.published_at ?? null,
		};
	} catch {
		return null;
	}
}

async function check(project) {
	const prev = previous.get(project.id);
	const url = project.url?.startsWith("http") ? project.url : null;
	const site = url ? await probe(url) : { httpStatus: null, error: "no-url" };
	// GitHub data is optional: on a rate-limit miss keep the last known values.
	const gh = project.github ? await github(project.github) : null;
	const lastCommit = gh?.lastCommit ?? prev?.lastCommit ?? null;
	const archived = gh?.archived ?? prev?.archived ?? false;
	const lastRelease = gh?.lastRelease ?? prev?.lastRelease ?? null;

	const up = site.httpStatus !== null && site.httpStatus < 400;
	const walled = BOT_WALL.has(site.httpStatus);
	const failures = up || walled ? 0 : (prev?.failures ?? 0) + 1;
	const repoIdle =
		archived ||
		(lastCommit &&
			Date.now() - Date.parse(lastCommit) > STALE_AFTER_DAYS * 86_400_000);

	let state = "unknown";
	if (up) state = repoIdle ? "stale" : "alive";
	else if (failures >= 2) state = "dead";

	return {
		id: project.id,
		checkedAt: new Date().toISOString(),
		httpStatus: site.httpStatus,
		error: site.error,
		failures,
		lastCommit,
		lastRelease,
		archived,
		state,
	};
}

// Small promise pool: CONCURRENCY checks in flight at once.
const results = new Array(projects.length);
let next = 0;
await Promise.all(
	Array.from({ length: CONCURRENCY }, async () => {
		while (next < projects.length) {
			const i = next++;
			results[i] = await check(projects[i]);
		}
	}),
);

await writeFile(HEALTH, `${JSON.stringify(results, null, "\t")}\n`);
const tally = results.reduce(
	(t, r) => ({ ...t, [r.state]: (t[r.state] ?? 0) + 1 }),
	{},
);
console.log(`health: ${results.length} projects`, tally);
