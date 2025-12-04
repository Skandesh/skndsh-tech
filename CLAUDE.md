# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
pnpm install          # Install dependencies
pnpm dev              # Start dev server on port 3000
pnpm build            # Production build
pnpm preview          # Preview production build
```

## Environment Setup

Create a `.env` file with `GEMINI_API_KEY` for the AI chat feature (uses Google Gemini 2.0 Flash).

## Architecture Overview

This is a personal portfolio site for Skandesh built with React 19, TypeScript, Vite, and Three.js. It uses Tailwind CSS via CDN (configured in `index.html`).

### Key Patterns

- **Path aliases**: Use `@/` for imports from `src/` directory (configured in `vite.config.ts` and `tsconfig.json`)
- **Routing**: React Router v7 with three routes: `/` (Home), `/blog/:slug`, `/lab`
- **Styling**: Tailwind via CDN with custom theme (fonts: Inter, JetBrains Mono, Space Grotesk; colors: bg, surface, primary, accent)

### Core Components

- `Background3D.tsx` - WebGL shader backgrounds using @react-three/fiber with three switchable modes (FLUID, TERRAIN, VORTEX)
- `ChatInterface.tsx` - AI chat overlay powered by Gemini API (`services/geminiService.ts`)
- `TextScramble.tsx` - Animated text scramble effect using anime.js
- `InteractiveLab.tsx` - Experimental/lab section with interactive elements

### Blog System

Blog posts use a block-based content system defined in `types/blog.ts`:
- Block types: `text`, `header`, `code`, `image`, `diagram`
- Posts defined in `data/blogPosts.tsx`
- Rendered by `pages/BlogPostPage.tsx` with custom block renderers in `components/blog-blocks/`

## Code Conventions

- Use `&apos;` and `&quot;` for quotes in JSX text
- All `<img>` elements must have `alt` props
- Commit messages: single sentence, prefixed with user story/feature number, no attribution
