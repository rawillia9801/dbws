import "server-only";

import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { VercelDomainError, attachDomainToDogBreederWeb } from "@/lib/vercel-domain";

export async function finalizeRegisteredDomain(subscriptionId: string, domain: string) {
  const admin = createAdminSupabaseClient();
  if (!admin) return { status: "manual_attention" as const };

  const { data: row } = await admin.from("website_subscriptions")
    .select("domain_registration_status,dns_status")
    .eq("paypal_subscription_id", subscriptionId)
    .maybeSingle();
  if (row?.domain_registration_status !== "registered") return { status: row?.domain_registration_status || "pending" };
  if (row?.dns_status === "configured") return { status: "configured" as const };

  await admin.from("website_subscriptions").update({ dns_status: "configuring" }).eq("paypal_subscription_id", subscriptionId);
  try {
    const result = await attachDomainToDogBreederWeb(domain);
    await admin.from("website_subscriptions").update({ dns_status: "configured", website_publish_status: "ready" }).eq("paypal_subscription_id", subscriptionId);
    await admin.from("kennels").update({ domain_status: "verified", website_url: `https://${domain}` }).eq("custom_domain", domain);
    return { status: "configured" as const, ...result };
  } catch (error) {
    const manual = error instanceof VercelDomainError && [401, 403, 503].includes(error.status);
    await admin.from("website_subscriptions").update({ dns_status: manual ? "manual_attention" : "failed" }).eq("paypal_subscription_id", subscriptionId);
    console.error("Automatic Vercel/DNS provisioning failed", error instanceof VercelDomainError ? { status: error.status } : undefined);
    return { status: manual ? "manual_attention" as const : "failed" as const };
  }
}
