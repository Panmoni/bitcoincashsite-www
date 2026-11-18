import { getCollection } from "astro:content";
import metrics from "~/data/metrics.json";
import { count, formatDate, usd } from "~/i18n/format";

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

export { count, formatDate, usd };

export const isoDate = (date: Date | string) =>
	new Date(date).toISOString().slice(0, 10);

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
