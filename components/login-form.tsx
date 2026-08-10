"use client";

import { useActionState } from "react";
import { ArrowRight, LockKeyhole } from "lucide-react";
import { authenticate, type LoginState } from "@/app/login/actions";

const initialState: LoginState = { status: "idle", message: "" };

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(authenticate, initialState);

  return (
    <form className="login-card" action={action}>
      <span className="login-icon"><LockKeyhole size={24} /></span>
      <h2>Open your breeder workspace</h2>
      <p>Use one breeder account for Dog Breeder Web, MyDogPortal, and DogBreederDocs.</p>
      <input type="hidden" name="next" value={next} />
      <label>
        Email address
        <input name="email" type="email" autoComplete="email" placeholder="you@yourkennel.com" required />
      </label>
      <label>
        Password
        <input name="password" type="password" autoComplete="current-password" minLength={8} placeholder="At least 8 characters" required />
      </label>
      <label>
        Kennel or breeding-business name
        <input name="kennelName" type="text" autoComplete="organization" maxLength={100} placeholder="Needed when creating a new account" />
      </label>
      <button className="button button-primary" disabled={pending} type="submit" name="mode" value="signin">
        {pending ? "Working…" : "Sign in"}<ArrowRight size={17} />
      </button>
      <button className="button button-outline" disabled={pending} type="submit" name="mode" value="signup">
        Create breeder account
      </button>
      <small>Your kennel name is only required when creating a new breeder account.</small>
      {state.message && <p className={`form-status ${state.status}`} role="status">{state.message}</p>}
    </form>
  );
}
