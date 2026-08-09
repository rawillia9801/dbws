import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Builder } from "@/components/site-builder/builder";
import { siteConfigSchema } from "@/lib/site-builder/schema";
import { cloneConfig, getTemplate } from "@/lib/site-builder/templates";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Website Studio" };
export const dynamic = "force-dynamic";

export default async function BuilderPage({ searchParams }: { searchParams: Promise<{ template?: string }> }) {
  const params = await searchParams;
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    const template = getTemplate(params.template);
    return <Builder initialConfig={cloneConfig(template.config)} initialSiteId={null} initialSlug="my-breeder-site" initialPublished={false} userEmail="Preview mode" />;
  }

  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) redirect("/login?next=/builder");

  const { data: site } = await supabase
    .from("breeder_sites")
    .select("id, slug, config")
    .eq("owner_id", authData.user.id)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const savedConfig = siteConfigSchema.safeParse(site?.config);
  const template = getTemplate(params.template);
  const initialConfig = savedConfig.success ? savedConfig.data : cloneConfig(template.config);
  const initialSlug = site?.slug ?? `${authData.user.email?.split("@")[0]?.replace(/[^a-z0-9]+/gi, "-").toLowerCase() || "my-kennel"}-site`;

  const { data: publishedSite } = site
    ? await supabase.from("published_breeder_sites").select("site_id").eq("site_id", site.id).maybeSingle()
    : { data: null };

  return (
    <Builder
      initialConfig={initialConfig}
      initialSiteId={site?.id ?? null}
      initialSlug={initialSlug}
      initialPublished={Boolean(publishedSite)}
      userEmail={authData.user.email ?? "Breeder"}
    />
  );
}

