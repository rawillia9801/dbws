import { z } from "zod";
import { websitePlan } from "@/lib/pricing";

type PayPalErrorBody = {
  debug_id?: string;
  message?: string;
  details?: Array<{ description?: string }>;
};

type PayPalProduct = { id: string; name?: string };
type PayPalPlan = { id: string; name?: string; status?: string };

const subscriptionSchema = z.object({
  id: z.string().min(1),
  plan_id: z.string().min(1),
  status: z.string().min(1),
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
  const productName = "Dog Breeder Web Website Plan";
  const listed = await paypalRequest<{ products?: PayPalProduct[] }>("/v1/catalogs/products?page_size=100&total_required=true");
  const existing = listed.products?.find((product) => product.name === productName && product.id);
  if (existing?.id) return existing.id;

  const created = await paypalRequest<PayPalProduct>(
    "/v1/catalogs/products",
    {
      method: "POST",
      body: JSON.stringify({
        name: productName,
        description: "AI breeder website builder, managed hosting, SSL, and two branded business emails.",
        type: "SERVICE",
      }),
    },
    "dbws-website-product-v1",
  );
  if (!created.id) throw new PayPalError("PayPal did not return a product ID.", 502);
  return created.id;
}

let websitePlanPromise: Promise<string> | null = null;

async function createOrFindWebsitePlan() {
  const productId = await ensureProduct();
  const planName = "Dog Breeder Web Monthly";
  const listed = await paypalRequest<{ plans?: PayPalPlan[] }>(`/v1/billing/plans?product_id=${encodeURIComponent(productId)}&page_size=20`);
  const existing = listed.plans?.find((plan) => plan.name === planName && plan.id && plan.status !== "INACTIVE");
  if (existing?.id) return existing.id;

  const created = await paypalRequest<PayPalPlan>(
    "/v1/billing/plans",
    {
      method: "POST",
      body: JSON.stringify({
        product_id: productId,
        name: planName,
        description: websitePlan.description,
        billing_cycles: [
          {
            frequency: { interval_unit: "MONTH", interval_count: 1 },
            tenure_type: "REGULAR",
            sequence: 1,
            total_cycles: 0,
            pricing_scheme: { fixed_price: { value: websitePlan.price, currency_code: "USD" } },
          },
        ],
        payment_preferences: {
          auto_bill_outstanding: true,
          payment_failure_threshold: 3,
        },
      }),
    },
    "dbws-website-monthly-plan-v1",
  );
  if (!created.id) throw new PayPalError("PayPal did not return a billing plan ID.", 502);
  return created.id;
}

export async function getWebsitePlanId() {
  websitePlanPromise ??= createOrFindWebsitePlan().catch((error) => {
    websitePlanPromise = null;
    throw error;
  });
  return websitePlanPromise;
}

export function getPayPalClientConfig() {
  const { clientId, environment } = getPayPalConfig();
  return { clientId, environment };
}

export async function verifyWebsiteSubscription(subscriptionId: string) {
  if (!/^I-[A-Z0-9]+$/i.test(subscriptionId)) {
    throw new PayPalError("This PayPal subscription is not valid.", 400);
  }

  const expectedPlanId = await getWebsitePlanId();
  const body = await paypalRequest<unknown>(`/v1/billing/subscriptions/${encodeURIComponent(subscriptionId)}`);
  const subscription = subscriptionSchema.parse(body);
  if (subscription.plan_id !== expectedPlanId) {
    throw new PayPalError("This subscription does not match the Dog Breeder Web plan.", 409);
  }
  if (!["APPROVAL_PENDING", "APPROVED", "ACTIVE"].includes(subscription.status.toUpperCase())) {
    throw new PayPalError("PayPal has not approved this subscription.", 409);
  }

  return {
    subscriptionId: subscription.id,
    status: subscription.status,
    firstName: subscription.subscriber?.name?.given_name,
    email: subscription.subscriber?.email_address,
  };
}
