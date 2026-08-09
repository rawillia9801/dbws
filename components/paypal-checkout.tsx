"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { CheckCircle2, LoaderCircle } from "lucide-react";
import type { TemplatePackageId } from "@/lib/pricing";

type PaymentStatus = "loading" | "ready" | "processing" | "success" | "error";

type PayPalPaymentSession = {
  start: (
    options: { presentationMode: "auto" },
    order: Promise<{ orderId: string }>,
  ) => Promise<void>;
};

type PayPalInstance = {
  findEligibleMethods: (options: { currencyCode: string }) => Promise<{
    isEligible: (method: string) => boolean;
  }>;
  createPayPalOneTimePaymentSession: (options: {
    onApprove: (data: { orderId: string }) => Promise<void>;
    onCancel: () => void;
    onError: () => void;
  }) => PayPalPaymentSession;
};

type PayPalWindow = Window & {
  paypal?: {
    createInstance: (options: {
      clientId: string;
      components: string[];
      pageType: "home";
    }) => Promise<PayPalInstance>;
  };
};

let paypalScriptPromise: Promise<void> | null = null;

function loadPayPalScript(environment: "live" | "sandbox") {
  if ((window as PayPalWindow).paypal) return Promise.resolve();
  if (paypalScriptPromise) return paypalScriptPromise;

  paypalScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = environment === "sandbox"
      ? "https://www.sandbox.paypal.com/web-sdk/v6/core"
      : "https://www.paypal.com/web-sdk/v6/core";
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

export function PayPalCheckout({
  packageId,
  clientId,
  environment,
}: {
  packageId: TemplatePackageId;
  clientId: string;
  environment: "live" | "sandbox";
}) {
  const buttonHost = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<PaymentStatus>(clientId ? "loading" : "error");
  const [message, setMessage] = useState(clientId ? "Loading secure checkout…" : "Checkout is being connected.");

  useEffect(() => {
    if (!clientId || !buttonHost.current) return;

    let active = true;
    const host = buttonHost.current;

    async function createOrder() {
      setStatus("processing");
      setMessage("Opening PayPal…");
      const response = await fetch("/api/paypal/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId }),
      });

      if (!response.ok) throw new Error(await readError(response, "Checkout could not be started."));
      const order = (await response.json()) as { id: string };
      return { orderId: order.id };
    }

    async function captureOrder(orderId: string) {
      setMessage("Completing your purchase…");
      const response = await fetch(`/api/paypal/orders/${encodeURIComponent(orderId)}/capture`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId }),
      });

      if (!response.ok) throw new Error(await readError(response, "Payment could not be completed."));
      const result = (await response.json()) as { firstName?: string };
      if (!active) return;
      setStatus("success");
      setMessage(result.firstName ? `Thank you, ${result.firstName}. Your template is reserved.` : "Payment complete. Your template is reserved.");
    }

    async function initialize() {
      try {
        await loadPayPalScript(environment);
        const paypal = (window as PayPalWindow).paypal;
        if (!paypal) throw new Error("PayPal checkout is unavailable.");

        const instance = await paypal.createInstance({
          clientId,
          components: ["paypal-payments"],
          pageType: "home",
        });
        const methods = await instance.findEligibleMethods({ currencyCode: "USD" });
        if (!methods.isEligible("paypal")) throw new Error("PayPal is not available for this browser.");

        const paymentSession = instance.createPayPalOneTimePaymentSession({
          onApprove: async ({ orderId }) => {
            try {
              await captureOrder(orderId);
            } catch (error) {
              if (!active) return;
              setStatus("error");
              setMessage(error instanceof Error ? error.message : "Payment could not be completed.");
            }
          },
          onCancel: () => {
            if (!active) return;
            setStatus("ready");
            setMessage("Checkout canceled. You have not been charged.");
          },
          onError: () => {
            if (!active) return;
            setStatus("error");
            setMessage("PayPal could not complete checkout. Please try again.");
          },
        });

        const paypalButton = document.createElement("paypal-button");
        paypalButton.setAttribute("type", "pay");
        paypalButton.setAttribute("color", "gold");
        paypalButton.setAttribute("aria-label", "Pay with PayPal");
        paypalButton.addEventListener("click", async () => {
          try {
            await paymentSession.start({ presentationMode: "auto" }, createOrder());
          } catch (error) {
            if (!active) return;
            setStatus("error");
            setMessage(error instanceof Error ? error.message : "PayPal could not be opened.");
          }
        });

        host.replaceChildren(paypalButton);
        if (active) {
          setStatus("ready");
          setMessage("Secure one-time checkout powered by PayPal.");
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
      host.replaceChildren();
    };
  }, [clientId, environment, packageId]);

  if (status === "success") {
    return (
      <div className="checkout-success" role="status">
        <CheckCircle2 size={22} />
        <div>
          <strong>{message}</strong>
          <Link href="/start">Send your website details →</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="paypal-checkout">
      <div className="paypal-button-host" ref={buttonHost} aria-label="Pay with PayPal" />
      <p className={`checkout-status ${status}`} role="status" aria-live="polite">
        {(status === "loading" || status === "processing") && <LoaderCircle className="spin" size={14} />}
        {message}
      </p>
      {status === "error" && <Link className="checkout-fallback" href="/start">Request this template instead</Link>}
    </div>
  );
}
