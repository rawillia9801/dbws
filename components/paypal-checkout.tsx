"use client";

import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import { CheckCircle2, Globe2, LoaderCircle, Search } from "lucide-react";
import { tryNormalizeComDomain } from "@/lib/domain";
import styles from "./paypal-checkout.module.css";

type PaymentStatus = "idle" | "searching" | "loading" | "ready" | "processing" | "success" | "error";

type PayPalButtons = {
  render: (target: HTMLElement) => Promise<void>;
  close: () => Promise<void>;
};

type PayPalWindow = Window & {
  paypal?: {
    Buttons: (options: {
      style: { color: "gold"; label: "subscribe"; layout: "vertical"; shape: "rect" };
      createSubscription: (_data: unknown, actions: { subscription: { create: (input: { plan_id: string; custom_id: string }) => Promise<string> } }) => Promise<string>;
      onApprove: (data: { subscriptionID?: string }) => Promise<void>;
      onCancel: () => void;
      onError: (error: unknown) => void;
    }) => PayPalButtons;
  };
};

type CheckoutConfig = {
  clientId: string;
  environment: "live" | "sandbox";
  planId: string;
  planStatus: string;
  setupFee: string;
  monthlyPrice: string;
  setupFeeFailureAction: string;
  annualDomainRenewal: string;
  annualDomainRenewalBilling: "separate";
};

