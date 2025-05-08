#!/usr/bin/env node
import { parseArgs } from "node:util";
import { createSupabaseClient } from "./supabase-client.ts";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.ts";
import { extractLinks } from "./extract.ts";
import { scrapePendingLinks } from "./scrape.ts";
import { summarizePendingContent } from "./summarize.ts";

const options = {
	"markdown-files": { type: "string", short: "m" },
	"ndjson-files": { type: "string", short: "n" },
	"ollama-base-url": { type: "string" },
	"openai-model": { type: "string", default: "gpt-4.1-nano" },
	concurrency: { type: "string", default: "5" },
	"skip-extraction": { type: "boolean", default: false },
	"skip-crawl": { type: "boolean", default: false },
	"skip-summary": { type: "boolean", default: false },
	help: { type: "boolean", short: "h" },
} as const;

function printHelp() {
	console.log(`Usage: npx debateclub [options]

Environment Variables:
  SUPABASE_URL         (Required) URL to Supabase project
  SUPABASE_SERVICE_ROLE_KEY    (Required) Supabase service role key
  FIRECRAWL_API_KEY    (Required if not running locally) Firecrawl API key
  FIRECRAWL_API_URL    (Optional) Firecrawl API base URL (defaults to https://api.firecrawl.dev)
  OPENAI_API_KEY       (Required) OpenAI API key
  OPENAI_MODEL         (Optional) OpenAI model name (defaults to gpt-4.1-nano)
Options:

      --ndjson-files <path>    Path to NDJSON files (mutually exclusive with --markdown-files)
  -m, --markdown-files <path>      Path to source markdown files
      --ollama-base-url <url>  Ollama base URL (overrides env var)
      --ollama-model <model>   Ollama model name (overrides env var)
      --concurrency <number>   Max concurrent operations (default: 5)
      --skip-extraction        Skip finding and adding new links
      --skip-crawl             Skip crawling pending links
      --skip-summary           Skip summarizing crawled content
      --help, -h               Display this help message
`);
	process.exit(0);
}

async function main() {
	let values: ReturnType<
		typeof parseArgs<{ options: typeof options }>
	>["values"];
	try {
		const args = parseArgs({
			options,
			allowPositionals: false,
			strict: true,
		});
		values = args.values;
	} catch (err: any) {
		console.error(`Argument parsing error: ${err.message}`);
		console.log("Run with --help for usage information.");
		process.exit(1);
	}

	if (values.help) {
		printHelp();
	}

	console.log("Validating arguments and environment variables...");

	// --- Add Validation for markdown/ndjson files ---
	const markdownFilesPath = values["markdown-files"];
	const ndjsonFilesPath = values["ndjson-files"];

	if (!markdownFilesPath && !ndjsonFilesPath) {
		console.error(
			"Error: Either --markdown-files or --ndjson-files must be specified.",
		);
		printHelp();
	}
	if (markdownFilesPath && ndjsonFilesPath) {
		console.error(
			"Error: --markdown-files and --ndjson-files are mutually exclusive.",
		);
		printHelp();
	}
	// --- End Validation ---

	const supabaseUrl = process.env["SUPABASE_URL"] ?? "http://localhost:54321";
	const supabaseServiceRoleKey = process.env["SUPABASE_SERVICE_ROLE_KEY"];
	const supabaseAnonKey = process.env["SUPABASE_ANON_KEY"];
	const firecrawlApiKey = process.env["FIRECRAWL_API_KEY"];
	const firecrawlApiUrl = process.env["FIRECRAWL_API_URL"];
	const openaiModel = values["openai-model"] ?? process.env["OPENAI_MODEL"];

	if (!supabaseUrl) {
		console.error("Error: SUPABASE_URL environment variable is required.");
		printHelp();
	}
	if (!supabaseServiceRoleKey) {
		console.error(
			"Error: SUPABASE_SERVICE_ROLE_KEY environment variable is required.",
		);
		printHelp();
	}
	if (!supabaseAnonKey) {
		console.error("Error: SUPABASE_ANON_KEY environment variable is required.");
		printHelp();
	}

	if (!firecrawlApiUrl) {
		console.error("Error: FIRECRAWL_API_URL environment variable is required.");
		printHelp();
	}
	if (!firecrawlApiUrl?.includes("localhost") && !firecrawlApiKey) {
		console.error(
			"Error: FIRECRAWL_API_KEY environment variable is required when FIRECRAWL_API_URL is not localhost.",
		);
		printHelp();
	}

	const concurrency = parseInt(values.concurrency ?? "5", 10);
	if (isNaN(concurrency) || concurrency < 1) {
		console.error(
			`Invalid concurrency value: ${values.concurrency}. Must be a positive integer.`,
		);
		printHelp();
	}

	console.log("Args and environment variables validated successfully.");

	console.log("Testing Supabase connection...");
	let supabase: SupabaseClient<Database>;
	try {
		if (!supabaseUrl || !supabaseServiceRoleKey) {
			console.error(
				"Critical Error: Supabase URL or Key is undefined despite passing validation.",
			);
			process.exit(1);
		}
		supabase = createSupabaseClient({ supabaseUrl, supabaseServiceRoleKey });
		console.log("Testing Supabase connection...");
		const { data, error: testError } = await supabase
			.from("links")
			.select("id", { count: "exact", head: true });
		console.info({ data, error: testError });
		if (testError && testError.code !== "42P01") {
			throw new Error(`Supabase connection test failed: ${testError.message}`);
		}
		console.log("Supabase connection successful (or table doesn't exist yet).");
	} catch (error: any) {
		console.error(
			`Error initializing Supabase client or testing connection: ${error.message}`,
		);
		process.exit(1);
	}

	if (!values["skip-extraction"]) {
		console.log("Starting link extraction...");
		try {
			// Determine mode and path based on validated flags
			const isMarkdownMode = !!markdownFilesPath; // Use the variable defined in the validation block
			const sourcePath = (
				isMarkdownMode ? markdownFilesPath : ndjsonFilesPath
			)!; // One must exist due to validation

			await extractLinks({
				sourceDir: sourcePath, // Use the unified path variable
				supabase,
				isMarkdownMode,
			});
			console.info("Link extraction completed.");
		} catch (error: any) {
			console.error(`Error during link extraction: ${error.message}`);
		}
	} else {
		console.log("Skipping link extraction.");
	}

	if (!values["skip-crawl"]) {
		console.log("Starting scraping...");
		try {
			const scrapeParams = {
				supabase,
				concurrency,
				firecrawlApiUrl: firecrawlApiUrl!,
				...(firecrawlApiKey && { firecrawlApiKey: firecrawlApiKey }),
			};
			await scrapePendingLinks(scrapeParams);
			console.log("Scraping completed.");
		} catch (error: any) {
			console.error(`Error during scraping: ${error.message}`);
		}
	} else {
		console.log("Skipping scraping.");
	}

	if (!values["skip-summary"]) {
		console.log("Starting summarization...");
		if (!openaiModel) {
			console.error("Ollama model not configured, cannot summarize.");
		} else {
			try {
				await summarizePendingContent(supabase, concurrency, openaiModel);
				console.log("Summarization completed.");
			} catch (error: any) {
				console.error(`Error during summarization: ${error.message}`);
			}
		}
	} else {
		console.log("Skipping summarization.");
	}

	console.log("Execution finished.");
}

main().catch((error) => {
	console.error("Unhandled error in main execution:", error);
	process.exit(1);
});
