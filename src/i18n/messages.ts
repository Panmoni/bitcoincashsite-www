// Server-side message access for .astro files and server TS.
//
//   import { m, msg } from "~/i18n/messages";
//   const l = msg(Astro.currentLocale);
//   m.nav_why_bch({}, l)
//
// Always pass `l`: the compiled runtime's own fallback is the base locale, so a
// call without it would silently render English on a /es/ page.
import { baseLocale, isLocale, type Locale } from "~/paraglide/runtime.js";

export { m } from "~/paraglide/messages.js";

/** The `options` argument for m.*(): the locale Astro is rendering. */
export const msg = (currentLocale: string | undefined): { locale: Locale } => ({
	locale: currentLocale && isLocale(currentLocale) ? currentLocale : baseLocale,
});
