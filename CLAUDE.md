# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
pnpm install          # Install dependencies
pnpm dev              # Generate blog manifest + start dev server
pnpm build            # Generate blog manifest + production build
pnpm preview          # Preview production build
```

## Environment Setup

Create a `.env` file with `GEMINI_API_KEY` for the AI chat feature (uses Google Gemini 2.0 Flash).

## Architecture Overview

This is a multi-persona portfolio site for Skandesh built with React 19, TypeScript, Vite, and Three.js. It uses Tailwind CSS v4 locally via `@tailwindcss/vite` plugin (configured in `src/index.css`).

### Key Patterns

- **Path aliases**: Use `@/` for imports from `src/` directory (configured in `vite.config.ts` and `tsconfig.json`)
- **Routing**: React Router v7 with multi-profile structure:
  - `/` - ProfileSelector (landing page with persona selection)
  - `/tech` - Tech portfolio home
  - `/creative` - Creative portfolio home
  - `/travel` - Travel portfolio home
  - `/spirituality` - Spirituality portfolio home
  - `/blog/:slug` - Blog post pages
  - `/lab` - Experimental/lab section
- **Styling**: Tailwind v4 with custom theme (fonts: Inter, JetBrains Mono, Space Grotesk; colors: bg, surface, primary, accent)

### Core Components

- `Background3D.tsx` - WebGL shader backgrounds using @react-three/fiber with three switchable modes (FLUID, TERRAIN, VORTEX)
- `ChatInterface.tsx` - AI chat overlay powered by Gemini API (`services/geminiService.ts`)
- `TextScramble.tsx` - Animated text scramble effect using anime.js
- `InteractiveLab.tsx` - Experimental/lab section with interactive elements

### Pages

- `ProfileSelector.tsx` - Landing page for selecting persona/profile
- `Home.tsx` - Tech portfolio home page
- `CreativeHome.tsx` - Creative portfolio section
- `TravelHome.tsx` - Travel portfolio section
- `SpiritualityHome.tsx` - Spirituality portfolio section
- `ConstructionPage.tsx` - Under construction placeholder
- `LabPage.tsx` - Interactive experiments page
- `BlogPostPage.tsx` - Individual blog post renderer

### Blog System

Blog posts support both block-based content and MDX:
- Block types defined in `types/blog.ts`: `text`, `header`, `code`, `image`, `diagram`
- Static posts in `data/blogPosts.tsx`
- MDX support via `@mdx-js/react` and `@mdx-js/rollup`
- Blog manifest auto-generated to `src/generated/blog-manifest.ts`
- Rendered by `pages/BlogPostPage.tsx` with custom block renderers in `components/blog-blocks/`

## Code Conventions

- Use `&apos;` and `&quot;` for quotes in JSX text
- All `<img>` elements must have `alt` props
- Commit messages: single sentence, prefixed with user story/feature number, no attribution
