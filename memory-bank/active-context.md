# Active Context: Initial Setup & Understanding

## Current Focus

- **Initializing the Memory Bank:** Populating the core Memory Bank files (`briefing.md`, `project-context.md`, `tech-context.md`, `system-patterns.md`, `progress.md`) based on the existing `README.md`, `package.json`, and the understanding that the initial version described is functional.
- **Establishing Baseline:** Understanding the project's purpose, features, tech stack, architecture, and current progress state as documented.
- **NDJSON Tag Import Integration:** Tag import from NDJSON is now automatic and robust, with blacklist support and decoupling from summarization.

## Recent Changes

- Created the `memory-bank` directory.
- Populated the core Memory Bank markdown files with initial content derived from project documentation (`README.md`, `package.json`).
- **Updated CLI Argument Handling:** Renamed `--source-dir` to `--markdown-files` (short `-m`). Removed default paths for both `--markdown-files` and `--ndjson-files`. Added validation to require exactly one of these flags and ensure they are mutually exclusive.
- **NDJSON Tag Import:** Tag import from NDJSON is now invoked automatically after link insertion (not a separate script). Only newly inserted links are processed for tags, not all links with `source_json`.
- **Tag Blacklist:** Tags like `links` (and any others in the blacklist) are filtered out during tag import. Blacklisted tags are not upserted or associated. This prevents meaningless or organizational tags from polluting the tag DB.
- **All logic is in `src/common.ts` and called from `extractLinks` in `src/extract.ts`.**
- **Summarization and tag import are now decoupled.**
- **NDJSON import is now a first-class, robust workflow.**

## Next Steps

- **Review & Refine:** Review the generated Memory Bank content for accuracy and completeness based on actual code and deeper project knowledge.
- **Identify Immediate Tasks:** Based on the `progress.md` (e.g., lack of tests, potential error handling gaps), prioritize the next development tasks.
- **Code Exploration:** Dive deeper into the actual `src/cli.ts` and related modules to validate the assumptions made in `system-patterns.md` and `progress.md`.

## Future Ideas / Planned Features

- **LDJSON Import from Drafts.app:**
  - **Goal:** Allow importing links and associated context/tags directly from LDJSON files exported by Drafts.app.
  - **CLI:** Add a `--ldjson-files` flag (mutually exclusive with `--source-dir`).
  - **Parsing:** Read LDJSON line-by-line, extract `text` and `tags` array.
  - **Processing (New Links):** Extract links from `text`. Scrape content. Generate summary using *both* LDJSON `text` (weighted slightly higher) and scraped content via OpenAI. Generate tags using LDJSON `tags` as initial input to OpenAI (prioritize existing DB tags, aim for ~5 total, limit new). Store link, scraped data, combined summary, final tags.
  - **Processing (Existing Links):** Add LDJSON `tags` to the existing link's tag associations in the DB. Do not re-process.
  - **Status:** Idea recorded, implementation pending.

## Active Decisions & Considerations

- Assuming the `README.md` accurately reflects the state of the "first working draft".
- Using the `project-memory` rule structure as the guide for documentation.
- **Filtering meaningless tags (like 'links') is crucial to keep the tag DB clean.**
- **Only processing new links for tags avoids redundant DB work and keeps the workflow efficient.**

## Important Patterns & Preferences

- Adhering to project rules: `markdown-formatting`, `cleanup-dead-code`, `file-naming`, `npm-usage`, `plan-confirmation`, `supabase-cli-rule`, `default-behaviour`.
- Using `direnv` for environment variables is standard practice.
- Supabase CLI is the tool for DB management.
- Exact npm dependency versions are preferred.

## Learnings & Insights

- The project provides a useful utility for managing links within markdown notes.
- It integrates several external APIs (Firecrawl, OpenAI, Supabase).
- The initial setup seems well-documented in the README, providing a good starting point.
- Core functionality appears to be working, but areas like testing and robustness likely need attention.
- **Filtering and blacklisting tags at import is essential for data quality.**
- **Decoupling tag import from summarization increases flexibility and maintainability.** 