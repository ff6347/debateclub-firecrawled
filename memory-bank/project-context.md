# Project Context: Debateclub Markdown Link Scraper

## Problem Addressed

Markdown files often accumulate numerous links over time. These links can become stale, forgotten, or difficult to revisit and understand their context without manually clicking through each one. This makes valuable information scattered across notes less accessible and useful. The manual process of revisiting, understanding, and organizing these links is time-consuming.

Specifically, this tool originated from the need to provide students with curated and summarized links for an AI debate club event (`HBK-BS`).

## Goals & Solution

The goal is to transform these scattered markdown links into an organized, searchable, and summarized knowledge base.

The solution is a command-line tool that automates the process:
1.  **Extraction:** It finds links in designated markdown files.
2.  **Enrichment:** It crawls the linked web pages using Firecrawl to get content and metadata (titles, descriptions, etc.).
3.  **Understanding:** It uses the OpenAI API to generate summaries and relevant tags for the content.
4.  **Persistence:** It stores the original link, extracted content, metadata, summary, and tags in a Supabase database.

This turns a passive collection of links into an active, curated library.

## Intended User Experience

The user (likely a developer or someone managing notes in markdown) should be able to:
- Point the tool at their source files by providing *either* a path to markdown files (`--markdown-files`) or NDJSON files (`--ndjson-files`).
- Run a simple command (`node src/cli.ts [arguments]`).
- Have the tool automatically process all links found.
- Access the enriched link data (content, summary, tags) through the Supabase database (presumably via a separate frontend or direct queries).
- Control the processing steps (e.g., skip summarization) via CLI flags.
- Easily configure the tool using environment variables (`.envrc`). 