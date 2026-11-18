// Display formatting for dates, numbers and amounts, per locale. Every value
// the site shows goes through these with the page locale. Data stays
// locale-independent: data-* attributes and JSON islands carry raw JS numbers
// and ISO dates, and only this display step localizes them.
//
//   formatNumber(1234.5, Astro.currentLocale)  // en "1,234.5", es "1234,5"
//
// `locale` is a registry code ("es"). A tag outside the registry that Intl
// knows ("pt", from a guide's frontmatter) is used as is; anything else falls
// back to the default locale. Formatters are built once per locale+options.
import { getLocale, LOCALES } from "./locales.ts";

const cache = new Map<string, unknown>();

const intlTag = (locale: string | undefined): string => {
	const entry = LOCALES.find((l) => l.code === locale);
	if (entry) return entry.intl;
	if (locale && Intl.DateTimeFormat.supportedLocalesOf(locale).length)
		return locale;
	return getLocale().intl;
};

function memo<T>(
	kind: string,
	locale: string | undefined,
	opts: object,
	make: (tag: string) => T,
): T {
	const tag = intlTag(locale);
	const key = `${kind}|${tag}|${JSON.stringify(opts)}`;
	let f = cache.get(key) as T | undefined;
	if (!f) {
		f = make(tag);
		cache.set(key, f);
	}
	return f;
}

const DATE: Intl.DateTimeFormatOptions = {
	year: "numeric",
	month: "short",
	day: "numeric",
	timeZone: "UTC",
};

/** A calendar date in UTC; `opts` override the default "Jan 5, 2026" shape. */
export const formatDate = (
	date: Date | string | number,
	locale?: string,
	opts?: Intl.DateTimeFormatOptions,
): string => {
	const o = { ...DATE, ...opts };
	return memo("date", locale, o, (t) => new Intl.DateTimeFormat(t, o)).format(
		new Date(date),
	);
};

/** A plain number; pass `{ style: "percent" }` for a fraction as a percent. */
export const formatNumber = (
	n: number,
	locale?: string,
	opts: Intl.NumberFormatOptions = {},
): string =>
	memo("number", locale, opts, (t) => new Intl.NumberFormat(t, opts)).format(n);

/** A money amount, USD unless `opts.currency` says otherwise. */
export const formatCurrency = (
	n: number,
	locale?: string,
	opts: Intl.NumberFormatOptions = {},
): string => {
	const o: Intl.NumberFormatOptions = {
		style: "currency",
		currency: "USD",
		...opts,
	};
	return memo("currency", locale, o, (t) => new Intl.NumberFormat(t, o)).format(
		n,
	);
};

/** A relative time: formatRelative(-3, "day", "es") is "hace 3 días". */
export const formatRelative = (
	value: number,
	unit: Intl.RelativeTimeFormatUnit,
	locale?: string,
	opts: Intl.RelativeTimeFormatOptions = {},
): string =>
	memo(
		"relative",
		locale,
		opts,
		(t) => new Intl.RelativeTimeFormat(t, opts),
	).format(value, unit);

// Site shorthands for the metrics tables, "n/a" for a missing value.
// usd: "$1275.70B", "$45.6M", "$1,234.5", "$0.0012" in English, with the
// page locale's digits and currency placement elsewhere. Large amounts keep a
// fixed B or M suffix after the digits (compact notation would switch to T);
// the suffix is a unit label and stays untranslated here.
export const usd = (n: number | null | undefined, locale?: string): string => {
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

export const count = (n: number | null | undefined, locale?: string): string =>
	n == null ? "n/a" : formatNumber(n, locale);
