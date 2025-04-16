# Debateclub Markdown Link Scraper 🧭🔗🧠

Tired of markdown files turning into link graveyards? This tool breathes life back into them! It automatically extracts links, crawls the content, grabs useful metadata, gets an AI-powered summary, and  tags everything, storing it all neatly in a Supabase database. ✨

Think of it as your personal web librarian and summarizer for all those interesting links scattered across your notes.

(Actually this scratches my own itch for work at HBK-BS to provide the students with some links for our upcoming AI debateclub event.)

## Features 🚀

* **Link Extraction:** Scans text files in a specified directory for `http/https` links.
* **Metadata Scraping:** Uses [Firecrawl](https://firecrawl.dev/) to fetch not just the markdown content of linked pages, but also metadata like title, description, keywords, and Open Graph image URLs.
* **AI Summarization:** Leverages the OpenAI API to generate concise summaries of the crawled content.
* **Intelligent Tagging:** Queries OpenAI for relevant tags, intelligently suggesting existing tags from your database first, and only adding a limited number of new ones if necessary.
* **Database Storage:** Persists link data, scraped content, metadata, summaries, and tags in a Supabase (PostgreSQL) database using a structured schema (`links`, `tags`, `link_tags` tables).
* **Concurrency Control:** Uses `p-limit` to manage concurrent scraping and summarization tasks gracefully.
* **CLI Interface:** Command-line operation with flags to control different stages of the process.

## Tech Stack 🔧

* Node.js / TypeScript
* Supabase (PostgreSQL) for the database
* Firecrawl.dev for scraping
* OpenAI API for summaries & tagging
* `direnv` for environment variable management

## Prerequisites 📋

* Node.js (Check `.node-version` for the recommended version, >=23 suggested)
* `npm` (comes with Node.js)
* `direnv` ([Installation Guide](https://direnv.net/))
* Access to a Supabase project (local or cloud)
* **Note:** The default configuration (`.envrc.example` & CLI defaults) assumes a **local** Supabase instance is running (via Supabase CLI).
* An OpenAI API Key
* (Optional) A Firecrawl API Key/Instance URL if not using the free tier or default endpoint or running your own instance.
* **Note:** The default configuration assumes a **local** Firecrawl instance is running at `http://localhost:3002` if `FIRECRAWL_API_URL` is not set.

## Installation & Setup ⚙️

1.  **Clone the repository:**
  ```bash
  git clone https://github.com/your-username/your-repo.git
  cd your-repo
  ```
2.  **Install dependencies:**
  ```bash
  npm install
  ```
3.  **Set up Environment Variables:**
  * Copy the example file: `cp .envrc.example .envrc`
  * Edit `.envrc` and fill in your actual `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, and `OPENAI_API_KEY`. Add `FIRECRAWL_API_KEY` or `FIRECRAWL_API_URL` if needed.
  * Run your local Firecrawl instance: `docker compose up -d`. See [Firecrawl Docs Self-Host](https://github.com/mendableai/firecrawl/blob/main/SELF_HOST.md) for more details.
  * Run your local Supabase instance: `supabase start`.
  * The default values in `.envrc.example` likely point to local instances for Supabase and Firecrawl.
  * Enable `direnv` for this directory: `direnv allow`

## Usage 💡

The main script is run via `node src/cli.ts`.

```bash
# Run all steps (extraction, crawl, summary)
node src/cli.ts

# Specify a different source directory for markdown files
node src/cli.ts --source-dir ./path/to/your/markdown

# Skip specific steps
node src/cli.ts --skip-extraction
node src/cli.ts --skip-crawl
node src/cli.ts --skip-summary

# Get help on options
node src/cli.ts --help
```

Place your source markdown files in the directory specified by `--source-dir` (defaults to `./source-files`).

## Environment Variables 🔑

Configure these in your `.envrc` file (loaded automatically by `direnv`):

* `FIRECRAWL_API_KEY` (Optional): Your Firecrawl API key if needed.
* `FIRECRAWL_API_URL` (Optional): Custom Firecrawl API endpoint.
* `SUPABASE_URL` (**Required**): URL for your Supabase project API.
* `SUPABASE_ANON_KEY` (**Required**): The public anonymous key for your Supabase project.
* `OPENAI_API_KEY` (**Required**): Your OpenAI API key for summarization/tagging.

## Development 🛠️

* **Watch Mode:** Run the script and automatically restart on file changes:
  ```bash
  npm run dev
  ```
* **Generate Supabase Types:** After any database schema changes, update the TypeScript types:
  ```bash
  supabase gen types --local > src/database.ts
  # or --project-id <your-project-ref> if using cloud
  ```
* **Run Tests:** (If/when tests are added)
  ```bash
  npm test
  ```

---

Happy Link Exploring! 🎉 