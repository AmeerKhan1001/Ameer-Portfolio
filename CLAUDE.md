# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start dev server (astro dev)
- `npm run build` — production build
- `npm run preview` — preview a production build locally
- `npm run astro -- <cmd>` — run any Astro CLI subcommand (e.g. `npm run astro -- check`)

No test runner, linter, or type-check script is configured in `package.json`. `tsconfig.json` exists but there is no `astro check` wired into any script — run `npm run astro -- check` manually if verifying types.

Deploy target is Vercel (`@astrojs/vercel` adapter, `output: 'server'` in `astro.config.mjs`). Vercel env var `GEMINI_API_KEY` must be set for the AI chat feature to work in production; locally it reads from `.env` (gitignored).

## Architecture

**This is a single-page site with no content collections.** Everything renders from `src/pages/index.astro`, which builds `Header` → `AIChat` → `Container` → `Footer` inside its own hand-rolled `<html>` document. There is no `BaseLayout.astro` — it was removed as dead/unused.

### Data model: markdown-as-data, not Astro Content Collections

There is no `src/content/config.ts`. Instead, every "collection" (about, works, studies, projects, certificates, courses-taught, sessions, contact) is a folder of loose `.md` files directly under `src/pages/<folder>/`, e.g. `src/pages/works/work1.md`, `src/pages/projects/SSS.md`. `src/components/Container.astro` pulls each folder in via `import.meta.glob('../pages/<folder>/*.md', { eager: true })` and reads frontmatter fields (`title`, `date`, `tags`, `url`, `location`, `org`) with no schema/validation.

**Important side effect: because these markdown files live under `src/pages`, Astro's file-based router builds each one as a live, unstyled, standalone public route** (e.g. `/works/work1`), purely because of where they sit on disk — not an intentional design. The AI chat's system prompt used to live at `src/pages/prompts/ai-prompt.md` and leaked the same way; it has since been moved to `src/data/ai-prompt.md`, which sits outside `src/pages` and is no longer routable.

To add/remove a section from the homepage, edit the `AccordionLayout` entries in `src/components/Container.astro` — adding a markdown file to an existing folder is picked up automatically by the glob, no wiring needed.

### AI chat feature (Gemini-backed)

- `src/components/AIChat.astro` — homepage widget, posts `{ query }` to `/api/chat`, renders markdown responses via CDN-loaded `marked` and sanitizes with CDN-loaded `DOMPurify` (there is no npm `dompurify` dependency — it was removed as unused).
- `src/pages/api/chat.ts` — server route (enabled by `output: 'server'`) that proxies to Google Gemini (currently `gemini-flash-latest`) using `GEMINI_API_KEY`, reading `src/data/ai-prompt.md` server-side and injecting it as the system instruction. The client only ever sends `{ query }` — the persona prompt is not client-supplied and is not present in the page source.
- `src/data/ai-prompt.md` — the full persona/system prompt: personal details, career history, response-style rules. Treat edits here as directly changing what the public chatbot says about Ameer. It lives outside `src/pages`, so it is not served as a public route.

### Styling

- Tailwind + daisyUI, themes `lofi` (light) and `black` (dark, default), toggled via the `theme-change` library and persisted to `localStorage`. `tailwind.config.mjs` only extends font family (DM Sans); all color/spacing tokens come from daisyUI themes, not Tailwind's own `theme.colors`.
- `src/styles/global.css` has a global rule forcing 12px font-size under 480px width, and duplicated `.container` flex-direction media query blocks (same rule appears twice).

### Known dead/inconsistent state (useful context, not yet cleaned up)

- `Container.astro` references a real resume PDF (`public/resume-ameer-khan.pdf`), wired into a working "Resume" section.
- Only one entry currently exists in `works/`, `projects/`, and `courses-taught/` each, despite the folders supporting multiple files.