type DomainAvailability = {
  domain: string;
  available: boolean;
  priceCents: number | null;
  itemId: string | null;
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

function isProductionHost() {
  return window.location.hostname === "dogbreederweb.site" || window.location.hostname === "www.dogbreederweb.site";
}

export function PayPalCheckout() {
  const buttonHost = useRef<HTMLDivElement>(null);
  const [domainInput, setDomainInput] = useState("");
  const [checkoutDomain, setCheckoutDomain] = useState<string | null>(null);
  const [status, setStatus] = useState<PaymentStatus>("idle");
  const [message, setMessage] = useState("Search for the .com you want before continuing to PayPal.");

  useEffect(() => {
    if (!checkoutDomain || !buttonHost.current) return;

    const selectedDomain = checkoutDomain;
    let active = true;
    let buttons: PayPalButtons | null = null;
    const host = buttonHost.current;
    host.replaceChildren();

    async function initialize() {
      try {
        setStatus("loading");
        setMessage("Preparing secure checkout for your available domain…");
        const configResponse = await fetch("/api/paypal/subscription", { cache: "no-store" });
        if (!configResponse.ok) throw new Error(await readError(configResponse, "PayPal checkout is being connected."));
        const config = (await configResponse.json()) as CheckoutConfig;

        if (isProductionHost() && config.environment !== "live") {
          throw new Error("Live PayPal checkout is not configured for the production website.");
        }
        if (
          config.planStatus.toUpperCase() !== "ACTIVE" ||
          config.setupFee !== "149.00" ||
          config.monthlyPrice !== "24.95" ||
          config.setupFeeFailureAction.toUpperCase() !== "CANCEL" ||
          config.annualDomainRenewal !== "24.99" ||
          config.annualDomainRenewalBilling !== "separate"
        ) {
          throw new Error("The PayPal website plan does not match the published pricing.");
        }

        await loadPayPalScript(config.clientId);
        const paypal = (window as PayPalWindow).paypal;
        if (!paypal) throw new Error("PayPal checkout is unavailable.");

        buttons = paypal.Buttons({
          style: { color: "gold", label: "subscribe", layout: "vertical", shape: "rect" },
          createSubscription: async (_data, actions) => {
            if (active) {
              setStatus("processing");
              setMessage(`Opening PayPal for ${selectedDomain}…`);
            }
            return actions.subscription.create({
              plan_id: config.planId,
              custom_id: selectedDomain,
            });
          },
          onApprove: async ({ subscriptionID }) => {
            try {
              if (!subscriptionID) throw new Error("PayPal did not return a subscription ID.");
              if (active) setMessage("Confirming payment and starting website setup…");
              const response = await fetch("/api/paypal/subscription", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ subscriptionId: subscriptionID, requestedDomain: selectedDomain }),
              });
              if (!response.ok) throw new Error(await readError(response, "The subscription could not be confirmed."));
              const result = (await response.json()) as { firstName?: string; requestedDomain: string; provisioningStatus?: string };
              if (!active) return;
              setStatus("success");
              setMessage(result.firstName ? `You’re subscribed, ${result.firstName}. Setup has started for ${result.requestedDomain}.` : `Your website service is approved and setup has started for ${result.requestedDomain}.`);
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
          setMessage(`$149 setup for ${selectedDomain}, then $24.95/month. You can cancel the website service at any time and your kennel keeps ownership of the domain.`);
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
  }, [checkoutDomain]);

  async function searchDomain(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = tryNormalizeComDomain(domainInput);
    const normalizedDomain = result.domain;
    if (normalizedDomain === null) {
      setStatus("error");
      setMessage(result.error ?? "Enter a valid .com domain.");
      return;
    }

    setDomainInput(normalizedDomain);
    setCheckoutDomain(null);
    setStatus("searching");
    setMessage(`Checking live availability for ${normalizedDomain}…`);
    try {
      const response = await fetch("/api/domains/availability", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ domain: normalizedDomain }),
      });
      if (!response.ok) throw new Error(await readError(response, "Domain search is temporarily unavailable."));
      const availability = await response.json() as DomainAvailability;
      if (!availability.available) {
        setStatus("error");
        setMessage(`${availability.domain} is already registered. Search for another .com.`);
        return;
      }
      setCheckoutDomain(availability.domain);
      setStatus("loading");
      setMessage(`${availability.domain} is available. Preparing checkout…`);
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Domain search is temporarily unavailable.");
    }
  }

  function changeDomain() {
    setCheckoutDomain(null);
    setStatus("idle");
    setMessage("Search for the .com you want before continuing to PayPal.");
  }

  if (status === "success" && checkoutDomain) {
    return (
      <div className="checkout-success" role="status">
        <CheckCircle2 size={22} />
        <div>
          <strong>{message}</strong>
          <span>Your selected domain is part of your setup. The kennel owns the domain, and the website subscription can be canceled at any time. Managed renewal is $24.99/year after the first year.</span>
          <Link href="/login?next=/builder">Continue to your breeder account →</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="paypal-checkout">
      {!checkoutDomain ? (
        <form className={styles.domainForm} onSubmit={searchDomain}>
          <label htmlFor="preferred-domain">Search for your included .com</label>
          <div className={styles.inputRow}>
            <span aria-hidden="true"><Globe2 size={17} /></span>
            <input
              id="preferred-domain"
              value={domainInput}
              onChange={(event) => setDomainInput(event.target.value)}
              placeholder="yourkennel.com"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              inputMode="url"
              required
            />
            <button type="submit" disabled={status === "searching"}>{status === "searching" ? <LoaderCircle className="spin" size={15} /> : <Search size={15} />} Search</button>
          </div>
          <small>We check current registrar availability before checkout. Your $149 setup includes the first-year registration of one available standard .com.</small>
        </form>
      ) : (
        <div className={styles.domainSummary}>
          <span><CheckCircle2 size={15} /> <strong>{checkoutDomain}</strong> is available</span>
          <button type="button" onClick={changeDomain} disabled={status === "processing"}>Search another domain</button>
        </div>
      )}
      <div className="paypal-button-host" ref={buttonHost} aria-label="Subscribe with PayPal" />
      <p className={`checkout-status ${status}`} role="status" aria-live="polite">
        {(status === "searching" || status === "loading" || status === "processing") && <LoaderCircle className="spin" size={14} />}
        {message}
      </p>
      {status === "error" && checkoutDomain && <button className={styles.retryButton} type="button" onClick={changeDomain}>Search another domain</button>}
    </div>
  );
}
