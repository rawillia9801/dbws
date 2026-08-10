import { NextResponse } from "next/server";
import { z } from "zod";
import { createMailbox, findMailOrderForDomain, HostingerApiError, listMailboxes } from "@/lib/hostinger";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  localParts: z.array(z.string().trim().min(1).max(64)).min(1).max(2),
});

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();
  const admin = createAdminSupabaseClient();
  if (!supabase || !admin) return NextResponse.json({ error: "Email provisioning is not configured." }, { status: 503 });
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return NextResponse.json({ error: "Sign in to create your business email addresses." }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || "Choose one or two email names." }, { status: 400 });

  const uniqueLocals = [...new Set(parsed.data.localParts.map((part) => part.toLowerCase()))];
  const { data: subscription, error: subscriptionError } = await admin.from("website_subscriptions")
    .select("paypal_subscription_id,requested_domain,paypal_status,mailbox_addresses")
    .eq("owner_id", authData.user.id)
    .in("paypal_status", ["APPROVED", "ACTIVE"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (subscriptionError || !subscription) return NextResponse.json({ error: "An active Dog Breeder Web subscription is required." }, { status: 403 });

  try {
    const mailOrder = await findMailOrderForDomain(subscription.requested_domain);
    if (!mailOrder) {
      await admin.from("website_subscriptions").update({ email_provisioning_status: "manual_attention" }).eq("paypal_subscription_id", subscription.paypal_subscription_id);
      return NextResponse.json({ error: "The domain is registered, but a Hostinger Email order is not attached to it yet. The two included mailboxes can be created as soon as the email order is active." }, { status: 409 });
    }

    const existing = await listMailboxes(mailOrder.id);
    const existingAddresses = existing.map((row) => String(row.email || row.address || row.mailbox || "").toLowerCase()).filter(Boolean);
    const domain = subscription.requested_domain.toLowerCase();
    const existingForDomain = existingAddresses.filter((address) => address.endsWith(`@${domain}`));
    if (existingForDomain.length >= 2) {
      await admin.from("website_subscriptions").update({ email_provisioning_status: "configured", mailbox_addresses: existingForDomain.slice(0, 2) }).eq("paypal_subscription_id", subscription.paypal_subscription_id);
      return NextResponse.json({ configured: true, addresses: existingForDomain.slice(0, 2), message: "Your two included business email addresses are already configured." });
    }

    const availableSlots = 2 - existingForDomain.length;
    const requested = uniqueLocals.filter((local) => !existingAddresses.includes(`${local}@${domain}`)).slice(0, availableSlots);
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

    return NextResponse.json({
      configured: addresses.length === 2,
      addresses,
      credentials,
      webmailUrl: "https://mail.hostinger.com",
      message: credentials.length ? "Mailbox creation complete. Save the temporary passwords now; they are not stored by Dog Breeder Web." : "No new mailbox was needed.",
    }, { headers: { "cache-control": "no-store" } });
  } catch (error) {
    if (error instanceof HostingerApiError) {
      console.error("Hostinger mailbox provisioning failed", { status: error.status, correlationId: error.correlationId });
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "The business email addresses could not be created right now." }, { status: 502 });
  }
}
