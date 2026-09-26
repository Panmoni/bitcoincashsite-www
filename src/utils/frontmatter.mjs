import getReadingTime from "reading-time";

// Sätteri plugins, run on every Markdown and MDX document.

export const readingTimePlugin = {
	name: "reading-time",
	// textContent skips fenced code; collect it so the count still includes code.
	code(node, ctx) {
		ctx.data.readingTimeCode = `${ctx.data.readingTimeCode ?? ""} ${node.value}`;
	},
	after(root, ctx) {
		if (!ctx.data.astro) return;
		const text = ctx.textContent(root, {
			includeImageAlt: true,
			includeHtml: true,
		});
		const minutes = getReadingTime(
			`${text} ${ctx.data.readingTimeCode ?? ""}`,
		).minutes;
		ctx.data.astro.frontmatter.readingTime = Math.ceil(minutes);
	},
};

export const responsiveTablesPlugin = {
	name: "responsive-tables",
	element: {
		filter: ["table"],
		visit(node, ctx) {
			ctx.wrapNode(node, {
				type: "element",
				tagName: "div",
				properties: { className: ["overflow-auto"] },
				children: [],
			});
		},
	},
};

export const lazyImagesPlugin = {
	name: "lazy-images",
	element: {
		filter: ["img"],
		visit(node, ctx) {
			ctx.setProperty(node, "loading", "lazy");
		},
	},
};
