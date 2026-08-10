import { anthropic } from "@ai-sdk/anthropic";
import { generateText, Output } from "ai";
import { NextResponse } from "next/server";
import { builderRequestSchema, builderResponseSchema } from "@/lib/site-builder/schema";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 60;

const DEFAULT_MODEL = "claude-sonnet-4-5";

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

function configuredModel() {
  const value = process.env.CLAUDE_SITE_BUILDER_MODEL?.trim();
  if (!value || /^your[_-]/i.test(value) || value.includes("server_side_model") || value === "claude-sonnet-5") return DEFAULT_MODEL;
  return value;
}

function configuredApiKey() {
  const value = process.env.ANTHROPIC_API_KEY?.trim();
  return value && !/^your[_-]/i.test(value) ? value : "";
}

async function generateWebsite(model: string, prompt: string, currentConfig: unknown) {
  return generateText({
    model: anthropic(model),
    system: systemPrompt,
    prompt: `Breeder request:\n${prompt}\n\nCurrent website configuration:\n${JSON.stringify(currentConfig)}`,
    output: Output.object({ schema: builderResponseSchema }),
    maxOutputTokens: 6000,
  });
}

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });

  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return NextResponse.json({ error: "Sign in to use BreederWeb Designer." }, { status: 401 });

  const parsed = builderRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Check the website details and try again." }, { status: 400 });

  if (!configuredApiKey()) {
    return NextResponse.json({ error: "BreederWeb Designer needs its Anthropic API key configured in the production environment." }, { status: 503 });
  }

  if (parsed.data.siteId) {
    const { data: ownedSite } = await supabase.from("breeder_sites").select("id").eq("id", parsed.data.siteId).eq("owner_id", authData.user.id).maybeSingle();
    if (!ownedSite) return NextResponse.json({ error: "That website was not found in your workspace." }, { status: 404 });
  }

  const generationId = crypto.randomUUID();
  const requestedModel = configuredModel();
  let trackedGeneration = false;
  const { error: generationError } = await supabase.from("ai_site_generations").insert({
    id: generationId,
    site_id: parsed.data.siteId ?? null,
    owner_id: authData.user.id,
    prompt: parsed.data.prompt,
    model: requestedModel,
    status: "pending",
  });

  if (generationError) {
    console.warn("AI generation history could not be recorded; continuing with the website change", { code: generationError.code });
  } else {
    trackedGeneration = true;
  }

  try {
    let model = requestedModel;
    let result;
    try {
      result = await generateWebsite(model, parsed.data.prompt, parsed.data.currentConfig);
    } catch (firstError) {
      const message = firstError instanceof Error ? firstError.message : "";
      if (model !== DEFAULT_MODEL && /model|not found|invalid|unsupported/i.test(message)) {
        console.warn("Configured BreederWeb Designer model failed; retrying with supported default", { configuredModel: model });
        model = DEFAULT_MODEL;
        result = await generateWebsite(model, parsed.data.prompt, parsed.data.currentConfig);
      } else {
        throw firstError;
      }
    }

    if (trackedGeneration) {
      await supabase.from("ai_site_generations").update({
        status: "complete",
        model,
        result: result.output,
        token_usage: result.usage,
        completed_at: new Date().toISOString(),
      }).eq("id", generationId).eq("owner_id", authData.user.id);
    }

    return NextResponse.json({ ...result.output, generationId });
  } catch (error) {
    const errorCode = error instanceof Error ? error.name.slice(0, 100) : "unknown_error";
    const errorMessage = error instanceof Error ? error.message : "";
    console.error("BreederWeb Designer site generation failed", { generationId, errorCode, model: requestedModel, errorMessage });
    if (trackedGeneration) {
      await supabase.from("ai_site_generations").update({ status: "failed", error_code: errorCode, completed_at: new Date().toISOString() }).eq("id", generationId).eq("owner_id", authData.user.id);
    }

    if (/authentication|api key|unauthorized|401/i.test(errorMessage)) {
      return NextResponse.json({ error: "BreederWeb Designer could not authenticate with the AI service. Check the production ANTHROPIC_API_KEY." }, { status: 503 });
    }
    if (/model|not found|invalid|unsupported/i.test(errorMessage)) {
      return NextResponse.json({ error: `BreederWeb Designer could not use the configured model. The supported default is ${DEFAULT_MODEL}.` }, { status: 503 });
    }
    if (/rate|credit|balance|quota|429/i.test(errorMessage)) {
      return NextResponse.json({ error: "BreederWeb Designer reached an AI usage limit. Check the Anthropic account balance or rate limit and try again." }, { status: 503 });
    }

    return NextResponse.json({ error: "BreederWeb Designer could not complete that website change. Please try again." }, { status: 502 });
  }
}
