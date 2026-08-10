import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { normalizeComDomain } from "@/lib/domain";
import { verifyWebsiteSubscription } from "@/lib/paypal";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type PendingSubscription = {
  subscriptionId: string;
  requestedDomain: string;
};

function readPendingSubscription(value: string | undefined): PendingSubscription | null {
  if (!value) return null;

  try {
    const parsed = JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as Partial<PendingSubscription>;
    if (!parsed.subscriptionId || !/^I-[A-Z0-9]+$/i.test(parsed.subscriptionId) || !parsed.requestedDomain) return null;
    return {
      subscriptionId: parsed.subscriptionId,
      requestedDomain: normalizeComDomain(parsed.requestedDomain),
    };
  } catch {
    return null;
  }
}

async function attachPendingSubscription(
  supabase: NonNullable<Awaited<ReturnType<typeof createServerSupabaseClient>>>,
  userId: string,
  userEmail: string | undefined,
) {
  const cookieStore = await cookies();
  const pending = readPendingSubscription(cookieStore.get("dbws_pending_subscription")?.value);
  if (!pending) return;

  const verified = await verifyWebsiteSubscription(pending.subscriptionId, pending.requestedDomain);
  const { error: subscriptionError } = await supabase.from("website_subscriptions").upsert({
    owner_id: userId,
    paypal_subscription_id: verified.subscriptionId,
    paypal_plan_id: verified.planId,
    paypal_status: verified.status,
    requested_domain: verified.requestedDomain,
    purchaser_email: verified.email ?? userEmail ?? null,
    setup_fee_cents: 8900,
    monthly_price_cents: 2000,
    annual_domain_renewal_cents: 3900,
    domain_renewal_billed_separately: true,
  }, { onConflict: "paypal_subscription_id" });

  if (subscriptionError) {
    throw new Error(`Website subscription could not be attached: ${subscriptionError.code}`);
  }

  const { error: kennelError } = await supabase.from("kennels").update({
    custom_domain: verified.requestedDomain,
    domain_status: "pending",
  }).eq("owner_auth_user_id", userId);

  if (kennelError) {
    console.warn("Verified website domain could not be attached to an existing kennel record", { code: kennelError.code });
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
        try {
          await attachPendingSubscription(supabase, data.user.id, data.user.email);
        } catch (subscriptionError) {
          console.error(
            "Pending website subscription could not be attached after sign-in",
            subscriptionError instanceof Error ? { name: subscriptionError.name, message: subscriptionError.message } : undefined,
          );
        }
      }
      return NextResponse.redirect(new URL(next, url.origin));
    }
  }

  const login = new URL("/login", url.origin);
  login.searchParams.set("error", "link");
  return NextResponse.redirect(login);
}
