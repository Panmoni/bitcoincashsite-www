import { type CollectionEntry, getCollection } from "astro:content";

export type ProjectEntry = CollectionEntry<"projects">;
export type ProjectData = ProjectEntry["data"];
type HealthState = CollectionEntry<"health">["data"]["state"];

const sanitize = (data: ProjectData, state: HealthState) => ({
	title: data.title,
	description: data.description || undefined,
	icon: data.icon || undefined,
	url: data.url || undefined,
	verified: data.verified,
	state,
});

// Order within a list: entries placed first, then working projects, then
// unchecked, then stale, then entries placed last. Ties keep id order.
const RANK: Record<HealthState, number> = {
	alive: 0,
	unknown: 1,
	stale: 2,
	dead: 3,
};

const PLACE = { first: -1, default: 0, last: 1 };

// Every resource list on the site comes from the directory. Projects that are
// deprecated, or that failed two health checks in a row, are left out.
export const getProjectsByCategory = async (
	category: ProjectData["categories"][number],
): Promise<Array<ReturnType<typeof sanitize>>> => {
	const [all, health] = await Promise.all([
		getCollection("projects"),
		getCollection("health"),
	]);
	const stateOf = new Map(health.map((h) => [h.id, h.data.state]));
	return all
		.filter(
			(e) =>
				e.data.categories.includes(category) && e.data.status !== "deprecated",
		)
		.map((e) => ({
			...sanitize(e.data, stateOf.get(e.id) ?? "unknown"),
			place: PLACE[e.data.placement?.[category] ?? "default"],
		}))
		.filter((p) => p.state !== "dead")
		.sort((a, b) => a.place - b.place || RANK[a.state] - RANK[b.state])
		.map(({ place, ...p }) => p);
};
