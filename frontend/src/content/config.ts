import { defineCollection, z } from 'astro:content';
import { supabase } from '../lib/supabase'; // Adjust path if necessary

// --- SCHEMA WITHOUT created_at ---
const linkSchema = z.object({
  id: z.string(),
  db_id: z.number(),
  title: z.string().nullable(),
  description: z.string().nullable(),
  markdown_content: z.string().nullable(),
  summary: z.string().nullable(),
  url: z.string().url(),
  tags: z.array(z.string()).default([]),
});
// --- END OF SCHEMA ---

// Define a more flexible type for the expected Supabase response structure
type SupabaseLinkTag = {
  tags: {
    name: string;
  } | null; // The nested 'tags' object might be null
};

type SupabaseLink = {
  id: number;
  title: string | null;
  description: string | null;
  markdown_content: string | null;
  summary: string | null;
  url: string;
  link_tags: SupabaseLinkTag[] | null; // link_tags relation is an array of link objects, or null
};

// Define the 'links' collection
const linksCollection = defineCollection({
  schema: linkSchema,
  loader: async () => {
    console.log('Fetching links from Supabase (Flat Loader, No Date)...');

    const { data, error } = await supabase
      .from('links')
      .select(
        `id, title, description, markdown_content, summary, url, link_tags(tags(name))`
      );

    if (error) {
      console.error('Error fetching links from Supabase:', error);
      throw error;
    }
    if (!data) {
      console.log('No data returned from Supabase.');
      return {};
    }

    const fetchedLinks = data as unknown as SupabaseLink[];
    console.log(`Fetched ${fetchedLinks.length} links.`);

    // Map to flat structure
    const entries = fetchedLinks.map(link => {
      const entryId = String(link.id);
      let tags: string[] = [];
      if (link.link_tags && Array.isArray(link.link_tags)) {
        tags = link.link_tags
          .map(lt => lt.tags?.name)
          .filter((name): name is string => !!name);
      }

      // Flat data without created_at
      const flatPreValidationData = {
        id: entryId,
        db_id: link.id,
        title: link.title,
        description: link.description,
        markdown_content: link.markdown_content,
        summary: link.summary,
        url: link.url,
        tags: tags,
      };
      return flatPreValidationData;
    });

    // Filter using the schema
    const validatedEntries = entries.filter(entry => {
      try {
        linkSchema.parse(entry);
        return true;
      } catch (e: any) {
        const identifier = entry.url || `ID ${entry.id}`;
        console.warn(
          `Flat Entry (${identifier}) failed validation (No Date). Error: ${e.errors ? JSON.stringify(e.errors, null, 2) : e.message}. Raw Data:`,
          JSON.stringify(entry, null, 2)
        );
        return false;
      }
    });

    // Reduce - data is already validated and matches schema type
    const entriesById = validatedEntries.reduce((acc, entry) => {
      acc[entry.id] = entry;
      return acc;
    }, {} as Record<string, z.infer<typeof linkSchema>>);

    console.log(
      `Prepared ${Object.keys(entriesById).length} valid flat entries for the collection.`
    );
    return entriesById;
  },
});

// Export a single `collections` object to register your collection(s)
export const collections = {
  links: linksCollection,
};

// Define the type for a single link entry for use in components
export type LinkEntry = z.infer<typeof linkSchema>;