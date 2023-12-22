import { getPermalink, getBlogPermalink, getAsset } from './utils/permalinks';

export const headerData = {
  links: [
    {
      text: 'Earn',
      href: getPermalink('/earn'),
    },
    {
      text: 'Buy',
      href: getPermalink('/buy'),
    },
    {
      text: 'Spend',
      href: getPermalink('/spend'),
    },
    {
      text: 'Build',
      href: getPermalink('/build'),
    },
    {
      text: 'Support',
      href: getPermalink('/support'),
    },
    {
      text: 'Blog',
      href: getPermalink('/blog'),
    },
  ],
  actions: [
    // { text: 'Download', href: 'https://github.com/onwidget/astrowind', target: '_blank' }
  ],
};

export const footerData = {
  links: [
    {
      title: 'Use BCH',
      links: [
        { text: 'Grab a Wallet', href: getPermalink('/onboard') },
        { text: 'Earn BCH', href: getPermalink('/earn') },
        { text: 'Buy BCH', href: getPermalink('/buy') },
        { text: 'Spend BCH', href: getPermalink('/spend') },
      ],
    },
    {
      title: 'Build with BCH',
      links: [
        { text: 'Build with BCH', href: getPermalink('/build') },
        { text: 'Accept BCH', href: getPermalink('/accept') },
        { text: 'CashTokens', href: getPermalink('/cashtokens') },
        { text: 'BCH Mining', href: getPermalink('/mining') },
        { text: 'BCH Governance', href: getPermalink('/bch-governance') },
      ],
    },
    {
      title: 'Support',
      links: [{ text: 'BCH Support', href: getPermalink('/support') }],
    },
    {
      title: 'About',
      links: [
        { text: 'About BCH', href: getPermalink('/bitcoin-cash') },
        { text: 'About this Site', href: getPermalink('/about') },
        { text: 'Blog', href: getPermalink('/blog') },
      ],
    },
  ],
  secondaryLinks: [
    { text: 'Terms', href: getPermalink('/terms-conditions') },
    { text: 'Privacy Policy', href: getPermalink('/privacy-policy') },
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
  <span class="w-5 h-5 md:w-6 md:h-6 md:-mt-0.5 bg-cover mr-1.5 float-left rounded-sm bg-[url(https://www.realbitcoinfam.com/favicon.ico)]"></span>
  A <a target="_blank" href="https://www.RealBitcoinFam.com/"><span class="text-accent">Real Bitcoin Fam</span> project</a>. Content <a target="_blank" href="https://creativecommons.org/licenses/by/4.0/">CC-BY</a>. Contact <a target="_blank" href="mailto:hello@panmoni.com"><span class="text-primary">hello@panmoni.com</span></a>. <span class="text-sm">*some external links are affiliate links.</span> <br />
  BCH Vision 2021 NFT Series: <a href="https://explorer.salemkode.com/token/792eb291fee60820bc04fcdde48c73fa23a2a35756fe01c7164f5b5ce783f5f2" target="_blank">792eb291fee60820bc04fcdde48c73fa23a2a35756fe01c7164f5b5ce783f5f2</a>
  `,
};
