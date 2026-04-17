# Bitcoin Cash Site

Bitcoin Cash Site is an informational website about the cryptocurrency Bitcoin Cash (BCH). Learn how to build with Bitcoin Cash, how to earn, buy, spend, mine and use BCH to enhance your access to prosperity.

🌐 **Live Site**: [bchworks.com](https://bchworks.com)

## Features

- **Modern Stack**: Built with Astro 5.18.1 and Tailwind CSS 3.4.19
- **Performance**: Fast static site generation with optimized images
- **Accessibility**: WCAG-compliant components and semantic HTML
- **SEO Optimized**: Proper meta tags, sitemap, and structured data
- **Dark/Light Mode**: Theme switching with system preference detection
- **Responsive Design**: Mobile-first approach with responsive layouts
- **Type Safety**: Full TypeScript support with strict type checking

## Tech Stack

- **Framework**: [Astro](https://astro.build/) v5.18.1
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) v3.4.19
- **Icons**: [Astro Icon](https://github.com/natemoo-re/astro-icon) with Tabler icons
- **Linting**: [Biome](https://biomejs.dev/) for unified formatting and linting
- **Package Manager**: [pnpm](https://pnpm.io/) for fast, disk space efficient package management
- **Deployment**: Cloudflare Pages with automatic builds

## Getting Started

### Prerequisites

- Node.js 18.20.8 or higher (20.x or 22.x recommended)
- pnpm 8.x or higher

### Installation

```bash
# Clone the repository
git clone https://github.com/Panmoni/bchworks.git
cd bitcoincashsite-www

# Install dependencies
pnpm install

# Start development server
pnpm run dev
```

### Available Scripts

- `pnpm run dev` - Start development server
- `pnpm run build` - Build for production
- `pnpm run preview` - Preview production build locally
- `pnpm run check` - Run TypeScript and Biome checks
- `pnpm run format` - Format code with Biome
- `pnpm run lint` - Lint code with Biome

## Project Structure

```
bitcoincashsite-www/
├── src/
│   ├── components/     # Reusable UI components
│   ├── layouts/        # Page layout components
│   ├── pages/          # Page routes and content
│   ├── utils/          # Utility functions and helpers
│   └── assets/         # Images, fonts, and styles
├── public/             # Static assets
└── astro.config.mjs    # Astro configuration
```

## Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details on how to submit pull requests, report issues, and contribute to the project.

## Acknowledgments

- Built with [AstroWind](https://github.com/onwidget/astrowind/) template under the MIT license
- Icons from [Tabler Icons](https://tabler.io/icons)
- Fonts from [Fontsource](https://fontsource.org/)

## License

This project is open source and available under the [MIT License](LICENSE).
