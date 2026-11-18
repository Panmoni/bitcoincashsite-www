// Paraglide compiler options, shared by the Vite plugin (astro.config.mjs)
// and scripts/i18n-compile.mjs.
//
// locale-modules: one module per locale, so a client script can load the
// page's catalog alone (src/i18n/client.ts). baseLocale strategy: server code
// always passes the page locale explicitly (src/i18n/messages.ts).
export const paraglideOptions = {
	project: "./project.inlang",
	outdir: "./src/paraglide",
	outputStructure: "locale-modules",
	strategy: ["baseLocale"],
	emitReadme: false,
};
