"use server";

import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type InquiryState = {
  status: "idle" | "success" | "error";
  message: string;
};

const inquirySchema = z.object({
  name: z.string().trim().min(2, "Please enter your name.").max(100),
  email: z.string().trim().email("Please enter a valid email address.").max(254),
  kennelName: z.string().trim().max(140).optional(),
  breed: z.string().trim().min(2, "Please tell us what breed you raise.").max(120),
  website: z.string().trim().max(240).optional(),
  timeline: z.enum(["as-soon-as-possible", "one-to-two-months", "three-plus-months", "exploring"]),
  goals: z.string().trim().min(10, "Please share a little more about what you need.").max(2000),
  requestedService: z.enum(["general", "website-personalization", "custom-website", "business-voice"]),
  company: z.string().max(0),
});

export async function submitInquiry(_: InquiryState, formData: FormData): Promise<InquiryState> {
  const parsed = inquirySchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    kennelName: formData.get("kennelName") || undefined,
    breed: formData.get("breed"),
    website: formData.get("website") || undefined,
    timeline: formData.get("timeline"),
    goals: formData.get("goals"),
    requestedService: formData.get("requestedService") || "general",
    company: formData.get("company") ?? "",
  });

  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Please review the form and try again." };
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return { status: "error", message: "The inquiry form is being connected. Please email hello@dogbreederweb.site for now." };
  }

  const { company: _company, ...inquiry } = parsed.data;
  void _company;
  const { error } = await supabase.from("website_inquiries").insert({
    name: inquiry.name,
    email: inquiry.email,
    kennel_name: inquiry.kennelName || null,
    breed: inquiry.breed,
    current_website: inquiry.website || null,
    timeline: inquiry.timeline,
    goals: inquiry.goals,
    requested_service: inquiry.requestedService,
    source: "dogbreederweb.site",
  });

  if (error) {
    console.error("Website inquiry submission failed", { code: error.code, requestedService: inquiry.requestedService });
    return { status: "error", message: "We could not send your request just now. Please try again or email hello@dogbreederweb.site." };
  }

  const serviceMessage = inquiry.requestedService === "general"
    ? "Your website request has been received."
    : "Your optional service request has been received.";

  return { status: "success", message: `Thank you. ${serviceMessage} We will follow up by email.` };
}
