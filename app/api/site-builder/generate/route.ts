import { anthropic } from "@ai-sdk/anthropic";
import { generateText, Output } from "ai";
import { NextResponse } from "next/server";
import { builderRequestSchema, builderResponseSchema } from "@/lib/site-builder/schema";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 60;

const systemPrompt = `You are the website copilot inside Dog Breeder Web, a structured website builder for ethical dog breeders.

Your job is to revise the supplied website configuration in response to the breeder's request. Return a complete configuration every time.

Rules:
- Preserve accurate names, contact details, locations, dog names, health testing, and litter facts unless the breeder explicitly asks to change them.
- Never invent certifications, veterinary results, titles, guarantees, dates, availability, or legal claims.
- Never produce HTML, JavaScript, markdown, or tracking code. Only update the structured site fields.
- Keep the writing specific, warm, confident, and easy for puppy families to understand. Avoid hype, clichés, and excessive exclamation marks.
- Keep all image URLs valid http or https URLs. Preserve existing image URLs unless asked to change imagery.
- Maintain every required item and stay within the provided schema limits.
- Summarize the meaningful changes in plain language for the breeder.`;

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });

  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return NextResponse.json({ error: "Sign in to use the website copilot." }, { status: 401 });

  const parsed = builderRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Check the website details and try again." }, { status: 400 });

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "BreederWeb Designer is ready, but the ANTHROPIC_API_KEY still needs to be added in Vercel." }, { status: 503 });
  }

  if (parsed.data.siteId) {
    const { data: ownedSite } = await supabase.from("breeder_sites").select("id").eq("id", parsed.data.siteId).eq("owner_id", authData.user.id).maybeSingle();
    if (!ownedSite) return NextResponse.json({ error: "That website was not found in your workspace." }, { status: 404 });
  }

  const generationId = crypto.randomUUID();
  const model = process.env.CLAUDE_SITE_BUILDER_MODEL ?? "claude-sonnet-5";
  const { error: generationError } = await supabase.from("ai_site_generations").insert({
    id: generationId,
    site_id: parsed.data.siteId ?? null,
    owner_id: authData.user.id,
    prompt: parsed.data.prompt,
    model,
    status: "pending",
  });

  if (generationError) {
    console.error("AI generation record failed", { code: generationError.code });
    return NextResponse.json({ error: "The website copilot could not start a saved generation." }, { status: 500 });
  }

  try {
    const result = await generateText({
      model: anthropic(model),
      system: systemPrompt,
      prompt: `Breeder request:\n${parsed.data.prompt}\n\nCurrent website configuration:\n${JSON.stringify(parsed.data.currentConfig)}`,
      output: Output.object({ schema: builderResponseSchema }),
      maxOutputTokens: 6000,
      providerOptions: { anthropic: { effort: "low" } },
    });

    await supabase.from("ai_site_generations").update({
      status: "complete",
      result: result.output,
      token_usage: result.usage,
      completed_at: new Date().toISOString(),
    }).eq("id", generationId).eq("owner_id", authData.user.id);

    return NextResponse.json({ ...result.output, generationId });
  } catch (error) {
    const errorCode = error instanceof Error ? error.name.slice(0, 100) : "unknown_error";
    console.error("BreederWeb Designer site generation failed", { generationId, errorCode });
    await supabase.from("ai_site_generations").update({ status: "failed", error_code: errorCode, completed_at: new Date().toISOString() }).eq("id", generationId).eq("owner_id", authData.user.id);
    return NextResponse.json({ error: "BreederWeb Designer could not complete that change. Try a shorter or more specific request." }, { status: 502 });
  }
}

