# Technical Context: Debateclub Markdown Link Scraper

## Core Technologies

- **Runtime:** Node.js (`>=23.0.0` specified in `package.json`)
- **Language:** TypeScript (`^5.8.3`)
- **Package Manager:** npm (using `package.json` and likely `package-lock.json`)
- **Database:** Supabase (PostgreSQL) - Accessed via `@supabase/supabase-js` (`2.45.0`).
- **Web Scraping:** Firecrawl.dev - Accessed via `@mendable/firecrawl-js` (`1.23.9`).
- **AI Services:** OpenAI API - Accessed via `openai` (`4.58.1`).
- **Environment Management:** `direnv` for loading `.envrc` files.
- **Concurrency:** `p-limit` (`5.0.0`).
- **Markdown/Text Processing:**
  - `glob` (`11.0.1`) for finding files.
  - `cheerio` (`1.0.0-rc.12`) for HTML parsing (likely within Firecrawl results or custom processing).
  - `marked` (`13.0.2`), `remark` (`15.0.1`), `remark-gfm` (`4.0.1`), `remark-parse` (`11.0.0`), `unist-util-visit` (`5.0.0`) for markdown parsing/processing.
- **Build System:** `esbuild` (`0.25.2`) for building the project (see `npm run build`).
- **Linting/Formatting:**
  - `oxlint` (`0.16.6`)
  - `prettier` (`3.5.3`) with specific project configuration.

## Development Setup & Prerequisites

1.  **Node.js & npm:** Required (`>=23.0.0`).
2.  **`direnv`:** Required for automatic environment variable loading. Needs installation and `direnv allow`.
3.  **Supabase Project:** Access needed (local or cloud). Requires `SUPABASE_URL`, `SUPABASE_ANON_KEY`. `SUPABASE_SERVICE_ROLE_KEY` likely needed too.
4.  **OpenAI API Key:** Required (`OPENAI_API_KEY`).
5.  **Firecrawl:**
    - API key (`FIRECRAWL_API_KEY`) might be needed.
    - Custom API URL (`FIRECRAWL_API_URL`) can be specified.
    - Default: Local Firecrawl instance via Docker (`docker compose up -d`) at `http://localhost:3002`.
6.  **Local Supabase Instance:** Default assumption is a local instance managed by the Supabase CLI (`supabase start`).
7.  **Installation:** Clone repo, run `npm install` (or `npm ci` if `package-lock.json` exists).
8.  **Configuration:** Copy `.envrc.example` to `.envrc`, fill credentials, run `direnv allow`.

## Key Dependencies (`package.json`)

**Production:**
- `@mendable/firecrawl-js`: 1.23.9
- `@supabase/supabase-js`: 2.45.0
- `cheerio`: 1.0.0-rc.12
- `glob`: 11.0.1
- `marked`: 13.0.2
- `openai`: 4.58.1
- `p-limit`: 5.0.0
- `remark`: 15.0.1
- `remark-gfm`: 4.0.1
- `remark-parse`: 11.0.0
- `unist-util-visit`: 5.0.0

**Development:**
- `@types/node`: 22.14.1
- `@types/p-limit`: 2.1.0
- `esbuild`: 0.25.2
- `oxlint`: 0.16.6
- `prettier`: 3.5.3
- `tabtab`: 3.0.2 (Likely for CLI autocompletion)
- `typescript`: 5.8.3

## Technical Constraints & Assumptions

- Primarily designed as a CLI tool (`src/cli.ts`).
- Relies on external APIs (Supabase, OpenAI, Firecrawl).
- Assumes markdown files as input source.
- Default local dev setup uses Supabase CLI and Firecrawl Docker container.
- Database schema needs to exist.

## Development Workflow

- **Run:** `node src/cli.ts [options]` (or `npm run dev`)
- **Build:** `npm run build` (uses `esbuild.config.js`)
- **DB Type Generation:** `supabase gen types --local > src/database.ts`
- **Testing:** `npm test` (currently outputs an error message). 