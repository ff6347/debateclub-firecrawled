import { Transform } from "stream";
import through from "through2";
import split from "split2";
import { EOL } from "os";
import stringify from "json-stringify-safe";
import fs from "fs"; // Needed for createReadStream
import fsPromises from "fs/promises"; // Use promises version for readdir
import { pipeline } from "stream/promises";
import { createUniqueLinks } from "./common.ts";
import type { ExtractedLink } from "./types.ts";
import path from "path";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import type { Link } from "mdast"; // Correct type for markdown links
import { visit } from "unist-util-visit";

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

async function ndjsonExtract(
	directoryPath: string, // Changed parameter name
): Promise<ExtractedLink[]> {
	const allLinks: ExtractedLink[] = []; // Moved outside the loop

	try {
		const dirents = await fsPromises.readdir(directoryPath, {
			withFileTypes: true,
		});
		const ndjsonFiles = dirents
			.filter((dirent) => dirent.isFile() && dirent.name.endsWith(".ndjson"))
			.map((dirent) => path.join(directoryPath, dirent.name));

		if (ndjsonFiles.length === 0) {
			console.warn(
				`[ndjson] No .ndjson files found in directory: ${directoryPath}`,
			);
			return [];
		}

		console.info(
			`[ndjson] Found ${ndjsonFiles.length} .ndjson files to process in ${directoryPath}.`,
		);

		for (const filePath of ndjsonFiles) {
			// Loop through found files
			try {
				// Inner try-catch for individual file processing
				const rows = (await readNdjson(filePath)) as unknown as NDJsonRow[];
				const sourceFileRelative = path.relative(process.cwd(), filePath); // Store relative path

				for (const row of rows) {
					const context = row.text;
					// Consider adding a try-catch around remark parsing if needed
					const markdown = remark()
						.use(remarkParse)
						.use(remarkGfm)
						.parse(context);
					visit(markdown, "link", (node: Link) => {
						if (
							node.url &&
							(node.url.startsWith("http://") ||
								node.url.startsWith("https://"))
						) {
							allLinks.push({
								// Accumulate links
								url: node.url,
								sourceFile: sourceFileRelative,
								sourceJson: JSON.stringify(row),
							});
						}
					});
				}
				console.info(`[ndjson] Successfully processed ${filePath}`);
			} catch (error) {
				console.error(`[ndjson] Error processing file ${filePath}:`, error); // Log specific file error
				// Continue to the next file
			}
		} // End of loop for files
	} catch (dirError) {
		// Catch errors reading the directory itself
		console.error(
			`[ndjson] Error reading directory ${directoryPath}:`,
			dirError,
		);
		// Stop processing if we can't read the directory
		return [];
	}

	// Process accumulated links after the loop
	const uniqueLinks = createUniqueLinks(allLinks);

	console.info(
		`[ndjson] Extracted ${uniqueLinks.length} unique HTTP/HTTPS links from all files in ${directoryPath}.`, // Updated log
	);

	if (uniqueLinks.length > 0) {
		console.log("Inserting links into the database...");
		const linksToInsert: ExtractedLink[] = uniqueLinks.map(
			(link) =>
				({
					url: link.url,
					sourceFile: link.sourceFile,
					sourceJson: link.sourceJson,
				}) as ExtractedLink,
		);

		// Consider adding try-catch around insertLinks if needed
		console.log("[ndjson] Finished inserting links.");
		return linksToInsert;
	} else {
		console.log("[ndjson] No new links found to insert.");
		return [];
	}
}

export { stringifyFunc as stringify, parse, ndjsonExtract };
