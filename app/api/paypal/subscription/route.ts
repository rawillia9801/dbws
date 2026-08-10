import { NextResponse } from "next/server";
import { z } from "zod";
import { provisionConnectedPlatform } from "@/lib/connected-platform";
import { DomainValidationError, normalizeComDomain } from "@/lib/domain";
import {
  getPayPalClientConfig,
  getWebsitePlanVerification,
  PayPalError,
  verifyWebsiteSubscription,
} from "@/lib/paypal";
import { websitePlan } from "@/lib/pricing";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const confirmationSchema = z.object({
  subscriptionId: z.string().regex(/^I-[A-Z0-9]+$/i),
  requestedDomain: z.string().trim().min(1).max(255),
});

function paymentError(error: unknown) {
  if (error instanceof DomainValidationError) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  if (error instanceof PayPalError) {
    console.error("PayPal website subscription failed", { status: error.status, debugId: error.debugId });
    return NextResponse.json({ error: error.message }, { status: error.status });
  }

  console.error(
    "PayPal website subscription failed unexpectedly",
    error instanceof Error ? { name: error.name, message: error.message } : undefined,
  );
  return NextResponse.json({ error: "PayPal checkout is temporarily unavailable." }, { status: 500 });
}

async function connectSubscriptionToSignedInBreeder(subscription: Awaited<ReturnType<typeof verifyWebsiteSubscription>>) {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return false;

  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return false;

  await provisionConnectedPlatform({
    userId: authData.user.id,
    email: authData.user.email,
    kennelName: typeof authData.user.user_metadata?.kennel_name === "string"
      ? authData.user.user_metadata.kennel_name
      : undefined,
    subscription,
  });

  return true;
}

export async function GET() {
  try {
    const [{ clientId, environment }, plan] = await Promise.all([
      Promise.resolve(getPayPalClientConfig()),
      getWebsitePlanVerification(),
    ]);

    return NextResponse.json(
      {
        clientId,
        environment,
        planId: plan.planId,
        planStatus: plan.status,
        setupFee: plan.setupFee,
        monthlyPrice: plan.monthlyPrice,
        setupFeeFailureAction: plan.setupFeeFailureAction,
        annualDomainRenewal: websitePlan.domainRenewal,
        annualDomainRenewalBilling: "separate",
        connectedAccess: {
          website: true,
          myDogPortalCompanion: true,
          dogBreederDocs: "available separately or included with eligible MyDogPortal upgrades",
        },
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return paymentError(error);
  }
}

export async function POST(request: Request) {
  try {
    const parsed = confirmationSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ error: "This PayPal subscription or requested domain is not valid." }, { status: 400 });
    }

    const requestedDomain = normalizeComDomain(parsed.data.requestedDomain);
    const subscription = await verifyWebsiteSubscription(parsed.data.subscriptionId, requestedDomain);
    const connectedToBreeder = await connectSubscriptionToSignedInBreeder(subscription);
    const response = NextResponse.json(
      { ...subscription, connectedToBreeder },
      { headers: { "Cache-Control": "no-store" } },
    );

    if (!connectedToBreeder) {
      const pending = Buffer.from(JSON.stringify({
        subscriptionId: subscription.subscriptionId,
        requestedDomain: subscription.requestedDomain,
      })).toString("base64url");

      response.cookies.set("dbws_pending_subscription", pending, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });
    }

    return response;
  } catch (error) {
    return paymentError(error);
  }
}
