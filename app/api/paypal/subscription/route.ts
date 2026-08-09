import { NextResponse } from "next/server";
import { z } from "zod";
import {
  getPayPalClientConfig,
  getWebsitePlanId,
  PayPalError,
  verifyWebsiteSubscription,
} from "@/lib/paypal";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const confirmationSchema = z.object({
  subscriptionId: z.string().regex(/^I-[A-Z0-9]+$/i),
});

function paymentError(error: unknown) {
  if (error instanceof PayPalError) {
    console.error("PayPal website subscription failed", { status: error.status, debugId: error.debugId });
    return NextResponse.json({ error: error.message }, { status: error.status });
  }

  console.error("PayPal website subscription failed unexpectedly");
  return NextResponse.json({ error: "PayPal checkout is temporarily unavailable." }, { status: 500 });
}

export async function GET() {
  try {
    const [{ clientId, environment }, planId] = await Promise.all([
      Promise.resolve(getPayPalClientConfig()),
      getWebsitePlanId(),
    ]);
    return NextResponse.json(
      { clientId, environment, planId },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return paymentError(error);
  }
}

export async function POST(request: Request) {
  try {
    const parsed = confirmationSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "This PayPal subscription is not valid." }, { status: 400 });
    }

    const subscription = await verifyWebsiteSubscription(parsed.data.subscriptionId);
    return NextResponse.json(subscription, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return paymentError(error);
  }
}
