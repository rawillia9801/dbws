import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { provisionConnectedPlatform } from "@/lib/connected-platform";
import { finalizeRegisteredDomain } from "@/lib/domain-infrastructure";
import { normalizeComDomain } from "@/lib/domain";
import { verifyWebsiteSubscription } from "@/lib/paypal";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type PendingSubscription = { subscriptionId: string; requestedDomain: string };

function readPendingSubscription(value: string | undefined): PendingSubscription | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as Partial<PendingSubscription>;
    if (!parsed.subscriptionId || !/^I-[A-Z0-9]+$/i.test(parsed.subscriptionId) || !parsed.requestedDomain) return null;
    return { subscriptionId: parsed.subscriptionId, requestedDomain: normalizeComDomain(parsed.requestedDomain) };
  } catch { return null; }
}

async function attachPendingSubscription(user: { id: string; email?: string; user_metadata?: Record<string, unknown> }) {
  const cookieStore = await cookies();
  const pending = readPendingSubscription(cookieStore.get("dbws_pending_subscription")?.value);
  if (!pending) return;

  const verified = await verifyWebsiteSubscription(pending.subscriptionId, pending.requestedDomain);
  const provisioning = await provisionConnectedPlatform({
    userId: user.id,
    email: user.email,
    kennelName: typeof user.user_metadata?.kennel_name === "string" ? user.user_metadata.kennel_name : undefined,
    subscription: verified,
  });
  if (provisioning.domainRegistrationStatus === "registered") {
    await finalizeRegisteredDomain(verified.subscriptionId, verified.requestedDomain);
  }
  cookieStore.delete("dbws_pending_subscription");
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const nextParam = url.searchParams.get("next");
  const next = nextParam?.startsWith("/") ? nextParam : "/builder";
  const supabase = await createServerSupabaseClient();

  if (code && supabase) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        try { await attachPendingSubscription(data.user); }
        catch (subscriptionError) {
          console.error("Pending website subscription could not be attached after sign-in", subscriptionError instanceof Error ? { name: subscriptionError.name, message: subscriptionError.message } : undefined);
        }
      }
      return NextResponse.redirect(new URL(next, url.origin));
    }
  }

  const login = new URL("/login", url.origin);
  login.searchParams.set("error", "confirmation");
  return NextResponse.redirect(login);
}
