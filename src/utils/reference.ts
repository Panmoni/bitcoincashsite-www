import { getCollection } from "astro:content";
import metrics from "~/data/metrics.json";
import { formatCurrency, formatDate, formatNumber } from "~/i18n/format";

export { metrics };
export type ChainId = keyof typeof metrics.chains;

const DAY = 86_400_000;

export type FreshnessLevel = "fresh" | "aging" | "stale";

// Human-checked content: fresh under 90 days, aging under a year, then stale.
// Machine-refreshed data passes tighter windows (e.g. 2 and 7 days).
export const freshness = (
	date: Date | string | null | undefined,
	freshDays = 90,
	agingDays = 365,
	now = Date.now(),
): { level: FreshnessLevel; days: number } | null => {
	if (!date) return null;
	const days = Math.floor((now - new Date(date).getTime()) / DAY);
	const level =
		days <= freshDays ? "fresh" : days <= agingDays ? "aging" : "stale";
	return { level, days };
};

export { formatDate };

export const isoDate = (date: Date | string) =>
	new Date(date).toISOString().slice(0, 10);

// "$1275.70B", "$45.6M", "$1,234.5", "$0.0012" in English; the page locale's
// own digits and currency placement elsewhere. Large amounts keep a fixed
// B or M suffix after the digits (Intl's compact notation would switch to T);
// the suffix is a unit label and stays untranslated here.
export const usd = (n: number | null | undefined, locale?: string) => {
	if (n == null) return "n/a";
	const cur = (o: Intl.NumberFormatOptions, v = n) =>
		formatCurrency(v, locale, o);
	if (n >= 1e6) {
		const b = n >= 1e9;
		const d = b ? 2 : 1;
		const digits = { minimumFractionDigits: d, maximumFractionDigits: d };
		return cur({ ...digits, useGrouping: false }, n / (b ? 1e9 : 1e6)).replace(
			/(\d)(?!.*\d)/,
			`$1${b ? "B" : "M"}`,
		);
	}
	if (n >= 1)
		return cur({ minimumFractionDigits: 0, maximumFractionDigits: 2 });
	if (n === 0) return cur({ maximumFractionDigits: 0 });
	return cur({ minimumSignificantDigits: 2, maximumSignificantDigits: 2 });
};

export const count = (n: number | null | undefined, locale?: string) =>
	n == null ? "n/a" : formatNumber(n, locale);

// The next upgrade that has not activated yet, for the countdown.
export const getNextUpgrade = async (now = Date.now()) => {
	const upgrades = await getCollection("upgrades");
	return upgrades
		.filter((u) => u.data.date.getTime() > now)
		.sort((a, b) => a.data.date.getTime() - b.data.date.getTime())[0];
};

export const getHealthMap = async () =>
	new Map((await getCollection("health")).map((h) => [h.id, h.data]));

// Directory sections, in page order. A project lands in the first section
// whose prefix matches one of its categories.
export const DIRECTORY_SECTIONS = [
	{ id: "wallet", title: "Wallets", href: "/wallet" },
	{ id: "buy", title: "Buy & swap", href: "/buy" },
	{ id: "spend", title: "Spend", href: "/spend" },
	{ id: "earn", title: "Earn", href: "/earn" },
	{ id: "accept", title: "Accept payments", href: "/accept" },
	{ id: "cashtokens", title: "CashTokens", href: "/cashtokens" },
	{ id: "build", title: "Build", href: "/build" },
	{ id: "mining", title: "Mining", href: "/mining" },
	{ id: "support", title: "Community & media", href: "/support" },
	{ id: "governance", title: "Governance", href: undefined },
] as const;

// JSON-LD FAQPage from a frontmatter faq list.
export const faqJsonLd = (
	faq: Array<{ q: string; a: string }>,
	inLanguage: string,
) =>
	faq.length
		? {
				"@context": "https://schema.org",
				"@type": "FAQPage",
				inLanguage,
				mainEntity: faq.map(({ q, a }) => ({
					"@type": "Question",
					name: q,
					acceptedAnswer: { "@type": "Answer", text: a },
				})),
			}
		: null;
