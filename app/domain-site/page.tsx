import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteRenderer } from "@/components/site-builder/site-renderer";
import { siteConfigSchema } from "@/lib/site-builder/schema";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

async function siteForDomain(host: string) {
  const admin = createAdminSupabaseClient();
  if (!admin) return null;
  const domain = host.trim().toLowerCase().replace(/^www\./, "");
  const { data: subscription } = await admin.from("website_subscriptions")
    .select("owner_id,domain_registration_status")
    .eq("requested_domain", domain)
    .in("paypal_status", ["APPROVED", "ACTIVE"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!subscription?.owner_id) return null;
  const { data: published } = await admin.from("published_breeder_sites")
    .select("config")
    .eq("owner_id", subscription.owner_id)
    .order("published_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const parsed = siteConfigSchema.safeParse(published?.config);
  return parsed.success ? parsed.data : null;
}

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ host?: string }> }): Promise<Metadata> {
  const { host = "" } = await searchParams;
  const config = await siteForDomain(host);
  return config ? { title: config.brand.name, description: config.hero.subheadline } : { title: "Breeder Website" };
}

export default async function DomainSitePage({ searchParams }: { searchParams: Promise<{ host?: string }> }) {
  const { host = "" } = await searchParams;
  const config = await siteForDomain(host);
  if (!config) notFound();
  return <SiteRenderer config={config} />;
}
