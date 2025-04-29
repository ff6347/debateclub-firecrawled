import { Transform } from "stream";
import through from "through2";
import split from "split2";
import { EOL } from "os";
import stringify from "json-stringify-safe";
import fs from "fs";
import { pipeline } from "stream/promises";
import { createUniqueLinks, insertLinks } from "./common.ts";
import type { ExtractedLink } from "./common.ts";
import path from "path";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import type { Link } from "mdast"; // Correct type for markdown links
import { visit } from "unist-util-visit";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.ts";

interface ParseOptions {
	strict?: boolean;
}

interface NDJsonRow {
	text: string;
	tags: string[];
}

function stringifyFunc() {
	return through.obj((obj, _, cb) => {
		cb(null, stringify(obj) + EOL);
	});
}

function parse(opts?: ParseOptions) {
	const options = opts ?? {};
	options.strict = opts?.strict !== false;

	function parseRow(this: Transform, row: string): NDJsonRow | undefined {
		try {
			if (row) return JSON.parse(row);
			return undefined;
		} catch (e: unknown) {
			if (e instanceof Error) {
				if (options.strict) {
					this.emit(
						"error",
						new Error(`Could not parse row "${row.slice(0, 50)}..."`),
					);
				}
			} else {
				this.emit("error", new Error(`Non-error thrown during parsing: ${e}`));
			}
			return undefined;
		}
	}

	return split(parseRow);
}

export async function readNdjson(
	filePath: string,
): Promise<Record<string, unknown>[]> {
	const objects: Record<string, unknown>[] = [];
	const parserStream = parse(); // Use the existing parse function

	const readStream = fs.createReadStream(filePath);

	// Create a transform stream to collect objects
	const collectStream = new Transform({
		objectMode: true,
		transform(obj, encoding, callback) {
			objects.push(obj);
			callback();
		},
	});

	try {
		await pipeline(readStream, parserStream, collectStream);
		return objects;
	} catch (error) {
		// Handle errors from the pipeline (read errors, parse errors)
		console.error("[readNdjson] Error processing file:", error);
		// Re-throw or handle specific errors as needed
		// If the error originated from fs.createReadStream (e.g., file not found),
		// it will likely be caught here by the pipeline.
		if (
			error instanceof Error &&
			(error as NodeJS.ErrnoException).code === "ENOENT"
		) {
			throw new Error(`File not found: ${filePath}`);
		}
		// Rethrow other errors (like strict parsing errors)
		throw error;
	}
}

async function parseNDJson(
	filePath: string,
	supabase: SupabaseClient<Database>,
) {
	const rows = (await readNdjson(filePath)) as unknown as NDJsonRow[];

	const allLinks: ExtractedLink[] = [];

	for (const row of rows) {
		try {
			const context = row.text;
			const markdown = remark().use(remarkParse).use(remarkGfm).parse(context);
			const sourceFileRelative = path.relative(process.cwd(), filePath); // Store relative path
			visit(markdown, "link", (node: Link) => {
				if (
					node.url &&
					(node.url.startsWith("http://") || node.url.startsWith("https://"))
				) {
					allLinks.push({
						url: node.url,
						sourceFile: sourceFileRelative,
						sourceJson: JSON.stringify(row),
					});
				}
			});
		} catch (error) {
			console.error(`[ndjson]: Error processing file ${filePath}: ${error}`);
		}
	}
	const uniqueLinks = createUniqueLinks(allLinks);

	console.info(
		`[ndjson] Extracted ${uniqueLinks.length} unique HTTP/HTTPS links.`,
	);

	if (uniqueLinks.length > 0) {
		console.log("Inserting links into the database...");
		const linksToInsert = uniqueLinks.map((link) => ({
			url: link.url,
			source_file: link.sourceFile,
			source_json: link.sourceJson,
		}));

		await insertLinks(supabase, linksToInsert);
	}
}

export { stringifyFunc as stringify, parse, parseNDJson };
