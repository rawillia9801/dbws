import { NextResponse } from "next/server";
import { finalizeRegisteredDomain } from "@/lib/domain-infrastructure";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const supabase = await createServerSupabaseClient();
  const admin = createAdminSupabaseClient();
  if (!supabase || !admin) return NextResponse.json({ error: "Domain setup is not configured." }, { status: 503 });
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return NextResponse.json({ error: "Sign in to configure your domain." }, { status: 401 });

  const { data: subscription } = await admin.from("website_subscriptions")
    .select("paypal_subscription_id,requested_domain,domain_registration_status")
    .eq("owner_id", authData.user.id)
    .in("paypal_status", ["APPROVED", "ACTIVE"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!subscription) return NextResponse.json({ error: "An active Dog Breeder Web subscription is required." }, { status: 403 });
  if (subscription.domain_registration_status !== "registered") {
    return NextResponse.json({ error: `Domain registration is currently ${subscription.domain_registration_status}.` }, { status: 409 });
  }

  const result = await finalizeRegisteredDomain(subscription.paypal_subscription_id, subscription.requested_domain);
  return NextResponse.json({ domain: subscription.requested_domain, ...result }, { headers: { "cache-control": "no-store" } });
}
