"use client";
import * as React from "react";
import { Button } from "@/components/ui/button";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { TagSidebar, type Tag } from "@/components/TagSidebar"; // Assuming Tag type is exported from TagSidebar
import FilterIcon from "@/components/filter-icon"; // Assuming this exists and is a default export

interface MobileSheetWrapperProps {
	// Remove tags prop
	// tags: Tag[];
}

export function MobileSheetWrapper({}: MobileSheetWrapperProps) {
	// Remove tags from destructuring
	return (
		<Sheet>
			<SheetTrigger asChild>
				<Button variant="outline" size="icon">
					{/* Ensure FilterIcon renders correctly as a component */}
					<FilterIcon />
					<span className="sr-only">Filter Tags</span>
				</Button>
			</SheetTrigger>
			<SheetContent side="right" className="w-[280px] p-0">
				<SheetHeader className="p-4 border-b">
					<SheetTitle>Filter by Tag</SheetTitle>
				</SheetHeader>
				{/* Render TagSidebar inside the sheet content - it fetches its own tags */}
				<TagSidebar />
			</SheetContent>
		</Sheet>
	);
}
