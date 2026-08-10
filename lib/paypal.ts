import { z } from "zod";
import { normalizeComDomain } from "@/lib/domain";
import { websitePlan } from "@/lib/pricing";

type PayPalErrorBody = {
  debug_id?: string;
  message?: string;
  details?: Array<{ description?: string }>;
};

type PayPalProduct = { id: string; name?: string };
type PayPalPlanSummary = { id: string; name?: string; status?: string };

const PRODUCT_NAME = "Dog Breeder Web Complete Website Service";
const PLAN_NAME = "Dog Breeder Web | $149 Setup + $24.95 Monthly | 2026-08";
const PRODUCT_REQUEST_ID = "dbws-complete-website-product-2026-v1";
const PLAN_REQUEST_ID = "dbws-live-149-setup-24-95-monthly-2026-08-v1";

const moneySchema = z.object({
  value: z.string(),
  currency_code: z.string(),
});

const planSchema = z.object({
  id: z.string().min(1),
  name: z.string().optional(),
  status: z.string().min(1),
  billing_cycles: z.array(z.object({
    frequency: z.object({
      interval_unit: z.string(),
      interval_count: z.number(),
    }),
    tenure_type: z.string(),
    sequence: z.number(),
    total_cycles: z.number().optional(),
    pricing_scheme: z.object({ fixed_price: moneySchema }),
  })),
  payment_preferences: z.object({
    setup_fee: moneySchema,
    setup_fee_failure_action: z.string(),
  }),
});

const subscriptionSchema = z.object({
  id: z.string().min(1),
  plan_id: z.string().min(1),
  status: z.string().min(1),
  custom_id: z.string().optional(),
  subscriber: z.object({
    name: z.object({ given_name: z.string().optional() }).optional(),
    email_address: z.string().optional(),
  }).optional(),
});

export class PayPalError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly debugId?: string,
  ) {
    super(message);
    this.name = "PayPalError";
  }
}

function getPayPalConfig() {
  const clientId = process.env.PAYPAL_CLIENT_ID?.trim();
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET?.trim();

  if (!clientId || !clientSecret) {
    throw new PayPalError("PayPal checkout is not configured.", 503);
  }

  const environment = process.env.PAYPAL_ENVIRONMENT === "sandbox" ? "sandbox" : "live";
  return {
    clientId,
    environment,
    clientSecret,
    baseUrl: environment === "sandbox" ? "https://api-m.sandbox.paypal.com" : "https://api-m.paypal.com",
  } as const;
}

async function getAccessToken() {
  const { clientId, clientSecret, baseUrl } = getPayPalConfig();
  const authorization = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Basic ${authorization}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });

  const body = (await response.json().catch(() => ({}))) as PayPalErrorBody & { access_token?: string };
  if (!response.ok || !body.access_token) {
    throw new PayPalError("PayPal authentication failed.", 502, body.debug_id);
  }

  return { accessToken: body.access_token, baseUrl };
}

async function paypalRequest<T>(path: string, init: RequestInit = {}, requestId?: string) {
  const { accessToken, baseUrl } = await getAccessToken();
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  headers.set("Authorization", `Bearer ${accessToken}`);
  if (init.body) headers.set("Content-Type", "application/json");
  if (requestId) headers.set("PayPal-Request-Id", requestId);

  const response = await fetch(`${baseUrl}${path}`, { ...init, headers, cache: "no-store" });
  const body = (await response.json().catch(() => ({}))) as T & PayPalErrorBody;
  if (!response.ok) {
    const detail = body.details?.find((item) => item.description)?.description;
    throw new PayPalError(detail || body.message || "PayPal could not process this request.", response.status, body.debug_id);
  }
  return body;
}

async function ensureProduct() {
  const listed = await paypalRequest<{ products?: PayPalProduct[] }>("/v1/catalogs/products?page_size=100&total_required=true");
  const existing = listed.products?.find((product) => product.name === PRODUCT_NAME && product.id);
  if (existing?.id) return existing.id;

  const created = await paypalRequest<PayPalProduct>(
    "/v1/catalogs/products",
    {
      method: "POST",
      body: JSON.stringify({
        name: PRODUCT_NAME,
        description: "Complete breeder website service with BreederWeb Designer, managed hosting, domain, branded email, publishing, forms, embeds, and version history.",
        type: "SERVICE",
      }),
    },
    PRODUCT_REQUEST_ID,
  );
  if (!created.id) throw new PayPalError("PayPal did not return a product ID.", 502);
  return created.id;
}

