import { NextResponse } from "next/server";
import { z } from "zod";
import { createPayPalOrder, PayPalError } from "@/lib/paypal";

export const runtime = "nodejs";

const orderSchema = z.object({
  packageId: z.enum(["heritage", "modern-meadow", "signature"]),
});

export async function POST(request: Request) {
  try {
    const parsed = orderSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Choose a valid website package." }, { status: 400 });
    }

    const order = await createPayPalOrder(parsed.data.packageId);
    return NextResponse.json({ id: order.id }, { status: 201 });
  } catch (error) {
    if (error instanceof PayPalError) {
      console.error("PayPal order creation failed", { status: error.status, debugId: error.debugId });
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error("PayPal order creation failed unexpectedly");
    return NextResponse.json({ error: "Checkout could not be started. Please try again." }, { status: 500 });
  }
}
