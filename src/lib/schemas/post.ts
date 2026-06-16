import { z } from 'zod';

/**
 * Frontmatter schema for src/content/blog/*.md
 * Mirrors the fields used across the three existing posts.
 */
export const postFrontmatterSchema = z.object({
  title: z.string(),
  description: z.string(),
  pubDate: z.string(), // ISO date string: "YYYY-MM-DD"
  category: z.string(),
  heroImage: z.string().optional(),
  author: z.string().optional(),
  draft: z.boolean().optional(),
});

export type PostFrontmatter = z.infer<typeof postFrontmatterSchema>;
