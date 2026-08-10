import "server-only";

import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { HostingerApiError, purchaseComDomain } from "@/lib/hostinger";

type WebsiteSubscription = {
  subscriptionId: string;
  planId: string;
  status: string;
  requestedDomain: string;
  email?: string;
};

type AdminClient = NonNullable<ReturnType<typeof createAdminSupabaseClient>>;

function slugBase(value: string) {
  const normalized = value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").replace(/-{2,}/g, "-").slice(0, 48);
  return normalized.length >= 3 ? normalized : `kennel-${crypto.randomUUID().slice(0, 8)}`;
}

async function availableSlug(admin: AdminClient, preferred: string) {
  const base = slugBase(preferred);
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const suffix = attempt === 0 ? "" : `-${attempt + 1}`;
    const candidate = `${base.slice(0, 48 - suffix.length)}${suffix}`;
    const { data, error } = await admin.from("kennels").select("id").eq("slug", candidate).maybeSingle();
    if (error) throw new Error(`Kennel slug lookup failed: ${error.code}`);
    if (!data) return candidate;
  }
  return `kennel-${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`;
}

async function ensureKennel(admin: AdminClient, input: { userId: string; email?: string; kennelName?: string; requestedDomain?: string }) {
  const { data: existing, error: lookupError } = await admin.from("kennels").select("id,name,slug,plan").eq("owner_auth_user_id", input.userId).maybeSingle();
  if (lookupError) throw new Error(`Kennel lookup failed: ${lookupError.code}`);

  let kennel = existing;
  if (!kennel) {
    const fallbackName = input.email?.split("@")[0]?.trim() || "My Breeding Program";
    const name = input.kennelName?.trim() || fallbackName;
    const slug = await availableSlug(admin, name);
    const { data: created, error } = await admin.from("kennels").insert({
      owner_auth_user_id: input.userId,
      name,
      legal_name: name,
      slug,
      plan: "website_companion",
      contact_email: input.email ?? null,
      custom_domain: input.requestedDomain ?? null,
      domain_status: input.requestedDomain ? "pending" : "not_requested",
    }).select("id,name,slug,plan").single();
    if (error || !created) throw new Error(`Kennel creation failed: ${error?.code ?? "unknown"}`);
    kennel = created;
  } else if (input.requestedDomain) {
    const { error } = await admin.from("kennels").update({ custom_domain: input.requestedDomain, domain_status: "pending" }).eq("id", kennel.id);
    if (error) throw new Error(`Kennel domain update failed: ${error.code}`);
  }

  const { error: membershipError } = await admin.from("kennel_members").upsert({ kennel_id: kennel.id, auth_user_id: input.userId, role: "owner" }, { onConflict: "kennel_id,auth_user_id" });
  if (membershipError) throw new Error(`Kennel membership provisioning failed: ${membershipError.code}`);
  return kennel;
}

async function ensureIncludedDomainRegistration(admin: AdminClient, subscriptionId: string, domain: string) {
  const { data: current, error: readError } = await admin.from("website_subscriptions")
    .select("domain_registration_status,domain_registration_order")
    .eq("paypal_subscription_id", subscriptionId).maybeSingle();
  if (readError) throw new Error(`Domain provisioning state could not be read: ${readError.code}`);
  if (current?.domain_registration_status === "registered") return "registered" as const;
  if (current?.domain_registration_status === "purchasing") return "purchasing" as const;

  await admin.from("website_subscriptions").update({ domain_registration_status: "purchasing" }).eq("paypal_subscription_id", subscriptionId);
  try {
    const purchased = await purchaseComDomain(domain);
    const { error } = await admin.from("website_subscriptions").update({
      domain_registration_status: "registered",
      domain_registration_order: purchased.order,
      domain_registered_at: new Date().toISOString(),
      dns_status: "pending",
      website_publish_status: "ready",
      email_provisioning_status: "pending",
    }).eq("paypal_subscription_id", subscriptionId);
    if (error) throw new Error(`Registered domain could not be recorded: ${error.code}`);
    return "registered" as const;
  } catch (error) {
    const manual = error instanceof HostingerApiError && [401, 403, 422, 503].includes(error.status);
    await admin.from("website_subscriptions").update({
      domain_registration_status: manual ? "manual_attention" : "failed",
      domain_registration_order: { error: error instanceof Error ? error.message : "Domain registration failed" },
    }).eq("paypal_subscription_id", subscriptionId);
    console.error("Included domain registration failed", error instanceof HostingerApiError ? { status: error.status, correlationId: error.correlationId } : undefined);
    return manual ? "manual_attention" as const : "failed" as const;
  }
}

export async function provisionConnectedPlatform(input: { userId: string; email?: string; kennelName?: string; subscription: WebsiteSubscription }) {
  const admin = createAdminSupabaseClient();
  if (!admin) throw new Error("SUPABASE_SERVICE_ROLE_KEY is required for connected platform provisioning.");

  const kennel = await ensureKennel(admin, {
    userId: input.userId,
    email: input.email ?? input.subscription.email,
    kennelName: input.kennelName,
    requestedDomain: input.subscription.requestedDomain,
  });

  const { error: subscriptionError } = await admin.from("website_subscriptions").upsert({
    owner_id: input.userId,
    paypal_subscription_id: input.subscription.subscriptionId,
    paypal_plan_id: input.subscription.planId,
    paypal_status: input.subscription.status,
    requested_domain: input.subscription.requestedDomain,
    purchaser_email: input.subscription.email ?? input.email ?? null,
    setup_fee_cents: 14900,
    monthly_price_cents: 2495,
    annual_domain_renewal_cents: 3900,
    domain_renewal_billed_separately: true,
  }, { onConflict: "paypal_subscription_id" });
  if (subscriptionError) throw new Error(`Website subscription provisioning failed: ${subscriptionError.code}`);

  const entitlements = ["dogbreederweb", "mydogportal"].map((entitlementKey) => ({
    auth_user_id: input.userId,
    kennel_id: kennel.id,
    entitlement_key: entitlementKey,
    source: "dogbreederweb_subscription",
    source_reference: input.subscription.subscriptionId,
    status: "active",
    ends_at: null,
    updated_at: new Date().toISOString(),
  }));
  const { error: entitlementError } = await admin.from("platform_entitlements").upsert(entitlements, { onConflict: "source,source_reference,entitlement_key" });
  if (entitlementError) throw new Error(`Connected website entitlement provisioning failed: ${entitlementError.code}`);

  const domainRegistrationStatus = await ensureIncludedDomainRegistration(admin, input.subscription.subscriptionId, input.subscription.requestedDomain);
  return { kennelId: kennel.id, kennelSlug: kennel.slug, companionPlan: kennel.plan === "website_companion", domainRegistrationStatus };
}
