import { z } from "zod";
import type { TemplatePackageId } from "@/lib/pricing";
import { getTemplatePackage } from "@/lib/pricing";

const createOrderResponseSchema = z.object({
  id: z.string().min(1),
});

const captureOrderResponseSchema = z.object({
  id: z.string().min(1),
  status: z.string(),
  payment_source: z
    .object({
      paypal: z
        .object({
          name: z
            .object({
              given_name: z.string().optional(),
            })
            .optional(),
        })
        .optional(),
    })
    .optional(),
  purchase_units: z.array(
    z.object({
      reference_id: z.string().optional(),
      custom_id: z.string().optional(),
      payments: z
        .object({
          captures: z.array(
            z.object({
              status: z.string(),
              amount: z.object({
                currency_code: z.string(),
                value: z.string(),
              }),
            }),
          ),
        })
        .optional(),
    }),
  ),
});

type PayPalErrorBody = {
  debug_id?: string;
  message?: string;
  name?: string;
};

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
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new PayPalError("PayPal checkout is not configured.", 503);
  }

  const environment = process.env.PAYPAL_ENVIRONMENT === "sandbox" ? "sandbox" : "live";
  return {
    clientId,
    clientSecret,
    baseUrl: environment === "sandbox" ? "https://api-m.sandbox.paypal.com" : "https://api-m.paypal.com",
  };
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

async function paypalRequest(path: string, init: RequestInit, requestId = crypto.randomUUID()) {
  const { accessToken, baseUrl } = await getAccessToken();
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "PayPal-Request-Id": requestId,
      ...init.headers,
    },
    cache: "no-store",
  });
  const body = (await response.json().catch(() => ({}))) as PayPalErrorBody;

  if (!response.ok) {
    throw new PayPalError(body.message || "PayPal could not process this request.", response.status, body.debug_id);
  }

  return body;
}

export async function createPayPalOrder(packageId: TemplatePackageId) {
  const templatePackage = getTemplatePackage(packageId);
  if (!templatePackage) {
    throw new PayPalError("Unknown website package.", 400);
  }

  const body = await paypalRequest("/v2/checkout/orders", {
    method: "POST",
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: templatePackage.id,
          custom_id: templatePackage.id,
          description: `${templatePackage.name} dog breeder website template`,
          amount: {
            currency_code: "USD",
            value: templatePackage.price,
          },
        },
      ],
      payment_source: {
        paypal: {
          experience_context: {
            brand_name: "Dog Breeder Web",
            shipping_preference: "NO_SHIPPING",
            user_action: "PAY_NOW",
          },
        },
      },
    }),
  });

  return createOrderResponseSchema.parse(body);
}

export async function capturePayPalOrder(orderId: string, packageId: TemplatePackageId) {
  const templatePackage = getTemplatePackage(packageId);
  if (!templatePackage) {
    throw new PayPalError("Unknown website package.", 400);
  }

  const body = await paypalRequest(
    `/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`,
    {
      method: "POST",
      body: "{}",
    },
    `dbws-capture-${orderId}`,
  );
  const order = captureOrderResponseSchema.parse(body);
  const purchaseUnit = order.purchase_units.find(
    (unit) => unit.reference_id === templatePackage.id || unit.custom_id === templatePackage.id,
  );
  const completedCapture = purchaseUnit?.payments?.captures.find((capture) => capture.status === "COMPLETED");

  if (
    order.status !== "COMPLETED" ||
    !completedCapture ||
    completedCapture.amount.currency_code !== "USD" ||
    completedCapture.amount.value !== templatePackage.price
  ) {
    throw new PayPalError("The captured payment did not match the selected package.", 422);
  }

  return {
    orderId: order.id,
    status: order.status,
    firstName: order.payment_source?.paypal?.name?.given_name,
  };
}
