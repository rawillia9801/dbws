import type { SiteConfig, TemplateId } from "./schema";

export type SiteTemplate = {
  id: TemplateId;
  name: string;
  description: string;
  config: SiteConfig;
};

const sharedContent = {
  brand: {
    name: "Foxglove Golden Retrievers",
    breed: "Golden Retrievers",
    location: "Asheville, North Carolina",
    email: "hello@foxglovegoldens.com",
    phone: "(828) 555-0147",
    tagline: "Purposefully raised. Deeply loved.",
  },
  hero: {
    eyebrow: "THOUGHTFUL GOLDEN RETRIEVERS",
    headline: "Raised with purpose, placed with love.",
    subheadline:
      "Health-tested Golden Retrievers raised in our home with thoughtful socialization, confident temperaments, and a lifetime of breeder support.",
    imageUrl:
      "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=1600&q=88",
    ctaLabel: "Meet our dogs",
  },
  about: {
    title: "A small program with a big commitment",
    body:
      "Our dogs are family first. We plan each pairing with health, temperament, structure, and the future of the breed in mind. Puppies grow up in the center of our home, experiencing everyday life and age-appropriate enrichment before joining carefully matched families.",
    imageUrl:
      "https://images.unsplash.com/photo-1558788353-f76d92427f16?auto=format&fit=crop&w=1200&q=88",
  },
  highlights: [
    { title: "Health tested", text: "Parents complete breed-recommended health screenings before any planned pairing." },
    { title: "Home raised", text: "Puppies are raised underfoot with intentional socialization and daily hands-on care." },
    { title: "Thoughtful matches", text: "We learn about every family and guide them toward the puppy that fits their life." },
  ],
  dogs: [
    {
      name: "Willow",
      title: "Our foundation girl",
      description: "Gentle, steady, and endlessly affectionate, Willow brings the classic temperament we value most.",
      imageUrl:
        "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=900&q=86",
      healthTesting: "Hips, elbows, heart, and eyes completed",
    },
    {
      name: "Bennett",
      title: "Our distinguished gentleman",
      description: "Confident and people-focused with beautiful movement, a soft mouth, and a joyful working spirit.",
      imageUrl:
        "https://images.unsplash.com/photo-1507146426996-ef05306b995a?auto=format&fit=crop&w=900&q=86",
      healthTesting: "Hips, elbows, heart, and eyes completed",
    },
  ],
  litters: [
    {
      name: "Willow × Bennett",
      status: "Planned for spring",
      description: "We anticipate confident, affectionate companions with beautiful structure and trainable temperaments.",
      imageUrl:
        "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&w=1000&q=86",
    },
  ],
  testimonial: {
    quote:
      "From our first conversation to pickup day and beyond, we felt informed, supported, and completely confident in our breeder.",
    attribution: "The Carter family · Raleigh, NC",
  },
  contact: {
    headline: "Could one of our puppies be right for you?",
    body: "Tell us about your home, your hopes for a puppy, and the kind of companion you are looking for.",
    buttonLabel: "Start an application",
  },
  visibility: { about: true, dogs: true, litters: true, testimonial: true },
} satisfies Omit<SiteConfig, "version" | "templateId" | "theme">;

export const siteTemplates: SiteTemplate[] = [
  {
    id: "heritage",
    name: "Heritage",
    description: "Warm, established, editorial",
    config: {
      version: 1,
      templateId: "heritage",
      ...sharedContent,
      theme: { primary: "#293f32", accent: "#b76a35", background: "#fbf7ef", ink: "#172c24" },
    },
  },
  {
    id: "modern-meadow",
    name: "Modern Meadow",
    description: "Clean, organic, welcoming",
    config: {
      version: 1,
      templateId: "modern-meadow",
      ...sharedContent,
      brand: { ...sharedContent.brand, name: "Meadow & Pine Goldens", tagline: "Good dogs. Beautiful beginnings." },
      hero: {
        ...sharedContent.hero,
        eyebrow: "MEADOW & PINE GOLDENS",
        headline: "Beautiful beginnings for a lifetime together.",
        imageUrl: "https://images.unsplash.com/photo-1507146426996-ef05306b995a?auto=format&fit=crop&w=1600&q=88",
      },
      theme: { primary: "#44624a", accent: "#d3a85f", background: "#f5f7f0", ink: "#203329" },
    },
  },
  {
    id: "signature",
    name: "Signature",
    description: "Polished, refined, distinctive",
    config: {
      version: 1,
      templateId: "signature",
      ...sharedContent,
      brand: { ...sharedContent.brand, name: "Northstar Retrievers", tagline: "Exceptional companions, intentionally bred." },
      hero: {
        ...sharedContent.hero,
        eyebrow: "NORTHSTAR RETRIEVERS",
        headline: "A considered approach to exceptional dogs.",
        imageUrl: "https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?auto=format&fit=crop&w=1600&q=88",
      },
      theme: { primary: "#182b43", accent: "#c59755", background: "#f8f5ef", ink: "#132238" },
    },
  },
];

export function getTemplate(id: string | null | undefined): SiteTemplate {
  return siteTemplates.find((template) => template.id === id) ?? siteTemplates[0];
}

export function cloneConfig(config: SiteConfig): SiteConfig {
  return structuredClone(config);
}

