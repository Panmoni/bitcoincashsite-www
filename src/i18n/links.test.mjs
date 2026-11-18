import assert from "node:assert/strict";
import { test } from "node:test";
import {
	localePath,
	localizeHref,
	routesFromFiles,
	splitLocale,
	switchHref,
} from "./links.mjs";
import { rewritePage } from "./links-integration.mjs";

// en: home, about, blog post. es: home and about only.
const routes = routesFromFiles([
	"index.html",
	"about.html",
	"blog/foo.html",
	"es.html",
	"es/about.html",
	"_astro/x.css",
]);

test("routesFromFiles maps built HTML files to routes per locale", () => {
	assert.deepEqual([...routes.get("en")].sort(), ["/", "/about", "/blog/foo"]);
	assert.deepEqual([...routes.get("es")].sort(), ["/", "/about"]);
});

test("splitLocale separates the locale prefix from the route", () => {
	assert.deepEqual(splitLocale("/es/about"), { locale: "es", route: "/about" });
	assert.deepEqual(splitLocale("/es"), { locale: "es", route: "/" });
	assert.deepEqual(splitLocale("/es/"), { locale: "es", route: "/" });
	assert.deepEqual(splitLocale("/about.html"), {
		locale: "en",
		route: "/about",
	});
	assert.deepEqual(splitLocale("/blog/index.html"), {
		locale: "en",
		route: "/blog",
	});
	assert.deepEqual(splitLocale("/"), { locale: "en", route: "/" });
	// Only registry codes count as a prefix.
	assert.deepEqual(splitLocale("/esx/a"), { locale: "en", route: "/esx/a" });
});

test("localePath leaves English unprefixed", () => {
	assert.equal(localePath("/about", "en"), "/about");
	assert.equal(localePath("/", "es"), "/es");
	assert.equal(localePath("/about", "es"), "/es/about");
});

test("localizeHref returns the locale counterpart when it exists", () => {
	assert.equal(localizeHref("/about", "es", routes), "/es/about");
	assert.equal(localizeHref("/", "es", routes), "/es");
	assert.equal(localizeHref("/about#team", "es", routes), "/es/about#team");
});

test("localizeHref falls back to the English URL", () => {
	assert.equal(localizeHref("/blog/foo", "es", routes), "/blog/foo");
	// A locale href with no counterpart drops to English.
	assert.equal(localizeHref("/es/blog/foo", "es", routes), "/blog/foo");
	// An English page never keeps a link into another locale.
	assert.equal(localizeHref("/es/about", "en", routes), "/about");
});

test("localizeHref leaves non-page hrefs alone", () => {
	for (const href of ["/rss.xml", "/_astro/x.css", "//cdn.example/a", "#top"]) {
		assert.equal(localizeHref(href, "es", routes), href);
	}
	assert.equal(
		localizeHref("https://example.com/about", "es", routes),
		"https://example.com/about",
	);
});

test("switchHref goes to the counterpart, else the locale home", () => {
	assert.equal(switchHref("/about", "es", routes), "/es/about");
	assert.equal(switchHref("/blog/foo", "es", routes), "/es");
	assert.equal(switchHref("/about", "en", routes), "/about");
	assert.equal(switchHref("/about", "xx", routes), null);
});

test("rewritePage localizes links on a locale page", () => {
	const html =
		'<a class="x" href="/about">A</a><a href="/blog/foo">B</a><a href="/rss.xml">R</a>';
	const { html: out, leaks } = rewritePage(html, "es/about.html", routes, [
		"es",
	]);
	assert.equal(
		out,
		'<a class="x" href="/es/about">A</a><a href="/blog/foo">B</a><a href="/rss.xml">R</a>',
	);
	assert.deepEqual(leaks, []);
});

test("rewritePage leaves script and style blocks alone", () => {
	const html =
		'<script>el.innerHTML = \'<a href="/about">x</a>\';</script><style>a[href="/about"]{}</style><a href="/about">y</a>';
	const { html: out } = rewritePage(html, "es/about.html", routes, ["es"]);
	assert.equal(
		out,
		'<script>el.innerHTML = \'<a href="/about">x</a>\';</script><style>a[href="/about"]{}</style><a href="/es/about">y</a>',
	);
});

test("rewritePage resolves switcher links", () => {
	const html =
		'<a href="/es/blog/foo" data-locale-switch="es">Español</a><a href="/blog/foo" data-locale-switch="en">English</a>';
	const { html: out } = rewritePage(html, "blog/foo.html", routes, []);
	assert.equal(
		out,
		'<a href="/es" data-locale-switch="es">Español</a><a href="/blog/foo" data-locale-switch="en">English</a>',
	);
});

test("rewritePage reports a live page linking to a draft locale", () => {
	// Live English page, draft es: /es/about would be a leak if it survived,
	// but localizeHref sends it to /about. A switcher link cannot be rewritten
	// away, so it is reported.
	const { html: out, leaks } = rewritePage(
		'<a href="/es/about">x</a><a href="/es/about" data-locale-switch="es">es</a>',
		"about.html",
		routes,
		["es"],
	);
	assert.match(out, /^<a href="\/about">x<\/a>/);
	assert.deepEqual(leaks, ["/es/about"]);
});

test("rewritePage does not report a draft page's own locale links", () => {
	const { leaks } = rewritePage(
		'<a href="/es/about" data-locale-switch="es">es</a><a href="/about">a</a>',
		"es/about.html",
		routes,
		["es"],
	);
	assert.deepEqual(leaks, []);
});

test("rewritePage keeps a $ in a URL literal", () => {
	const { html: out } = rewritePage(
		'<a href="/about?q=$1">x</a>',
		"es/about.html",
		routes,
		["es"],
	);
	assert.equal(out, '<a href="/es/about?q=$1">x</a>');
});

test("rewritePage fails on a switcher to a locale with no pages", () => {
	assert.throws(
		() =>
			rewritePage(
				'<a href="/xx" data-locale-switch="xx">x</a>',
				"about.html",
				routes,
				[],
			),
		/no pages/,
	);
});
