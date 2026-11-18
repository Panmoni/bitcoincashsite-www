import { m } from "./i18n/messages";
import { getPermalink } from "./utils/permalinks";

/** @typedef {{ locale: import("./paraglide/runtime.js").Locale }} L */

/** @param {L} l */
export const headerData = (l) => ({
	links: [
		{
			text: m.nav_why_bch({}, l),
			href: getPermalink("/bitcoin-cash"),
		},
		{
			text: m.nav_use({}, l),
			links: [
				{ text: m.nav_get_wallet({}, l), href: getPermalink("/onboard") },
				{ text: m.nav_compare_wallets({}, l), href: getPermalink("/wallet") },
				{ text: m.nav_buy_bch({}, l), href: getPermalink("/buy") },
				{ text: m.nav_spend_bch({}, l), href: getPermalink("/spend") },
				{ text: m.nav_earn_bch({}, l), href: getPermalink("/earn") },
				{ text: m.nav_accept_bch({}, l), href: getPermalink("/accept") },
				{ text: m.nav_country_guides({}, l), href: getPermalink("/guides") },
			],
		},
		{
			text: m.nav_build({}, l),
			links: [
				{ text: m.nav_build_with_bch({}, l), href: getPermalink("/build") },
				{ text: "CashTokens", href: getPermalink("/cashtokens") },
				{ text: m.nav_opcodes({}, l), href: getPermalink("/opcodes") },
				{ text: m.nav_upgrades({}, l), href: getPermalink("/upgrades") },
				{ text: "CHIPs", href: getPermalink("/chips") },
				{ text: m.nav_mining({}, l), href: getPermalink("/mining") },
			],
		},
		{
			text: m.nav_reference({}, l),
			links: [
				{ text: m.nav_all_reference({}, l), href: getPermalink("/reference") },
				{ text: m.nav_directory({}, l), href: getPermalink("/directory") },
				{ text: m.nav_glossary({}, l), href: getPermalink("/glossary") },
				{
					text: m.nav_utxo_machine({}, l),
					href: getPermalink("/what-is-a-utxo"),
				},
				{ text: m.nav_bch_vs_others({}, l), href: getPermalink("/compare") },
				{
					text: m.nav_state_of_bch({}, l),
					href: getPermalink("/state-of-bch"),
				},
				{ text: m.nav_honest_risks({}, l), href: getPermalink("/risks") },
				{
					text: m.nav_is_bch_dead({}, l),
					href: getPermalink("/is-bitcoin-cash-dead"),
				},
			],
		},
		{
			text: m.nav_support({}, l),
			href: getPermalink("/support"),
		},
		{
			text: m.nav_blog({}, l),
			href: getPermalink("/blog"),
		},
	],
	actions: [
		{
			variant: /** @type {const} */ ("primary"),
			text: m.nav_grab_wallet({}, l),
			href: getPermalink("/onboard"),
		},
	],
});

