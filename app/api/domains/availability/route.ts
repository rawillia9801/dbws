import { NextResponse } from "next/server";
import { z } from "zod";
import { checkComDomainAvailability, HostingerApiError } from "@/lib/hostinger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const requestSchema = z.object({ domain: z.string().trim().min(1).max(255) });

export async function POST(request: Request) {
  const parsed = requestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Enter the .com you would like to search." }, { status: 400 });
  try {
    const result = await checkComDomainAvailability(parsed.data.domain);
    return NextResponse.json(result, { headers: { "cache-control": "no-store" } });
  } catch (error) {
    if (error instanceof HostingerApiError) {
      console.error("Hostinger domain availability failed", { status: error.status, correlationId: error.correlationId });
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Domain search is temporarily unavailable." }, { status: 502 });
  }
}
