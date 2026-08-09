import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteRenderer } from "@/components/site-builder/site-renderer";
import { siteConfigSchema } from "@/lib/site-builder/schema";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

async function getPublishedSite(slug: string) {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return null;
  const { data } = await supabase.from("published_breeder_sites").select("config").eq("slug", slug).maybeSingle();
  const parsed = siteConfigSchema.safeParse(data?.config);
  return parsed.success ? parsed.data : null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const config = await getPublishedSite(slug);
  if (!config) return { title: "Breeder Website" };
  return {
    title: config.brand.name,
    description: config.hero.subheadline,
    openGraph: { title: config.brand.name, description: config.hero.subheadline, images: [config.hero.imageUrl] },
  };
}

export default async function PublishedSitePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const config = await getPublishedSite(slug);
  if (!config) notFound();
  return <SiteRenderer config={config} />;
}

