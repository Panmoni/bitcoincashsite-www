import { type CollectionEntry, getCollection } from "astro:content";

export type ProjectEntry = CollectionEntry<"projects">;
export type ProjectData = ProjectEntry["data"];

const sanitize = (data: ProjectData) => ({
	title: data.title,
	description: data.description || undefined,
	icon: data.icon || undefined,
	url: data.url || undefined,
});

export const getProjectsByCategory = async (
	category: ProjectData["categories"][number],
): Promise<Array<ReturnType<typeof sanitize>>> => {
	const all = await getCollection("projects");
	return all
		.filter(
			(e) =>
				e.data.categories.includes(category) && e.data.status !== "deprecated",
		)
		.map((e) => sanitize(e.data));
};
