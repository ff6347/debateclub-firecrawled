#!/usr/bin/env node
import { parseArgs } from 'node:util';
import { createSupabaseClient } from './supabase-client.ts';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.ts'; // Also use .js here
import { extractLinks } from './extract.ts';
import { scrapePendingLinks } from './scrape.ts'; // Import the scrape function
import { summarizePendingContent } from './summarize.ts'; // Import summarize function


const options = {
	'source-dir': { type: 'string', short: 's', default: './source-files' },
	'supabase-url': { type: 'string', short: 'd', default: 'http://localhost:54321' }, // Note: We'll likely switch to DB connection string later for Supabase
	'firecrawl-api-url': { type: 'string' }, // Default handled by Firecrawl client or env var
	'ollama-base-url': { type: 'string' }, // Default handled by env var or http://localhost:11434
	'ollama-model': { type: 'string' }, // Default handled by env var, required if not skipping summary
	concurrency: { type: 'string', default: '5' }, // Parse as string, convert to number later
	'skip-extraction': { type: 'boolean', default: false },
	'skip-crawl': { type: 'boolean', default: false },
	'skip-summary': { type: 'boolean', default: false },
	'reset-db': { type: 'boolean', default: false }, // Note: May need rethinking for Supabase migrations
	help: { type: 'boolean', short: 'h' },
} as const; // Use 'as const' for stricter type checking if needed, though parseArgs types might be sufficient

function printHelp() {
	console.log(`Usage: node src/cli.ts [options]

Options:
  -s, --source-dir <path>      Path to source markdown files (default: ./source-files)
  -d, --supabase-url <url>     URL to Supabase Postgrest API (default: env SUPABASE_URL)
      --firecrawl-api-url <url> Firecrawl API URL (default: env FIRECRAWL_API_URL or library default)
      --concurrency <number>   Max concurrent crawls/summaries (default: 5)
      --skip-extraction        Skip finding and adding new links
      --skip-crawl             Skip crawling pending links
      --skip-summary           Skip summarizing crawled content
      --reset-db               Delete and recreate the database [Note: May change for Supabase]
  -h, --help                   Display this help message
`);
	process.exit(0);
}

async function main() {
	let values: ReturnType<typeof parseArgs<{ options: typeof options }>>['values'];
	try {
		// Explicitly provide the options type argument to parseArgs
		const args = parseArgs({
			options,
			allowPositionals: false, // No positional arguments expected
			strict: true, // Throw on unknown options
		});
		values = args.values;
	} catch (err: any) {
		console.error(`Argument parsing error: ${err.message}`);
		console.log('Run with --help for usage information.');
		process.exit(1);
	}

	if (values.help) {
		printHelp();
		process.exit(0);
	}

	console.log('Parsed CLI arguments:', values);

	// --- Placeholder for future logic ---

	// 1. Validate args/env vars (e.g., ollama-model if needed, database connection)
	console.log('Validating arguments and environment variables...');

	const supabaseUrl = values['supabase-url'] || process.env['SUPABASE_URL'];
	const supabaseAnonKey = process.env['SUPABASE_ANON_KEY']; // No CLI arg for this

	if (!supabaseUrl) {
		console.error('Error: --supabase-url argument or SUPABASE_URL environment variable is required.');
		process.exit(1);
	}
	if (!supabaseAnonKey) {
		console.error('Error: SUPABASE_ANON_KEY environment variable is required.');
		process.exit(1);
	}

	const concurrency = parseInt(values.concurrency ?? '5', 10);
	if (isNaN(concurrency) || concurrency < 1) {
		console.error(`Invalid concurrency value: ${values.concurrency}. Must be a positive integer.`);
		process.exit(1);
	}
	console.log('Validation successful.');

	// 2. Initialize DB connection (Supabase client)
	console.log('Initializing Supabase client...');
	let supabase: SupabaseClient<Database>; // Explicitly type the client
	try {
		supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey);
		// Test connection with a simple query
		console.log('Testing Supabase connection...');
		const { error: testError } = await supabase.from('links').select('id').limit(1);
		if (testError) {
			// Don't throw if table doesn't exist yet, but log other errors
			if (testError.code !== '42P01') { // 42P01: undefined_table
				throw new Error(`Supabase connection test failed: ${testError.message}`);
			}
			console.log('Supabase connection ok, but \'links\' table might not exist yet.');
		} else {
			console.log('Supabase connection successful.');
		}
	} catch (error: any) {
		console.error(`Error initializing Supabase client or testing connection: ${error.message}`);
		process.exit(1);
	}

	// 3. If !skip-extraction: Run link extraction
	if (!values['skip-extraction']) {
		console.log('Starting link extraction...');
		try {
			await extractLinks(values['source-dir']!, supabase);
			console.log('Link extraction completed.');
		} catch (error: any) {
			console.error(`Error during link extraction: ${error.message}`);
			// Optionally exit, or let subsequent steps proceed if desired
			// process.exit(1);
		}
	} else {
		console.log('Skipping link extraction.');
	}

	// 4. If !skip-crawl: Run scraping
	if (!values['skip-crawl']) {
		console.log('Starting scraping...');
		try {
			// Get Firecrawl params from args or env
			const firecrawlApiKey = values['firecrawl-api-url'] || process.env['FIRECRAWL_API_KEY'];
			const firecrawlApiUrl = values['firecrawl-api-url'] || process.env['FIRECRAWL_API_URL'];
			await scrapePendingLinks(supabase, concurrency, firecrawlApiKey, firecrawlApiUrl);
			console.log('Scraping completed.');
		} catch (error: any) {
			console.error(`Error during scraping: ${error.message}`);
			// Optionally exit
			// process.exit(1);
		}
	} else {
		console.log('Skipping scraping.');
	}

	// 5. If !skip-summary: Run summarization
	if (!values['skip-summary']) {
		console.log('Starting summarization...');
		try {
			// Call summarizePendingContent without Ollama parameters
			await summarizePendingContent(supabase, concurrency);
			console.log('Summarization completed.');
		} catch (error: any) {
			console.error(`Error during summarization: ${error.message}`);
			// Optionally exit
			// process.exit(1);
		}
	} else {
		console.log('Skipping summarization.');
	}

	console.log('CLI execution finished.'); // Updated final message
}

main().catch((error) => {
	console.error('Unhandled error in main execution:', error);
	process.exit(1);
});
