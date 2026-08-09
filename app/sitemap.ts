import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "https://dogbreederweb.site", lastModified: new Date(), changeFrequency: "monthly", priority: 1 },
    { url: "https://dogbreederweb.site/start", lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
  ];
}