/** @param {L} l */
export const footerData = (l) => ({
	links: [
		{
			title: m.footer_use_bch({}, l),
			links: [
				{ text: m.nav_grab_wallet({}, l), href: getPermalink("/onboard") },
				{ text: m.nav_compare_wallets({}, l), href: getPermalink("/wallet") },
				{ text: m.nav_buy_bch({}, l), href: getPermalink("/buy") },
				{ text: m.nav_spend_bch({}, l), href: getPermalink("/spend") },
				{ text: m.nav_earn_bch({}, l), href: getPermalink("/earn") },
				{ text: m.nav_accept_bch({}, l), href: getPermalink("/accept") },
				{ text: m.nav_country_guides({}, l), href: getPermalink("/guides") },
			],
		},
		{
			title: m.nav_build_with_bch({}, l),
			links: [
				{ text: m.nav_build_with_bch({}, l), href: getPermalink("/build") },
				{ text: "CashTokens", href: getPermalink("/cashtokens") },
				{ text: m.nav_opcodes({}, l), href: getPermalink("/opcodes") },
				{ text: m.nav_upgrades({}, l), href: getPermalink("/upgrades") },
				{ text: "CHIPs", href: getPermalink("/chips") },
				{ text: m.nav_bch_mining({}, l), href: getPermalink("/mining") },
			],
		},
		{
			title: m.nav_reference({}, l),
			links: [
				{ text: m.nav_all_reference({}, l), href: getPermalink("/reference") },
				{ text: m.nav_directory({}, l), href: getPermalink("/directory") },
				{ text: m.nav_glossary({}, l), href: getPermalink("/glossary") },
				{
					text: m.nav_utxo_machine({}, l),
					href: getPermalink("/what-is-a-utxo"),
				},
				{ text: m.nav_bch_vs_others({}, l), href: getPermalink("/compare") },
				{
					text: m.nav_state_of_bch({}, l),
					href: getPermalink("/state-of-bch"),
				},
				{ text: m.nav_honest_risks({}, l), href: getPermalink("/risks") },
				{
					text: m.nav_is_bch_dead({}, l),
					href: getPermalink("/is-bitcoin-cash-dead"),
				},
			],
		},
		{
			title: m.footer_about({}, l),
			links: [
				{ text: m.nav_why_bch({}, l), href: getPermalink("/bitcoin-cash") },
				{ text: m.nav_support({}, l), href: getPermalink("/support") },
				{ text: m.nav_blog({}, l), href: getPermalink("/blog") },
				{ text: m.footer_about_site({}, l), href: getPermalink("/about") },
				{ text: m.footer_contact({}, l), href: getPermalink("/contact") },
			],
		},
	],
	secondaryLinks: [
		{ text: m.footer_terms({}, l), href: getPermalink("/terms-conditions") },
		{
			text: m.footer_privacy_policy({}, l),
			href: getPermalink("/privacy-policy"),
		},
	],
	socialLinks: [
		// { ariaLabel: 'X', icon: 'tabler:brand-x', href: 'https://twitter.com/bitcoincashsite' },
		// { ariaLabel: 'Telegram', icon: 'tabler:brand-telegram', href: 'https://t.me/bchworks' },
		// { ariaLabel: 'YouTube', icon: 'tabler:brand-youtube', href: 'https://youtube.com/@RealBitcoinCashSite' },
		// { ariaLabel: 'Reddit', icon: 'tabler:brand-reddit', href: 'https://www.reddit.com/r/BCHCashTokens/' },
		// { ariaLabel: 'Instagram', icon: 'tabler:brand-instagram', href: 'https://instagram.com/bitcoincashsite' },
		// { ariaLabel: 'LinkedIn', icon: 'tabler:brand-linkedin', href: 'https://www.linkedin.com/company/bitcoincashsite/' },
		// { ariaLabel: 'Facebook', icon: 'tabler:brand-facebook', href: 'https://facebook.com/bitcoincashsite' },
		// { ariaLabel: 'Github', icon: 'tabler:brand-github', href: 'https://github.com/Panmoni/bitcoincashsite-www' },
		// { ariaLabel: 'RSS', icon: 'tabler:rss', href: getAsset('/rss.xml') },
	],
	// HTML: Footer injects it with set:html. The logo and links are params so a
	// locale can move them; the anchor title is the only translatable attribute.
	footNote: `
  ${m.footer_footnote(
		{
			panmoni: `<img src="/panmoni.svg" alt="" class="inline h-[1em] w-[1em] align-[-0.15em] mx-0.5" aria-hidden="true" />
  <a target="_blank" rel="noopener noreferrer" href="https://www.panmoni.com/" title="${m.footer_panmoni_title({}, l)}" class="font-bold hover:underline">Panmoni</a>`,
			email: `<a target="_blank" rel="noopener noreferrer" href="mailto:hello@panmoni.com" class="font-bold hover:underline">hello@panmoni.com</a>`,
		},
		l,
	)}
  `,
});
