import { NextResponse } from "next/server";
import { saveSiteRequestSchema } from "@/lib/site-builder/schema";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });

  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return NextResponse.json({ error: "Sign in to save your website." }, { status: 401 });

  const parsed = saveSiteRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Check the website details and try again." }, { status: 400 });

  const siteValues = {
    owner_id: authData.user.id,
    slug: parsed.data.slug,
    template_id: parsed.data.config.templateId,
    config: parsed.data.config,
  };

  let siteId = parsed.data.siteId ?? null;
  if (siteId) {
    const { data, error } = await supabase.from("breeder_sites").update(siteValues).eq("id", siteId).eq("owner_id", authData.user.id).select("id").maybeSingle();
    if (error || !data) {
      const message = error?.code === "23505" ? "That website address is already in use." : "Your draft could not be updated.";
      return NextResponse.json({ error: message }, { status: error?.code === "23505" ? 409 : 500 });
    }
  } else {
    const { data, error } = await supabase.from("breeder_sites").insert(siteValues).select("id").single();
    if (error || !data) {
      const message = error?.code === "23505" ? "That website address is already in use." : "Your draft could not be created.";
      return NextResponse.json({ error: message }, { status: error?.code === "23505" ? 409 : 500 });
    }
    siteId = data.id;
  }

  const { data: latestVersion } = await supabase
    .from("breeder_site_versions")
    .select("version_number")
    .eq("site_id", siteId)
    .eq("owner_id", authData.user.id)
    .order("version_number", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { error: versionError } = await supabase.from("breeder_site_versions").insert({
    site_id: siteId,
    owner_id: authData.user.id,
    version_number: (latestVersion?.version_number ?? 0) + 1,
    source: parsed.data.source,
    generation_id: parsed.data.generationId ?? null,
    config: parsed.data.config,
  });

  if (versionError) console.error("Site version save failed", { code: versionError.code, siteId });

  if (parsed.data.publish) {
    const { error: publishError } = await supabase.from("published_breeder_sites").upsert({
      site_id: siteId,
      owner_id: authData.user.id,
      slug: parsed.data.slug,
      template_id: parsed.data.config.templateId,
      config: parsed.data.config,
      published_at: new Date().toISOString(),
    }, { onConflict: "site_id" });

    if (publishError) {
      const message = publishError.code === "23505" ? "That public website address is already in use." : "Your draft was saved, but publishing failed.";
      return NextResponse.json({ error: message, siteId }, { status: publishError.code === "23505" ? 409 : 500 });
    }
  }

  return NextResponse.json({ siteId, slug: parsed.data.slug, published: parsed.data.publish });
}

