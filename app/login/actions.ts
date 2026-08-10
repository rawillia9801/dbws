"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type LoginState = {
  status: "idle" | "success" | "error";
  message: string;
};

const authSchema = z.object({
  email: z.string().trim().email("Enter a valid email address.").max(254),
  password: z.string().min(8, "Password must be at least 8 characters.").max(72, "Password is too long."),
  mode: z.enum(["signin", "signup"]),
  next: z.string().startsWith("/").max(120).default("/builder"),
});

function getSiteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "https://dogbreederweb.site").replace(/\/$/, "");
}

export async function authenticate(_: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = authSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    mode: formData.get("mode"),
    next: formData.get("next") || "/builder",
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Check your sign-in details.",
    };
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return { status: "error", message: "Sign-in is not configured yet." };
  }

  const { email, password, mode, next } = parsed.data;

  if (mode === "signin") {
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      console.error("Password sign-in failed", { code: error.code });
      return {
        status: "error",
        message: "We could not sign you in with that email and password.",
      };
    }

    redirect(next);
  }

  const callback = new URL("/auth/callback", getSiteUrl());
  callback.searchParams.set("next", next);

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: callback.toString(),
    },
  });

  if (error) {
    console.error("Password sign-up failed", { code: error.code });
    return {
      status: "error",
      message: "We could not create that account. Please check the details and try again.",
    };
  }

  if (data.session) {
    redirect(next);
  }

  return {
    status: "success",
    message: "Account created. Check your email to confirm your address, then return here and sign in with your password.",
  };
}
