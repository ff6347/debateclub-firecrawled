# Project Briefing: Debateclub Markdown Link Scraper

## Core Purpose

This project aims to create a command-line tool that automatically processes markdown files found in a specified directory. It extracts HTTP/HTTPS links, scrapes content and metadata from the linked pages, generates AI-powered summaries and tags, and stores all collected information in a Supabase database.

The primary goal is to prevent links in markdown files from becoming "dead" or forgotten, transforming them into a searchable and summarized library. It serves as a personal web librarian for links found in notes.

## Key Features & Requirements

- Link Extraction: Identify and extract all `http/https` links from text files within a target directory.
- Web Content Scraping: Use Firecrawl to fetch the markdown content and relevant metadata (title, description, keywords, OG image) from each extracted link.
- AI Summarization: Utilize the OpenAI API to generate concise summaries of the scraped web page content.
- AI Tagging: Employ the OpenAI API to suggest relevant tags for each link. The system should prioritize using existing tags from the database and limit the creation of new tags.
- Database Storage: Persist all data (original link, scraped content, metadata, summary, tags) into a Supabase (PostgreSQL) database. Requires a schema with `links`, `tags`, and `link_tags` tables (or similar).
- Concurrency: Manage network requests (scraping, API calls) efficiently using `p-limit` or a similar concurrency control mechanism.
- CLI Interface: Provide a command-line interface (`src/cli.ts`) to run the tool, allowing users to:
  - Specify the source directory for markdown files.
  - Optionally skip stages (extraction, crawl, summary).
  - View help/options.

## Initial Tech Stack

- Node.js / TypeScript
- Supabase (PostgreSQL)
- Firecrawl.dev (API or self-hosted)
- OpenAI API
- `direnv` for environment management
- `npm` for package management 