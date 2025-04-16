"use client";

import * as React from "react";
import Fuse from "fuse.js";
import { Input } from "@/components/ui/input";

// Export the Tag interface
export interface Tag {
	name: string;
	count: number;
	// Add other relevant properties if needed, e.g., slug for links
	slug?: string;
}

interface TagSidebarProps {
	// Remove tags from props, as we'll load them via event
	// tags: Tag[];
	onTagSelect?: (tag: Tag) => void; // Optional callback for when a tag is clicked
}

export function TagSidebar({ onTagSelect }: TagSidebarProps) {
	const [tags, setTags] = React.useState<Tag[]>([]);
	const [searchTerm, setSearchTerm] = React.useState("");
	// Change state to hold an array of active tags
	const [activeFilterTags, setActiveFilterTags] = React.useState<string[]>([]); // Initialize as empty array

	// Effect to listen for the custom event to load initial tags
	React.useEffect(() => {
		const handleTagsUpdate = (event: CustomEvent<Tag[]>) => {
			console.log("TagSidebar received tags:", event.detail);
			setTags(event.detail);
		};

		document.addEventListener(
			"tags-updated",
			handleTagsUpdate as EventListener,
		);
		console.log("TagSidebar listening for tags-updated event");

		// Request initial tags in case the event fired before listener was ready
		document.dispatchEvent(new CustomEvent("request-tags"));

		// Cleanup listener on unmount
		return () => {
			document.removeEventListener(
				"tags-updated",
				handleTagsUpdate as EventListener,
			);
		};
	}, []); // Empty dependency array ensures this runs only once on mount

	// Log when searchTerm changes (for debugging sidebar input)
	React.useEffect(() => {
		console.log("Search Term Updated:", searchTerm);
	}, [searchTerm]);

	// Sort tags by count descending initially
	const sortedTags = React.useMemo(() => {
		console.log("Sorting tags:", tags);
		return [...tags].sort((a, b) => b.count - a.count);
	}, [tags]);

	// Initialize Fuse instance
	const fuse = React.useMemo(() => {
		console.log("Initializing Fuse with:", sortedTags);
		return new Fuse(sortedTags, {
			keys: ["name"],
			threshold: 0.3, // Adjust threshold for fuzziness (0 = exact, 1 = match anything)
			includeScore: false,
		});
	}, [sortedTags]);

	// Filter tags based on search term
	const filteredTagsInSidebar = React.useMemo(() => {
		if (!searchTerm.trim()) {
			console.log("Search empty, showing all sorted tags:", sortedTags);
			return sortedTags; // Show all sorted tags if search is empty
		}
		const results = fuse.search(searchTerm);
		console.log("Fuse search results for", searchTerm, ":", results);
		const items = results.map((result) => result.item);
		console.log("Filtered tags items:", items);
		return items;
	}, [searchTerm, fuse, sortedTags]);

	// Handle clicking a tag to filter the MAIN CONTENT (Multi-select)
	const handleFilterClick = (tag: Tag) => {
		const tagName = tag.name;
		let newActiveTags: string[];

		if (activeFilterTags.includes(tagName)) {
			// Tag is already active, remove it (toggle off)
			newActiveTags = activeFilterTags.filter((t) => t !== tagName);
			console.log("Removing filter:", tagName, "New filters:", newActiveTags);
		} else {
			// Tag is not active, add it (toggle on)
			newActiveTags = [...activeFilterTags, tagName];
			console.log("Adding filter:", tagName, "New filters:", newActiveTags);
		}

		setActiveFilterTags(newActiveTags); // Update state

		if (onTagSelect) {
			// Call original prop if needed
			onTagSelect(tag);
		}
		// Dispatch event for the main page script with the full array
		document.dispatchEvent(
			new CustomEvent("filter-change", { detail: newActiveTags }),
		);
	};

	// Handle clicking the explicit "Clear All Filters" button
	const clearMainFilters = () => {
		setActiveFilterTags([]); // Set to empty array
		document.dispatchEvent(new CustomEvent("filter-change", { detail: [] })); // Dispatch empty array
		console.log("Clearing all main content filters via button");
	};

	return (
		<div className="flex flex-col h-full">
			<div className="p-4 sticky top-0 bg-background z-10 border-b">
				<Input
					type="text"
					placeholder="Filter tags in list..."
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					className="w-full"
				/>
				{/* Update Clear Filter button logic */}
				{activeFilterTags.length > 0 && (
					<button
						onClick={clearMainFilters}
						className="mt-2 text-xs text-blue-600 hover:underline w-full text-center"
					>
						Clear {activeFilterTags.length} filter
						{activeFilterTags.length > 1 ? "s" : ""}
					</button>
				)}
			</div>
			<div className="flex-1 overflow-y-auto p-4 pt-2">
				{filteredTagsInSidebar.length > 0 ? (
					<ul className="space-y-1">
						{filteredTagsInSidebar.map((tag) => (
							<li key={tag.name}>
								<button
									onClick={() => handleFilterClick(tag)}
									className={`w-full text-left px-2 py-1 rounded transition-colors text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 ${
										activeFilterTags.includes(tag.name)
											? "tag-button-active font-medium"
											: ""
									}`}
								>
									{tag.name} ({tag.count})
								</button>
							</li>
						))}
					</ul>
				) : (
					<p className="text-sm text-muted-foreground text-center pt-4">
						No tags found.
					</p>
				)}
			</div>
		</div>
	);
}
