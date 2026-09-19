# Repository instructions

## Scope and precedence

These instructions apply to the Ameer Portfolio repository. Follow them with any higher-level workspace instructions; `CLAUDE.md` is supplementary repository guidance. Keep changes limited to the requested work and preserve unrelated working-tree edits.

## Repository map

- `src/pages/index.astro` is the single-page entry point.
- `src/components/` contains the homepage UI, including `Container.astro` and `AIChat.astro`.
- Markdown content lives under `src/pages/<section>/`; `Container.astro` loads it with globs.
- `src/data/ai-prompt.md` is the server-side chatbot prompt and intentionally sits outside `src/pages`.
- `src/pages/api/chat.ts` proxies chatbot requests to Gemini.
- `public/` contains static assets such as the resume and profile images.

## Setup and commands

- Requires Node.js 20.x (`package.json` engines).
- Install dependencies with `npm install`.
- Run locally with `npm run dev` (or `npm start`).
- Build with `npm run build`; preview with `npm run preview`.
- Run Astro checks manually with `npm run astro -- check`; no test or lint script is configured.

## Implementation conventions

- Add or edit portfolio content as Markdown under the existing section folders and use the existing frontmatter shape.
- Wire homepage sections through `src/components/Container.astro`.
- Keep presentation in Astro/Tailwind/daisyUI patterns already used by the repository.
- Do not move Markdown prompt data into `src/pages`, because files there become public routes.

## Verification

- For content-only changes, inspect the rendered route and run `npm run build`.
- For Astro/type-sensitive changes, also run `npm run astro -- check`.
- Confirm that no unintended files or generated output are included in the diff.

## Security and data handling

- Keep `GEMINI_API_KEY` in local/Vercel environment configuration; never commit it or expose it to client code.
- Treat `src/data/ai-prompt.md` as public-behavior configuration: it contains personal profile information and controls chatbot responses.
- Do not place secrets or private records in Markdown content served from `src/pages`.

## Documentation

- Update `README.md` or `CLAUDE.md` when commands or architecture change materially.
- Keep this file concise and repository-specific; do not duplicate general workspace policy.
