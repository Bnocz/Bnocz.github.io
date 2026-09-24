import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    hook: z.string(),
    stack: z.array(z.string()),
    team: z.string().optional(),
    repo: z.string().optional(),
    order: z.number(),
  }),
});

export const collections = { projects };