function validatePlanConfiguration(input: unknown) {
  const plan = planSchema.parse(input);
  const regularCycle = plan.billing_cycles.find((cycle) => cycle.tenure_type.toUpperCase() === "REGULAR");
  const monthlyPrice = regularCycle?.pricing_scheme.fixed_price;
  const setupFee = plan.payment_preferences.setup_fee;

  const correct =
    plan.name === PLAN_NAME &&
    plan.status.toUpperCase() === "ACTIVE" &&
    regularCycle?.frequency.interval_unit.toUpperCase() === "MONTH" &&
    regularCycle.frequency.interval_count === 1 &&
    Number(monthlyPrice?.value) === Number(websitePlan.monthlyPrice) &&
    monthlyPrice?.currency_code.toUpperCase() === "USD" &&
    Number(setupFee.value) === Number(websitePlan.setupFee) &&
    setupFee.currency_code.toUpperCase() === "USD" &&
    plan.payment_preferences.setup_fee_failure_action.toUpperCase() === "CANCEL";

  if (!correct) {
    throw new PayPalError("The configured PayPal website plan does not match the required pricing.", 409);
  }

  return {
    planId: plan.id,
    name: plan.name ?? PLAN_NAME,
    status: plan.status,
    setupFee: Number(setupFee.value).toFixed(2),
    monthlyPrice: Number(monthlyPrice?.value).toFixed(2),
    setupFeeFailureAction: plan.payment_preferences.setup_fee_failure_action,
  };
}

async function readPlan(planId: string) {
  const body = await paypalRequest<unknown>(`/v1/billing/plans/${encodeURIComponent(planId)}`);
  return validatePlanConfiguration(body);
}

let websitePlanPromise: Promise<string> | null = null;

async function createOrFindWebsitePlan() {
  const productId = await ensureProduct();
  const listed = await paypalRequest<{ plans?: PayPalPlanSummary[] }>(`/v1/billing/plans?product_id=${encodeURIComponent(productId)}&page_size=20&total_required=true`);
  const existing = listed.plans?.find((plan) => plan.name === PLAN_NAME && plan.id && plan.status !== "INACTIVE");

  if (existing?.id) {
    await readPlan(existing.id);
    return existing.id;
  }

  const created = await paypalRequest<PayPalPlanSummary>(
    "/v1/billing/plans",
    {
      method: "POST",
      body: JSON.stringify({
        product_id: productId,
        name: PLAN_NAME,
        description: websitePlan.description,
        status: "ACTIVE",
        billing_cycles: [
          {
            frequency: { interval_unit: "MONTH", interval_count: 1 },
            tenure_type: "REGULAR",
            sequence: 1,
            total_cycles: 0,
            pricing_scheme: { fixed_price: { value: websitePlan.monthlyPrice, currency_code: "USD" } },
          },
        ],
        payment_preferences: {
          auto_bill_outstanding: true,
          setup_fee: { value: websitePlan.setupFee, currency_code: "USD" },
          setup_fee_failure_action: "CANCEL",
          payment_failure_threshold: 3,
        },
      }),
    },
    PLAN_REQUEST_ID,
  );
  if (!created.id) throw new PayPalError("PayPal did not return a billing plan ID.", 502);
  await readPlan(created.id);
  return created.id;
}

export async function getWebsitePlanId() {
  websitePlanPromise ??= createOrFindWebsitePlan().catch((error) => {
    websitePlanPromise = null;
    throw error;
  });
  return websitePlanPromise;
}

export async function getWebsitePlanVerification() {
  const planId = await getWebsitePlanId();
  return readPlan(planId);
}

export function getPayPalClientConfig() {
  const { clientId, environment } = getPayPalConfig();
  return { clientId, environment };
}

export async function verifyWebsiteSubscription(subscriptionId: string, requestedDomain: string) {
  if (!/^I-[A-Z0-9]+$/i.test(subscriptionId)) {
    throw new PayPalError("This PayPal subscription is not valid.", 400);
  }

  const normalizedDomain = normalizeComDomain(requestedDomain);
  const expectedPlanId = await getWebsitePlanId();
  const body = await paypalRequest<unknown>(`/v1/billing/subscriptions/${encodeURIComponent(subscriptionId)}`);
  const subscription = subscriptionSchema.parse(body);

  if (subscription.id !== subscriptionId) {
    throw new PayPalError("PayPal returned a different subscription than the one approved.", 409);
  }
  if (subscription.plan_id !== expectedPlanId) {
    throw new PayPalError("This subscription does not match the Dog Breeder Web plan.", 409);
  }
  if (!["APPROVED", "ACTIVE"].includes(subscription.status.toUpperCase())) {
    throw new PayPalError("PayPal has not approved this subscription.", 409);
  }
  if (subscription.custom_id !== normalizedDomain) {
    throw new PayPalError("The PayPal subscription does not match the requested domain.", 409);
  }

  return {
    subscriptionId: subscription.id,
    planId: subscription.plan_id,
    status: subscription.status.toUpperCase(),
    requestedDomain: normalizedDomain,
    firstName: subscription.subscriber?.name?.given_name,
    email: subscription.subscriber?.email_address,
  };
}
