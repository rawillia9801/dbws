import { z } from "zod";

const webUrl = z
  .string()
  .trim()
  .url()
  .refine((value) => ["http:", "https:"].includes(new URL(value).protocol), "Use an http or https image URL.");

const color = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Use a six-digit hex color.");

export const templateIdSchema = z.enum(["heritage", "modern-meadow", "signature"]);

export const siteConfigSchema = z.object({
  version: z.literal(1),
  templateId: templateIdSchema,
  brand: z.object({
    name: z.string().trim().min(2).max(80),
    breed: z.string().trim().min(2).max(80),
    location: z.string().trim().min(2).max(120),
    email: z.string().trim().email().max(254),
    phone: z.string().trim().max(40),
    tagline: z.string().trim().min(4).max(120),
  }),
  theme: z.object({
    primary: color,
    accent: color,
    background: color,
    ink: color,
  }),
  hero: z.object({
    eyebrow: z.string().trim().min(2).max(80),
    headline: z.string().trim().min(8).max(110),
    subheadline: z.string().trim().min(20).max(280),
    imageUrl: webUrl,
    ctaLabel: z.string().trim().min(2).max(36),
  }),
  about: z.object({
    title: z.string().trim().min(4).max(100),
    body: z.string().trim().min(40).max(900),
    imageUrl: webUrl,
  }),
  highlights: z
    .array(
      z.object({
        title: z.string().trim().min(2).max(60),
        text: z.string().trim().min(12).max(220),
      }),
    )
    .min(3)
    .max(4),
  dogs: z
    .array(
      z.object({
        name: z.string().trim().min(1).max(60),
        title: z.string().trim().min(2).max(80),
        description: z.string().trim().min(12).max(300),
        imageUrl: webUrl,
        healthTesting: z.string().trim().min(2).max(180),
      }),
    )
    .min(1)
    .max(6),
  litters: z
    .array(
      z.object({
        name: z.string().trim().min(2).max(80),
        status: z.string().trim().min(2).max(50),
        description: z.string().trim().min(12).max(300),
        imageUrl: webUrl,
      }),
    )
    .max(4),
  testimonial: z.object({
    quote: z.string().trim().min(20).max(440),
    attribution: z.string().trim().min(2).max(100),
  }),
  contact: z.object({
    headline: z.string().trim().min(4).max(100),
    body: z.string().trim().min(12).max(300),
    buttonLabel: z.string().trim().min(2).max(40),
  }),
  visibility: z.object({
    about: z.boolean(),
    dogs: z.boolean(),
    litters: z.boolean(),
    testimonial: z.boolean(),
  }),
});

export const builderResponseSchema = z.object({
  assistantMessage: z.string().trim().min(10).max(800),
  changeSummary: z.array(z.string().trim().min(2).max(120)).min(1).max(6),
  config: siteConfigSchema,
});

export const builderRequestSchema = z.object({
  siteId: z.string().uuid().nullable().optional(),
  prompt: z.string().trim().min(3).max(2000),
  currentConfig: siteConfigSchema,
});

export const saveSiteRequestSchema = z.object({
  siteId: z.string().uuid().nullable().optional(),
  slug: z
    .string()
    .trim()
    .min(3)
    .max(64)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens."),
  config: siteConfigSchema,
  publish: z.boolean().default(false),
  source: z.enum(["manual", "ai"]).default("manual"),
  generationId: z.string().uuid().nullable().optional(),
});

export type SiteConfig = z.infer<typeof siteConfigSchema>;
export type BuilderResponse = z.infer<typeof builderResponseSchema>;
export type TemplateId = z.infer<typeof templateIdSchema>;

