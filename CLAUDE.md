# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start dev server (astro dev)
- `npm run build` — production build
- `npm run preview` — preview a production build locally
- `npm run astro -- <cmd>` — run any Astro CLI subcommand (e.g. `npm run astro -- check`)

No test runner, linter, or type-check script is configured in `package.json`. `tsconfig.json` exists but there is no `astro check` wired into any script — run `npm run astro -- check` manually if verifying types.

Deploy target is Netlify (`@astrojs/netlify` adapter, `output: 'server'` in `astro.config.mjs`). Live at https://ameer-khan-portfolio.netlify.app/. Netlify env var `GEMINI_API_KEY` must be set for the AI chat feature to work in production; locally it reads from `.env` (gitignored).

## Architecture

**This is a single-page site with no content collections.** Everything renders from `src/pages/index.astro`, which builds `Header` → `AIChat` → `Container` → `Footer` inside its own hand-rolled `<html>` document (it does not use `BaseLayout.astro` — that layout is effectively dead/unused at the top level).

### Data model: markdown-as-data, not Astro Content Collections

There is no `src/content/config.ts`. Instead, every "collection" (about, works, studies, projects, certificates, courses-taught, sessions, contact, blogs, prompts) is a folder of loose `.md` files directly under `src/pages/<folder>/`, e.g. `src/pages/works/work1.md`, `src/pages/projects/SSS.md`. `src/components/Container.astro` pulls each folder in via `import.meta.glob('../pages/<folder>/*.md', { eager: true })` and reads frontmatter fields (`title`, `date`, `tags`, `url`, `location`, `org`) with no schema/validation.

**Important side effect: because these markdown files live under `src/pages`, Astro's file-based router builds each one as a live, unstyled, standalone public route** (e.g. `/works/work1`, `/prompts/ai-prompt`), purely because of where they sit on disk — not an intentional design. This includes `src/pages/prompts/ai-prompt.md`, which is the AI chat's system prompt (see below) and is therefore also served as a raw public page.

To add/remove a section from the homepage, edit the `AccordionLayout` entries in `src/components/Container.astro` — adding a markdown file to an existing folder is picked up automatically by the glob, no wiring needed.

### AI chat feature (Gemini-backed)

- `src/components/AIChat.astro` — homepage widget, posts to `/api/chat`, renders markdown responses via CDN-loaded `marked` and sanitizes with CDN-loaded `DOMPurify` (not the npm `dompurify` import).
- `src/pages/api/chat.ts` — server route (enabled by `output: 'server'`) that proxies to Google Gemini (currently `gemini-1.5-flash`) using `GEMINI_API_KEY`, injecting `src/pages/prompts/ai-prompt.md` as the system instruction. No auth, no rate limiting.
- `src/pages/prompts/ai-prompt.md` — the full persona/system prompt: personal details, career history, response-style rules. Treat edits here as directly changing what the public chatbot says about Ameer.

### Styling

- Tailwind + daisyUI, themes `lofi` (light, default) and `black` (dark), toggled via the `theme-change` library and persisted to `localStorage`. `tailwind.config.mjs` only extends font family (DM Sans); all color/spacing tokens come from daisyUI themes, not Tailwind's own `theme.colors`.
- `src/styles/global.css` has a global rule forcing 12px font-size under 480px width, and duplicated `.container` flex-direction media query blocks (same rule appears twice).

### Known dead/inconsistent state (useful context, not yet cleaned up)

- `framer-motion` and `astro-compress` are installed but unused/unregistered.
- `Container.astro` references a resume PDF (`const PDF = "/cv-20240219.pdf"`) that doesn't exist in `public/`; the "Files/Resume" and "Blogs" accordion sections are fully coded but commented out.
- `lang="gl"` (Galician) is set on the root `<html>`, left over from the upstream template this was forked from (credited in README) — should be `en`.
- Only one entry currently exists in `works/`, `projects/`, and `courses-taught/` each, despite the folders supporting multiple files.
