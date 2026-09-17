import { defineCollection, reference } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    technologies: z.array(z.string()),
    githubUrl: z.url().optional(),
    demoUrl: z.url().optional(),
    demoLabel: z.string().optional(),
    featured: z.boolean().default(false),
    order: z.number(),
    category: z.string().optional(),
    lead: z.string().optional(),
    highlights: z.array(z.object({ title: z.string(), description: z.string() })).optional(),
    images: z.array(z.object({ src: z.string(), alt: z.string(), caption: z.string() })).optional(),
    year: z.number().optional(),
    caseStudy: z.boolean().default(false),
  }),
});

const writing = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/writing' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishedAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    relatedProject: reference('projects').optional(),
  }).refine((article) => article.draft || article.publishedAt !== undefined, {
    message: 'Published articles require publishedAt',
    path: ['publishedAt'],
  }),
});

export const collections = { projects, writing };
