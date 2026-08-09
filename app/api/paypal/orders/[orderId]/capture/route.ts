import { NextResponse } from "next/server";
import { z } from "zod";
import { capturePayPalOrder, PayPalError } from "@/lib/paypal";

export const runtime = "nodejs";

const captureSchema = z.object({
  packageId: z.enum(["heritage", "modern-meadow", "signature"]),
});

const orderIdSchema = z.string().regex(/^[A-Z0-9]{10,32}$/i);

export async function POST(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> },
) {
  try {
    const { orderId } = await params;
    const parsedOrderId = orderIdSchema.safeParse(orderId);
    const parsedBody = captureSchema.safeParse(await request.json());

    if (!parsedOrderId.success || !parsedBody.success) {
      return NextResponse.json({ error: "This PayPal order is not valid." }, { status: 400 });
    }

    const capture = await capturePayPalOrder(parsedOrderId.data, parsedBody.data.packageId);
    return NextResponse.json(capture);
  } catch (error) {
    if (error instanceof PayPalError) {
      console.error("PayPal order capture failed", { status: error.status, debugId: error.debugId });
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error("PayPal order capture failed unexpectedly");
    return NextResponse.json({ error: "Payment could not be completed. Please try again." }, { status: 500 });
  }
}
