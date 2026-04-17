# Contributing to Bitcoin Cash Site

Thank you for your interest in contributing to Bitcoin Cash Site! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

Please be respectful and considerate of others when contributing to this project. We aim to foster an inclusive and welcoming community.

## How to Contribute

### Reporting Issues

If you find a bug or have a feature request, please check the existing issues first to avoid duplicates. When creating a new issue:

1. Use a clear and descriptive title
2. Describe the steps to reproduce the issue
3. Include any relevant screenshots or error messages
4. Specify your environment (OS, browser, Node.js version)

### Submitting Pull Requests

1. **Fork the repository** and create your branch from `main`
2. **Install dependencies** with `pnpm install`
3. **Make your changes** following the code style guidelines
4. **Test your changes** with `pnpm run check` and `pnpm run build`
5. **Commit your changes** using conventional commit format
6. **Push to your fork** and open a pull request

## Development Setup

### Prerequisites

- Node.js 18.20.8 or higher (20.x or 22.x recommended)
- pnpm 8.x or higher

### Installation

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/bitcoincashsite-www.git
cd bitcoincashsite-www

# Install dependencies
pnpm install

# Start development server
pnpm run dev
```

### Development Workflow

1. **Start the dev server**: `pnpm run dev`
2. **Run checks**: `pnpm run check` (TypeScript + Biome)
3. **Format code**: `pnpm run format` (Biome formatting)
4. **Build for production**: `pnpm run build`

## Code Style Guidelines

### TypeScript/JavaScript

- Use TypeScript for all new code
- Follow the existing code style and patterns
- Use meaningful variable and function names
- Add appropriate type annotations
- Avoid `any` type when possible

### Astro Components

- Use PascalCase for component file names
- Keep components focused and reusable
- Use slots for flexible content
- Follow Astro best practices for performance

### CSS/Tailwind

- Use Tailwind CSS utility classes
- Follow mobile-first responsive design
- Use CSS variables for theming
- Keep styles scoped to components

### Commit Messages

We use [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

Types:

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Examples:

```
feat(ui): add dark mode toggle component
fix(types): resolve TypeScript errors in utils
docs(readme): update installation instructions
```

## Testing

Before submitting a pull request:

1. Run `pnpm run check` to ensure no TypeScript or Biome errors
2. Run `pnpm run build` to ensure the project builds successfully
3. Test your changes in the browser
4. Verify responsive behavior on different screen sizes

## Project Structure

Understanding the project structure will help you navigate the codebase:

- `src/components/` - Reusable UI components
  - `common/` - Shared components (Header, Footer, etc.)
  - `ui/` - Basic UI components (Button, Form, etc.)
  - `widgets/` - Page section components
  - `blog/` - Blog-specific components
- `src/layouts/` - Page layout components
- `src/pages/` - Page routes and content
- `src/utils/` - Utility functions and helpers
- `public/` - Static assets (images, fonts, etc.)

## Getting Help

If you need help or have questions:

1. Check the existing documentation
2. Look at similar code in the codebase
3. Open a discussion in the issues section
4. Ask for clarification in your pull request

## License

By contributing to Bitcoin Cash Site, you agree that your contributions will be licensed under the project's MIT License.
