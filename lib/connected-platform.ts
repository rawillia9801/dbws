import "server-only";

import { createAdminSupabaseClient } from "@/lib/supabase/admin";

type WebsiteSubscription = {
  subscriptionId: string;
  planId: string;
  status: string;
  requestedDomain: string;
  email?: string;
};

function slugBase(value: string) {
  const normalized = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, 48);

  if (normalized.length >= 3) return normalized;
  return `kennel-${crypto.randomUUID().slice(0, 8)}`;
}

async function availableSlug(
  admin: NonNullable<ReturnType<typeof createAdminSupabaseClient>>,
  preferred: string,
) {
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

async function ensureKennel(
  admin: NonNullable<ReturnType<typeof createAdminSupabaseClient>>,
  input: { userId: string; email?: string; kennelName?: string; requestedDomain?: string },
) {
  const { data: existing, error: lookupError } = await admin
    .from("kennels")
    .select("id,name,slug,plan")
    .eq("owner_auth_user_id", input.userId)
    .maybeSingle();

  if (lookupError) throw new Error(`Kennel lookup failed: ${lookupError.code}`);

  let kennel = existing;
  if (!kennel) {
    const fallbackName = input.email?.split("@")[0]?.trim() || "My Breeding Program";
    const name = input.kennelName?.trim() || fallbackName;
    const slug = await availableSlug(admin, name);
    const { data: created, error } = await admin
      .from("kennels")
      .insert({
        owner_auth_user_id: input.userId,
        name,
        legal_name: name,
        slug,
        plan: "starter",
        contact_email: input.email ?? null,
        custom_domain: input.requestedDomain ?? null,
        domain_status: input.requestedDomain ? "pending" : "not_requested",
      })
      .select("id,name,slug,plan")
      .single();

    if (error || !created) throw new Error(`Kennel creation failed: ${error?.code ?? "unknown"}`);
    kennel = created;
  } else if (input.requestedDomain) {
    const { error } = await admin
      .from("kennels")
      .update({ custom_domain: input.requestedDomain, domain_status: "pending" })
      .eq("id", kennel.id);
    if (error) throw new Error(`Kennel domain update failed: ${error.code}`);
  }

  const { error: membershipError } = await admin.from("kennel_members").upsert(
    { kennel_id: kennel.id, auth_user_id: input.userId, role: "owner" },
    { onConflict: "kennel_id,auth_user_id" },
  );
  if (membershipError) throw new Error(`Kennel membership provisioning failed: ${membershipError.code}`);

  return kennel;
}

async function grantDocumentPacket(
  admin: NonNullable<ReturnType<typeof createAdminSupabaseClient>>,
  userId: string,
  subscriptionId: string,
) {
  const providerReference = `dbws:${subscriptionId}`;
  const { data: existing, error: lookupError } = await admin
    .from("dogdocs_purchases")
    .select("id")
    .eq("provider_reference", providerReference)
    .maybeSingle();
  if (lookupError) throw new Error(`Document entitlement lookup failed: ${lookupError.code}`);

  if (existing) {
    const { error } = await admin
      .from("dogdocs_purchases")
      .update({ payment_status: "included", amount_cents: 0 })
      .eq("id", existing.id);
    if (error) throw new Error(`Document entitlement update failed: ${error.code}`);
    return;
  }

  const { error } = await admin.from("dogdocs_purchases").insert({
    user_id: userId,
    product_type: "packet",
    template_id: null,
    amount_cents: 0,
    payment_status: "included",
    provider_reference: providerReference,
  });
  if (error) throw new Error(`Document entitlement creation failed: ${error.code}`);
}

export async function provisionConnectedPlatform(input: {
  userId: string;
  email?: string;
  kennelName?: string;
  subscription: WebsiteSubscription;
}) {
  const admin = createAdminSupabaseClient();
  if (!admin) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is required for connected platform provisioning.");
  }

  const kennel = await ensureKennel(admin, {
    userId: input.userId,
    email: input.email ?? input.subscription.email,
    kennelName: input.kennelName,
    requestedDomain: input.subscription.requestedDomain,
  });

  const subscriptionRow = {
    owner_id: input.userId,
    paypal_subscription_id: input.subscription.subscriptionId,
    paypal_plan_id: input.subscription.planId,
    paypal_status: input.subscription.status,
    requested_domain: input.subscription.requestedDomain,
    purchaser_email: input.subscription.email ?? input.email ?? null,
    setup_fee_cents: 8900,
    monthly_price_cents: 2000,
    annual_domain_renewal_cents: 3900,
    domain_renewal_billed_separately: true,
  };

  const { error: subscriptionError } = await admin
    .from("website_subscriptions")
    .upsert(subscriptionRow, { onConflict: "paypal_subscription_id" });
  if (subscriptionError) throw new Error(`Website subscription provisioning failed: ${subscriptionError.code}`);

  const entitlements = ["dogbreederweb", "mydogportal", "dogbreederdocs"].map((entitlementKey) => ({
    auth_user_id: input.userId,
    kennel_id: kennel.id,
    entitlement_key: entitlementKey,
    source: "dogbreederweb_subscription",
    source_reference: input.subscription.subscriptionId,
    status: "active",
    ends_at: null,
    updated_at: new Date().toISOString(),
  }));

  const { error: entitlementError } = await admin
    .from("platform_entitlements")
    .upsert(entitlements, { onConflict: "source,source_reference,entitlement_key" });
  if (entitlementError) throw new Error(`Connected entitlement provisioning failed: ${entitlementError.code}`);

  await grantDocumentPacket(admin, input.userId, input.subscription.subscriptionId);

  return { kennelId: kennel.id, kennelSlug: kennel.slug };
}
