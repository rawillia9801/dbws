import "server-only";

import { createMailbox, findMailOrderForDomain, listMailboxes } from "@/lib/hostinger";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export async function provisionIncludedMailboxes(userId: string, requestedLocalParts: string[]) {
  const admin = createAdminSupabaseClient();
  if (!admin) throw new Error("Email provisioning is not configured.");
  const uniqueLocals = [...new Set(requestedLocalParts.map((part) => part.trim().toLowerCase()).filter(Boolean))].slice(0, 2);
  if (!uniqueLocals.length) throw new Error("Choose one or two email names.");

  const { data: subscription, error } = await admin.from("website_subscriptions")
    .select("paypal_subscription_id,requested_domain,paypal_status")
    .eq("owner_id", userId)
    .in("paypal_status", ["APPROVED", "ACTIVE"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error || !subscription) throw new Error("An active Dog Breeder Web subscription is required to create the included mailboxes.");

  const domain = subscription.requested_domain.toLowerCase();
  const mailOrder = await findMailOrderForDomain(domain);
  if (!mailOrder) {
    await admin.from("website_subscriptions").update({ email_provisioning_status: "manual_attention" }).eq("paypal_subscription_id", subscription.paypal_subscription_id);
    throw new Error("Your domain is set up, but its Hostinger Email order is not active yet. Mailboxes can be created as soon as that email order is available.");
  }

  const existing = await listMailboxes(mailOrder.id);
  const existingAddresses = existing.map((row) => String(row.email || row.address || row.mailbox || "").toLowerCase()).filter(Boolean);
  const existingForDomain = existingAddresses.filter((address) => address.endsWith(`@${domain}`));
  if (existingForDomain.length >= 2) {
    const addresses = existingForDomain.slice(0, 2);
    await admin.from("website_subscriptions").update({ email_provisioning_status: "configured", mailbox_addresses: addresses }).eq("paypal_subscription_id", subscription.paypal_subscription_id);
    return { addresses, credentials: [] as Array<{ address: string; password: string }>, alreadyConfigured: true };
  }

  const requested = uniqueLocals.filter((local) => !existingAddresses.includes(`${local}@${domain}`)).slice(0, 2 - existingForDomain.length);
  const credentials: Array<{ address: string; password: string }> = [];
  for (const local of requested) {
    const created = await createMailbox(mailOrder.id, local);
    credentials.push({ address: `${created.localPart}@${domain}`, password: created.password });
  }
  const addresses = [...existingForDomain, ...credentials.map((item) => item.address)].slice(0, 2);
  await admin.from("website_subscriptions").update({
    email_provisioning_status: addresses.length === 2 ? "configured" : "ready",
    mailbox_addresses: addresses,
  }).eq("paypal_subscription_id", subscription.paypal_subscription_id);
  return { addresses, credentials, alreadyConfigured: false };
}
