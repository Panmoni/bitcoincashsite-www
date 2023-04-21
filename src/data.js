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
    //{ type: 'button', text: 'Grab a Wallet', href: getPermalink('/onboard') }
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
        { text: 'BCH Mining', href: getPermalink('/mining') },
        { text: 'BCH Tools', href: getPermalink('/tools') },
        { text: 'BCH Governance', href: getPermalink('/bch-governance') },
        { text: 'CashTokens', href: getPermalink('/cashtokens') },
      ],
    },
    {
      title: 'Support',
      links: [
        { text: 'BCH Support', href: getPermalink('/support') },
      ],
    },
    {
      title: 'About',
      links: [
        { text: 'About BCH', href: getPermalink('/bitcoin-cash')  },
        { text: 'About this Site', href: getPermalink('/about')  },
        { text: 'Blog', href: getPermalink('/blog')  },
      ],
    },
  ],
  secondaryLinks: [
    { text: 'Terms', href: getPermalink('/terms-conditions') },
    { text: 'Privacy Policy', href: getPermalink('/privacy-policy') },
  ],
  socialLinks: [
    { ariaLabel: 'Twitter', icon: 'tabler:brand-twitter', href: 'https://twitter.com/bitcoincashsite' },
    { ariaLabel: 'Telegram', icon: 'tabler:brand-telegram', href: 'https://t.me/bitcoincashsite' },
    { ariaLabel: 'YouTube', icon: 'tabler:brand-youtube', href: 'https://youtube.com/@RealBitcoinCashSite' },
    { ariaLabel: 'Instagram', icon: 'tabler:brand-instagram', href: 'https://instagram.com/bitcoincashsite' },
    { ariaLabel: 'Facebook', icon: 'tabler:brand-facebook', href: 'https://facebook.com/bitcoincashsite' },
    { ariaLabel: 'Github', icon: 'tabler:brand-github', href: 'https://github.com/Panmoni/bitcoincashsite-www' },
    { ariaLabel: 'RSS', icon: 'tabler:rss', href: getAsset('/rss.xml') },
  ],
  footNote: `
    <span class="w-5 h-5 md:w-6 md:h-6 md:-mt-0.5 bg-cover mr-1.5 float-left rounded-sm bg-[url(https://www.realbitcoinfam.com/favicon.ico)]"></span>
    A <a target="_blank" href="https://www.RealBitcoinFam.com/"><span class="text-accent">Real Bitcoin Fam</span> project</a>. Content <a target="_blank" href="https://creativecommons.org/licenses/by/4.0/">CC-BY</a>. Contact <a target="_blank" href="mailto:hello@panmoni.com">hello@panmoni.com</a>.
  `,
};
