"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type LoginState = {
  status: "idle" | "success" | "error";
  message: string;
};

const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address.").max(254),
  next: z.string().startsWith("/").max(120).default("/builder"),
});

export async function sendMagicLink(_: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    next: formData.get("next") || "/builder",
  });

  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Check your email address." };
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return { status: "error", message: "Sign-in is not configured yet." };
  }

  const requestHeaders = await headers();
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? requestHeaders.get("origin") ?? "https://dogbreederweb.site";
  const callback = new URL("/auth/callback", origin);
  callback.searchParams.set("next", parsed.data.next);

  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: { emailRedirectTo: callback.toString() },
  });

  if (error) {
    console.error("Magic-link request failed", { code: error.code });
    return { status: "error", message: "We could not send the sign-in link. Please try again." };
  }

  return { status: "success", message: "Check your email for a secure sign-in link." };
}

