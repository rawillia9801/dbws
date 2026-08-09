"use client";

import { useActionState } from "react";
import { ArrowRight, Mail } from "lucide-react";
import { sendMagicLink, type LoginState } from "@/app/login/actions";

const initialState: LoginState = { status: "idle", message: "" };

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(sendMagicLink, initialState);

  return (
    <form className="login-card" action={action}>
      <span className="login-icon"><Mail size={24} /></span>
      <h2>Open your breeder workspace</h2>
      <p>We will email you a private sign-in link. No password to remember.</p>
      <input type="hidden" name="next" value={next} />
      <label>
        Email address
        <input name="email" type="email" autoComplete="email" placeholder="you@yourkennel.com" required />
      </label>
      <button className="button button-primary" disabled={pending} type="submit">
        {pending ? "Sending…" : "Email my sign-in link"}<ArrowRight size={17} />
      </button>
      {state.message && <p className={`form-status ${state.status}`} role="status">{state.message}</p>}
    </form>
  );
}

