import { toString } from "mdast-util-to-string";
import getReadingTime from "reading-time";
import { visit } from "unist-util-visit";

export function readingTimeRemarkPlugin() {
	return function (tree, file) {
		const textOnPage = toString(tree);
		const readingTime = Math.ceil(getReadingTime(textOnPage).minutes);

		file.data.astro.frontmatter.readingTime = readingTime;
	};
}

export function responsiveTablesRehypePlugin() {
	return function (tree) {
		if (!tree.children) return;

		const children = [...tree.children];

		for (let i = 0; i < children.length; i++) {
			const child = children[i];

			if (child.type === "element" && child.tagName === "table") {
				const wrapper = {
					type: "element",
					tagName: "div",
					properties: {
						style: "overflow:auto",
					},
					children: [child],
				};

				tree.children[i] = wrapper;
			}
		}
	};
}

export function lazyImagesRehypePlugin() {
	return function (tree) {
		if (!tree.children) return;

		visit(tree, "element", function (node) {
			if (node.tagName === "img") {
				node.properties.loading = "lazy";
			}
		});
	};
}
