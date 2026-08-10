import { anthropic } from "@ai-sdk/anthropic";
import { generateText, Output, type ModelMessage } from "ai";
import { NextResponse } from "next/server";
import { finalizeDomainForUser } from "@/lib/domain-infrastructure";
import { provisionIncludedMailboxes } from "@/lib/email-provisioning";
import { builderRequestSchema, builderResponseSchema, type BuilderAction } from "@/lib/site-builder/schema";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 60;

const DEFAULT_MODEL = "claude-sonnet-5";

const systemPrompt = `You are BreederWeb Designer, the interactive website builder inside Dog Breeder Web.

You revise the supplied structured website configuration and can also request a small set of real, account-scoped operations. Return a complete valid configuration every time, even when the breeder's main request is operational.

CONTENT RULES
- Preserve accurate kennel names, contact details, locations, dog names, health testing, litter facts, and availability unless the breeder explicitly asks to change them.
- Never invent certifications, veterinary results, titles, guarantees, dates, availability, or legal claims.
- Never produce HTML, JavaScript, markdown, tracking code, passwords, API keys, or DNS records in website content.
- Write specific, natural breeder-facing copy. Avoid hype, clichés, filler, and excessive exclamation marks.
- Preserve existing image URLs unless the breeder asks to change imagery. Image URLs must remain valid http/https URLs.
- Maintain all schema-required fields and respect every field/array limit.

OPERATIONS
You may request only these operations in the actions array:
1. publish_site — use only when the breeder explicitly asks to publish, launch, put the website live, or make the current website publicly viewable.
2. configure_domain — use when the breeder explicitly asks to connect, finish, repair, or activate the domain that is already part of their paid Dog Breeder Web setup. This action never purchases an extra domain and never changes the selected domain.
3. create_mailboxes — use when the breeder explicitly asks to create or set up one or two business email addresses. Supply only the local parts, for example ["hello", "applications"] for hello@theirdomain.com and applications@theirdomain.com. Never request more than two included mailboxes.

Do not claim an operation succeeded merely because you requested it. Your assistantMessage should say what you changed in the website content and, when actions are present, that you are carrying out the requested operation. The application will append the actual result after execution.

If the breeder asks to design or redesign the website, make substantive configuration changes rather than only giving advice. If they ask for multiple reasonable content changes, perform all of them in one response. Summarize meaningful changes in plain language.`;

function configuredModel() {
  const value = process.env.CLAUDE_SITE_BUILDER_MODEL?.trim();
  if (!value || /^your[_-]/i.test(value) || value.includes("server_side_model")) return DEFAULT_MODEL;
  return value;
}

function configuredApiKey() {
  const value = process.env.ANTHROPIC_API_KEY?.trim();
  return value && !/^your[_-]/i.test(value) ? value : "";
}

async function generateWebsite(model: string, prompt: string, currentConfig: unknown) {
  const messages: ModelMessage[] = [
    {
      role: "system",
      content: systemPrompt,
      providerOptions: { anthropic: { cacheControl: { type: "ephemeral", ttl: "1h" } } },
    },
    {
      role: "user",
      content: `Breeder request:\n${prompt}\n\nCurrent website configuration:\n${JSON.stringify(currentConfig)}`,
    },
  ];
  return generateText({
    model: anthropic(model),
    messages,
    output: Output.object({ schema: builderResponseSchema }),
    maxOutputTokens: 6000,
  });
}

async function publishExistingSite(supabase: NonNullable<Awaited<ReturnType<typeof createServerSupabaseClient>>>, userId: string, siteId: string | null | undefined, config: unknown) {
  if (!siteId) return "I updated the design, but this site needs its first save before I can publish it from chat.";
  const { data: site, error } = await supabase.from("breeder_sites").update({ config }).eq("id", siteId).eq("owner_id", userId).select("id,slug,template_id").maybeSingle();
  if (error || !site) return "I updated the design, but publishing could not complete.";
  const { error: publishError } = await supabase.from("published_breeder_sites").upsert({
    site_id: site.id,
    owner_id: userId,
    slug: site.slug,
    template_id: site.template_id,
    config,
    published_at: new Date().toISOString(),
  }, { onConflict: "site_id" });
  return publishError ? "I updated the design, but publishing could not complete." : "The website is published with these changes.";
}

