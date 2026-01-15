import path from 'path';
import { fileURLToPath } from 'url';

import { defineConfig, squooshImageService } from 'astro/config';

import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';
import mdx from '@astrojs/mdx';
import partytown from '@astrojs/partytown';
// import compress from 'astro-compress';
// import icon from 'astro-icon';

import tasks from './src/utils/tasks';

import { readingTimeRemarkPlugin, responsiveTablesRehypePlugin } from './src/utils/frontmatter.mjs';

import { ANALYTICS, SITE } from './src/utils/config.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const whenExternalScripts = (items = []) =>
  ANALYTICS.vendors.googleAnalytics.id && ANALYTICS.vendors.googleAnalytics.partytown
    ? Array.isArray(items)
      ? items.map((item) => item())
      : [items()]
    : [];

export default defineConfig({
  site: SITE.site || 'https://bchworks.com',
  base: SITE.base,
  trailingSlash: SITE.trailingSlash ? 'always' : 'never',

  output: 'static',

  image: {
    service: squooshImageService(),
  },

  integrations: [
    tailwind({
      applyBaseStyles: false,
    }),
    ...(SITE.site ? [sitemap()] : []),
    mdx(),
    // icon({
    //   include: {
    //     tabler: ['*'],
    //     'flat-color-icons': [
    //       'template',
    //       'gallery',
    //       'approval',
    //       'document',
    //       'advertising',
    //       'currency-exchange',
    //       'voice-presentation',
    //       'business-contact',
    //       'database',
    //     ],
    //   },
    // }),

    ...whenExternalScripts(() =>
      partytown({
        config: { forward: ['dataLayer.push'] },
      })
    ),

    tasks(),

    // compress({
    //   CSS: true,
    //   HTML: false,
    //   Image: false,
    //   JavaScript: true,
    //   SVG: true,
    //   Logger: 1,
    // }),
  ],

  markdown: {
    remarkPlugins: [readingTimeRemarkPlugin],
    rehypePlugins: [responsiveTablesRehypePlugin],
    syntaxHighlight: 'shiki',
    shikiConfig: {
      theme: 'material-theme-palenight',
      integrations: [mdx()],
      langs: [
        'js',
        'javascript',
        'html',
        'css',
        'astro',
        'json',
        'ts',
        'tsx',
        'jsx',
        'mdx',
        'md',
        'yml',
        'yaml',
        'toml',
        'python',
        'graphql',
      ],
      wrap: true,
    },
  },

  vite: {
    resolve: {
      alias: {
        '~': path.resolve(__dirname, './src'),
      },
    },
  },
});
