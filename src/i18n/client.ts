// Client-side message access. Each locale's catalog is its own lazy chunk, so a
// page downloads only the catalog for its own locale.
//
//   const t = await loadMessages(root.dataset.locale);
//   t.utxo_status_connecting({})
import type * as Catalog from "~/paraglide/messages/en.js";
import { baseLocale } from "~/paraglide/runtime.js";

export type Messages = typeof Catalog;

const catalogs = import.meta.glob<Messages>([
	"../paraglide/messages/*.js",
	"!../paraglide/messages/_index.js",
]);

const path = (locale: string) => `../paraglide/messages/${locale}.js`;

/** The catalog for `locale`; the base locale's for an unknown one. */
export const loadMessages = (locale: string | undefined): Promise<Messages> =>
	(catalogs[path(locale ?? baseLocale)] ?? catalogs[path(baseLocale)])();