async function executeAction(action: BuilderAction, context: {
  userId: string;
  siteId?: string | null;
  config: unknown;
  supabase: NonNullable<Awaited<ReturnType<typeof createServerSupabaseClient>>>;
}) {
  try {
    if (action.type === "configure_domain") {
      const result = await finalizeDomainForUser(context.userId);
      return result.status === "configured" ? `Your domain ${"domain" in result ? result.domain : ""} is connected to the website.` : `Domain setup is currently ${result.status}.`;
    }
    if (action.type === "create_mailboxes") {
      const result = await provisionIncludedMailboxes(context.userId, action.localParts);
      if (!result.credentials.length) return `Your included email addresses are already configured: ${result.addresses.join(", ")}.`;
      const credentials = result.credentials.map((item) => `${item.address} — temporary password: ${item.password}`).join(" | ");
      return `I created ${result.credentials.length === 1 ? "the mailbox" : "the mailboxes"}. Save these temporary credentials now; Dog Breeder Web does not store the passwords: ${credentials}. Webmail: mail.hostinger.com`;
    }
    if (action.type === "publish_site") return publishExistingSite(context.supabase, context.userId, context.siteId, context.config);
  } catch (error) {
    return `I could not complete that account operation: ${error instanceof Error ? error.message : "please try again"}.`;
  }
  return "";
}

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return NextResponse.json({ error: "Sign in to use BreederWeb Designer." }, { status: 401 });

  const parsed = builderRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Check the website details and try again." }, { status: 400 });
  if (!configuredApiKey()) return NextResponse.json({ error: "BreederWeb Designer needs its Anthropic API key configured in the production environment." }, { status: 503 });

  if (parsed.data.siteId) {
    const { data: ownedSite } = await supabase.from("breeder_sites").select("id").eq("id", parsed.data.siteId).eq("owner_id", authData.user.id).maybeSingle();
    if (!ownedSite) return NextResponse.json({ error: "That website was not found in your workspace." }, { status: 404 });
  }

  const generationId = crypto.randomUUID();
  const requestedModel = configuredModel();
  let trackedGeneration = false;
  const { error: generationError } = await supabase.from("ai_site_generations").insert({
    id: generationId, site_id: parsed.data.siteId ?? null, owner_id: authData.user.id,
    prompt: parsed.data.prompt, model: requestedModel, status: "pending",
  });
  if (generationError) console.warn("AI generation history could not be recorded; continuing with the website change", { code: generationError.code });
  else trackedGeneration = true;

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
      } else throw firstError;
    }

    const operationNotes: string[] = [];
    for (const action of result.output.actions || []) {
      const note = await executeAction(action, { userId: authData.user.id, siteId: parsed.data.siteId, config: result.output.config, supabase });
      if (note) operationNotes.push(note);
    }

    if (trackedGeneration) {
      await supabase.from("ai_site_generations").update({
        status: "complete", model, result: result.output, token_usage: result.usage, completed_at: new Date().toISOString(),
      }).eq("id", generationId).eq("owner_id", authData.user.id);
    }
    return NextResponse.json({
      ...result.output,
      assistantMessage: [result.output.assistantMessage, ...operationNotes].filter(Boolean).join("\n\n"),
      generationId,
      operationResults: operationNotes,
    });
  } catch (error) {
    const errorCode = error instanceof Error ? error.name.slice(0, 100) : "unknown_error";
    const errorMessage = error instanceof Error ? error.message : "";
    console.error("BreederWeb Designer site generation failed", { generationId, errorCode, model: requestedModel, errorMessage });
    if (trackedGeneration) await supabase.from("ai_site_generations").update({ status: "failed", error_code: errorCode, completed_at: new Date().toISOString() }).eq("id", generationId).eq("owner_id", authData.user.id);
    if (/authentication|api key|unauthorized|401/i.test(errorMessage)) return NextResponse.json({ error: "BreederWeb Designer could not authenticate with the AI service. Check the production ANTHROPIC_API_KEY." }, { status: 503 });
    if (/model|not found|invalid|unsupported/i.test(errorMessage)) return NextResponse.json({ error: `BreederWeb Designer could not use the configured model. The supported default is ${DEFAULT_MODEL}.` }, { status: 503 });
    if (/rate|credit|balance|quota|429/i.test(errorMessage)) return NextResponse.json({ error: "BreederWeb Designer reached an AI usage limit. Check the Anthropic account balance or rate limit and try again." }, { status: 503 });
    return NextResponse.json({ error: "BreederWeb Designer could not complete that website change. Please try again." }, { status: 502 });
  }
}
