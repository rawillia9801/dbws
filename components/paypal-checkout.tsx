"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { CheckCircle2, LoaderCircle } from "lucide-react";

type PaymentStatus = "loading" | "ready" | "processing" | "success" | "error";

type PayPalButtons = {
  render: (target: HTMLElement) => Promise<void>;
  close: () => Promise<void>;
};

type PayPalWindow = Window & {
  paypal?: {
    Buttons: (options: {
      style: { color: "gold"; label: "subscribe"; layout: "vertical"; shape: "rect" };
      createSubscription: (_data: unknown, actions: { subscription: { create: (input: { plan_id: string }) => Promise<string> } }) => Promise<string>;
      onApprove: (data: { subscriptionID?: string }) => Promise<void>;
      onCancel: () => void;
      onError: (error: unknown) => void;
    }) => PayPalButtons;
  };
};

let paypalScriptPromise: Promise<void> | null = null;

function loadPayPalScript(clientId: string) {
  if ((window as PayPalWindow).paypal) return Promise.resolve();
  if (paypalScriptPromise) return paypalScriptPromise;

  paypalScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    const query = new URLSearchParams({
      "client-id": clientId,
      components: "buttons",
      currency: "USD",
      intent: "subscription",
      vault: "true",
    });
    script.src = `https://www.paypal.com/sdk/js?${query.toString()}`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("PayPal could not be loaded."));
    document.head.appendChild(script);
  });

  return paypalScriptPromise;
}

async function readError(response: Response, fallback: string) {
  const body = (await response.json().catch(() => ({}))) as { error?: string };
  return body.error || fallback;
}

export function PayPalCheckout() {
  const buttonHost = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<PaymentStatus>("loading");
  const [message, setMessage] = useState("Preparing secure monthly checkout…");

  useEffect(() => {
    if (!buttonHost.current) return;

    let active = true;
    let buttons: PayPalButtons | null = null;
    const host = buttonHost.current;

    async function initialize() {
      try {
        const configResponse = await fetch("/api/paypal/subscription", { cache: "no-store" });
        if (!configResponse.ok) throw new Error(await readError(configResponse, "PayPal checkout is being connected."));
        const config = (await configResponse.json()) as { clientId: string; environment: "live" | "sandbox"; planId: string };
        await loadPayPalScript(config.clientId);
        const paypal = (window as PayPalWindow).paypal;
        if (!paypal) throw new Error("PayPal checkout is unavailable.");

        buttons = paypal.Buttons({
          style: { color: "gold", label: "subscribe", layout: "vertical", shape: "rect" },
          createSubscription: async (_data, actions) => {
            if (active) {
              setStatus("processing");
              setMessage("Opening PayPal subscription approval…");
            }
            return actions.subscription.create({ plan_id: config.planId });
          },
          onApprove: async ({ subscriptionID }) => {
            try {
              if (!subscriptionID) throw new Error("PayPal did not return a subscription ID.");
              if (active) setMessage("Confirming your website plan…");
              const response = await fetch("/api/paypal/subscription", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ subscriptionId: subscriptionID }),
              });
              if (!response.ok) throw new Error(await readError(response, "The subscription could not be confirmed."));
              const result = (await response.json()) as { firstName?: string };
              if (!active) return;
              setStatus("success");
              setMessage(result.firstName ? `You’re subscribed, ${result.firstName}.` : "Your website plan is active.");
            } catch (error) {
              if (!active) return;
              setStatus("error");
              setMessage(error instanceof Error ? error.message : "The subscription could not be confirmed.");
            }
          },
          onCancel: () => {
            if (!active) return;
            setStatus("ready");
            setMessage("Checkout canceled. No subscription was started.");
          },
          onError: () => {
            if (!active) return;
            setStatus("error");
            setMessage("PayPal could not complete checkout. Please try again.");
          },
        });

        await buttons.render(host);
        if (active) {
          setStatus("ready");
          setMessage("$17.95 billed monthly through PayPal. Cancel anytime in PayPal.");
        }
      } catch (error) {
        if (!active) return;
        setStatus("error");
        setMessage(error instanceof Error ? error.message : "PayPal checkout is unavailable.");
      }
    }

    void initialize();
    return () => {
      active = false;
      void buttons?.close().catch(() => undefined);
      host.replaceChildren();
    };
  }, []);

  if (status === "success") {
    return (
      <div className="checkout-success" role="status">
        <CheckCircle2 size={22} />
        <div>
          <strong>{message}</strong>
          <Link href="/login?next=/builder">Sign in and build your website →</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="paypal-checkout">
      <div className="paypal-button-host" ref={buttonHost} aria-label="Subscribe with PayPal" />
      <p className={`checkout-status ${status}`} role="status" aria-live="polite">
        {(status === "loading" || status === "processing") && <LoaderCircle className="spin" size={14} />}
        {message}
      </p>
      {status === "error" && <Link className="checkout-fallback" href="/start?service=website-plan">Request the website plan</Link>}
    </div>
  );
}
