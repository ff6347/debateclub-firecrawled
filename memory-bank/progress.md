# Project Progress: Debateclub Markdown Link Scraper

## Current Status (as of initial Memory Bank setup)

- A first working draft of the CLI tool exists (`src/cli.ts`).
- The core functionality described in the `README.md` and `briefing.md` is implemented:
  - Link extraction from source files.
  - Web content and metadata scraping via Firecrawl.
  - AI summarization via OpenAI.
  - AI tagging via OpenAI (including suggestion of existing tags).
  - Data persistence to a Supabase database.
  - Basic CLI interface with options to specify source directory and skip steps.
  - Concurrency management is likely in place (mentioned as a feature).

## What Works

- The end-to-end pipeline (extract -> crawl -> summarize -> tag -> store) is functional for *markdown* sources.
- **Refactored `ndjsonExtract`:** This function now correctly processes directories of `.ndjson` files and returns extracted links.
- **Testing for `ndjsonExtract`:** Unit tests covering directory handling for NDJSON extraction are in place (`test/ndjson.test.ts`).
- Configuration via `.envrc` and `direnv` is set up.
- Local development workflow (`npm run dev`, `supabase gen types`) is defined.

## What's Left / Next Steps (Initial thoughts - needs refinement)

- **Integrate `ndjsonExtract` results:** The main extraction logic (`src/extract.ts` likely) needs to call the refactored `ndjsonExtract` and handle inserting the returned links into the database.
- **Implement NDJSON Import:** Add functionality to import links/tags from Drafts.app NDJSON exports, including weighted summarization (see `active-context.md` for details). This is now partially addressed by the `ndjsonExtract` refactor but needs full integration.
- **Testing:** No tests mentioned (`npm test` script exists but likely empty or placeholder). Comprehensive tests (unit, integration) are needed *for the overall pipeline and markdown extraction*. Test coverage for `ndjsonExtract` has been added.
- **Error Handling:** Robustness needs evaluation. How does it handle network errors, API failures, invalid links, large files, rate limits?
- **Scalability/Performance:** Assess performance with a large number of links or large source files. Optimize concurrency settings.
- **Schema Evolution:** How are database schema changes managed beyond the initial setup? (Migrations setup using Supabase CLI seems implied but not explicitly stated as fully implemented for *this tool's tables*).
- **User Feedback:** The CLI output could potentially be improved for clarity.
- **Frontend Integration:** The README mentions a related frontend (`debateclub-fe`), but the integration points or data flow aren't detailed in this repo's README. Define how the frontend consumes the data stored by this scraper.
- **Documentation:** While the README is good, inline code comments or more detailed documentation on specific modules might be needed. Memory Bank needs population beyond this initial setup.

## Known Issues (Assumed - needs verification)

- Potential sensitivity to API key validity and network issues.
- Lack of automated tests.

## Decisions & Evolution

- **Initial Scope:** Defined by the features listed in the `README.md`.
- **Technology Choices:** Node.js/TS, Supabase, Firecrawl, OpenAI selected.
- **Development Environment:** Defaulting to local Supabase/Firecrawl instances managed via CLI/Docker. 