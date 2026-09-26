import { getPermalink } from "./utils/permalinks";

export const headerData = {
	links: [
		{
			text: "Why BCH",
			href: getPermalink("/bitcoin-cash"),
		},
		{
			text: "Earn",
			href: getPermalink("/earn"),
		},
		{
			text: "Buy",
			href: getPermalink("/buy"),
		},
		{
			text: "Spend",
			href: getPermalink("/spend"),
		},
		{
			text: "Build",
			href: getPermalink("/build"),
		},
		{
			text: "Support",
			href: getPermalink("/support"),
		},
		{
			text: "Blog",
			href: getPermalink("/blog"),
		},
	],
	actions: [
		{
			variant: /** @type {const} */ ("primary"),
			text: "Grab a Wallet",
			href: getPermalink("/onboard"),
		},
	],
};

export const footerData = {
	links: [
		{
			title: "Use BCH",
			links: [
				{ text: "Grab a Wallet", href: getPermalink("/onboard") },
				{ text: "Earn BCH", href: getPermalink("/earn") },
				{ text: "Buy BCH", href: getPermalink("/buy") },
				{ text: "Spend BCH", href: getPermalink("/spend") },
			],
		},
		{
			title: "Build with BCH",
			links: [
				{ text: "Build with BCH", href: getPermalink("/build") },
				{ text: "Accept BCH", href: getPermalink("/accept") },
				{ text: "CashTokens", href: getPermalink("/cashtokens") },
				{ text: "BCH Mining", href: getPermalink("/mining") },
			],
		},
		{
			title: "Support",
			links: [{ text: "BCH Support", href: getPermalink("/support") }],
		},
		{
			title: "About",
			links: [
				{ text: "Why BCH", href: getPermalink("/bitcoin-cash") },
				{ text: "About this Site", href: getPermalink("/about") },
				{ text: "Blog", href: getPermalink("/blog") },
			],
		},
	],
	secondaryLinks: [
		{ text: "Terms", href: getPermalink("/terms-conditions") },
		{ text: "Privacy Policy", href: getPermalink("/privacy-policy") },
	],
	socialLinks: [
		// { ariaLabel: 'X', icon: 'tabler:brand-x', href: 'https://twitter.com/bitcoincashsite' },
		// { ariaLabel: 'Telegram', icon: 'tabler:brand-telegram', href: 'https://t.me/bitcoincashsite' },
		// { ariaLabel: 'YouTube', icon: 'tabler:brand-youtube', href: 'https://youtube.com/@RealBitcoinCashSite' },
		// { ariaLabel: 'Reddit', icon: 'tabler:brand-reddit', href: 'https://www.reddit.com/r/BCHCashTokens/' },
		// { ariaLabel: 'Instagram', icon: 'tabler:brand-instagram', href: 'https://instagram.com/bitcoincashsite' },
		// { ariaLabel: 'LinkedIn', icon: 'tabler:brand-linkedin', href: 'https://www.linkedin.com/company/bitcoincashsite/' },
		// { ariaLabel: 'Facebook', icon: 'tabler:brand-facebook', href: 'https://facebook.com/bitcoincashsite' },
		// { ariaLabel: 'Github', icon: 'tabler:brand-github', href: 'https://github.com/Panmoni/bitcoincashsite-www' },
		// { ariaLabel: 'RSS', icon: 'tabler:rss', href: getAsset('/rss.xml') },
	],
	footNote: `
  A <img src="/panmoni.svg" alt="" class="inline h-[1em] w-[1em] align-[-0.15em] mx-0.5" aria-hidden="true" />
  <a target="_blank" rel="noopener noreferrer" href="https://www.panmoni.com/" title="Panmoni is a Web3 product studio" class="font-bold hover:underline">Panmoni</a> project. Contact <a target="_blank" rel="noopener noreferrer" href="mailto:hello@panmoni.com" class="font-bold hover:underline">hello@panmoni.com</a>. *Includes affiliate links.
  `,
};
