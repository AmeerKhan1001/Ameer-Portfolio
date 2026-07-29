# Portfolio Refresh — Design

Date: 2026-07-29
Status: Approved

## Goal

Refresh Ameer's portfolio (`Ameer-Portfolio`) to support an active job search (via career-ops), optimized for recruiter/hiring-manager trust with minimum wasted effort. Primary audience: recruiters and hiring managers for Senior/Staff Full Stack (.NET + React/Next.js) and Applied AI/AI-SDLC roles.

## Scope (approved)

1. Content parity with `career-ops/cv.md` (current title, real projects, updated bio)
2. Kill visible "unfinished" signals (dead resume link, `lang="gl"`, leaked `/prompts/ai-prompt` route, dead commented-out sections)
3. Real downloadable CV (career-ops-generated ATS PDF)
4. AI chat overhaul as the centerpiece feature (current model, proper auth, refreshed persona, no longer publicly leaked)
5. Visual redesign: Gemini-app-style full-viewport dark hero as the landing experience, with existing detailed sections tucked behind a collapsed "Prefer text?" disclosure
6. Hosting migration: Netlify → Vercel, `GEMINI_API_KEY` as a proper Vercel encrypted env var (never committed)
7. Remove genuinely dead deps: `framer-motion`, `astro-compress` (unused, zero risk)

**Explicitly out of scope** (real schedule risk, no hiring-facing benefit — deferred): Astro 4→5 major bump, full Astro Content Collections refactor.

## Entrepreneurship framing (decided)

Downplay to a soft one-liner folded into the bio/skills area (not a dedicated section): "occasional freelance web development for architecture/design studios." No GST/co-founder framing — reduces flight-risk/conflict-of-interest read at larger employers while keeping the business-acumen signal.

## Homepage restructure

- **Hero (above the fold, full viewport, dark theme default):** centered greeting (e.g. time-of-day-aware, "What's on your mind about Ameer?" style) above a pill-shaped chat input, styled after the Gemini app reference image — subtle radial gradient dark background, minimal chrome.
- **"Prefer text?" disclosure (collapsed by default, below the fold):** expands to reveal the existing About / Work / Studies / Projects / Certifications / Contact accordion stack, restyled to the new dark-first palette (currently daisyUI `lofi`/`black` — keep the toggle, but this section no longer needs to carry the whole page's first impression).
- The AI chat becomes the primary interaction, not a widget bolted onto an accordion stack.

## Content changes

- `src/pages/works/work1.md`: update to current title/dates from `career-ops/cv.md`.
- New `src/pages/projects/property-report.md`: Home Value Paid Report — from `cv.md`.
- New `src/pages/projects/xomegpt.md`: currently only a one-line mention inside `work1.md` — promote to a full project entry (Azure OpenAI API + chart.js, internal AI tool) from `cv.md`.
- `src/pages/about/about.md`: rewritten bio matching `cv.md`/career-ops `_profile.md` narrative (Senior Full Stack Engineer, 6+ yrs, AI-SDLC work); entrepreneurship folded in per the framing decision above.
- Resume: generate/export an ATS PDF via career-ops (`/career-ops pdf`) and link it from the "Prefer text?" section, replacing the dead `/cv-20240219.pdf` reference in `Container.astro`.

## Bug fixes

- `lang="gl"` → `lang="en"` (both `index.astro` and `BaseLayout.astro`).
- Finish the commented-out "Files/Resume" section in `Container.astro` (real PDF link); leave "Blogs" section removed/deleted (not resurrected — no content plan for it).
- Fix duplicated `.container` flex-direction media-query block in `src/styles/global.css` (same rule appears twice).
- Remove the nested-`<html>`-document bug: `AccordionLayout.astro` should not route through `BaseLayout.astro` when already inside `index.astro`'s own document (or `BaseLayout` gets removed if it stays unused after the restructure).

## AI chat overhaul

- `src/pages/api/chat.ts`: model → `gemini-flash-latest`; switch auth from `?key=` query param to `X-goog-api-key` header (per user-supplied reference `curl`).
- Move `src/pages/prompts/ai-prompt.md` → `src/data/ai-prompt.md` (out of `src/pages`, so it's no longer routable as a public page). Refresh its content to match current `cv.md`/`_profile.md` (title, real projects, AI-SDLC narrative) instead of the stale bio.
- `src/components/AIChat.astro`: restyle to the full-hero treatment — larger centered pill input, response area appears inline below as the user asks, matching the reference image's visual language (not a bordered "card" box).
- `GEMINI_API_KEY`: written to local `.env` (already gitignored — confirmed), set as an encrypted Vercel env var in production. Never hardcoded, never committed.

## Hosting migration

- Swap `@astrojs/netlify` → `@astrojs/vercel` in `astro.config.mjs`; remove Netlify-specific files/config once Vercel build is confirmed working.
- `vercel env add GEMINI_API_KEY production` — proper encrypted secret.
- Per project rules (`CLAUDE.md` deploy rule): build must pass locally before any `vercel --prod`, and the actual production deploy requires Ameer's explicit go-ahead — this plan executes everything up to a verified local build; the deploy command itself is listed and only run on confirmation.
- Old Netlify site (`ameer-khan-portfolio.netlify.app`) stays live until Vercel cutover is confirmed; README/links updated after cutover.

## Dependency cleanup

- Remove `framer-motion` and `astro-compress` from `package.json` (confirmed unused anywhere in `src/`, zero functional risk).

## Security

- The Gemini API key was shared in plaintext chat. It is written only to `.env` (gitignored) and Vercel's encrypted env store — never to a committed file. Recommend Ameer additionally restrict the key (HTTP referrer restriction to the Vercel domain) in Google AI Studio once live.

## Out of scope (explicitly deferred)

- Astro 4→5 major version bump
- Full Astro Content Collections refactor (type-safe schemas for all data folders)

Both carry real build/schedule risk with no recruiter-facing benefit — revisit post-job-search if desired.
