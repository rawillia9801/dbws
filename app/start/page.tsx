import type { Metadata } from "next";
import { Check } from "lucide-react";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { InquiryForm } from "@/components/inquiry-form";

export const metadata: Metadata = {
  title: "Dog Breeder Web Requests",
  description: "Ask a website question or request optional Business Voice for Dog Breeder Web.",
};

const optionalServices = {
  "business-voice": "Business Voice",
} as const;

type OptionalServiceId = keyof typeof optionalServices;
type RequestedService = "general" | OptionalServiceId;

function normalizeRequestedService(value: string | string[] | undefined): RequestedService {
  const candidate = Array.isArray(value) ? value[0] : value;
  if (candidate && candidate in optionalServices) return candidate as OptionalServiceId;
  return "general";
}

export default async function StartPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string | string[] }>;
}) {
  const params = await searchParams;
  const requestedService = normalizeRequestedService(params.service);
  const requestedServiceLabel = requestedService === "general"
    ? "General website request"
    : optionalServices[requestedService];

  return (
    <>
      <Header />
      <main className="start-main">
        <div className="shell start-grid">
          <section className="start-copy">
            <p className="eyebrow">DOG BREEDER WEB</p>
            <h1>{requestedService === "general" ? "Tell us what you need from your breeder website." : "Add Business Voice when it fits your program."}</h1>
            <p>The complete website service is $149 setup, $24.95 per month, and $39 per year for domain renewal after the included first year. BreederWeb Designer is included to build and refine the website, and the subscription includes a connected MyDogPortal companion workspace for the breeder records that power the site.</p>
            <div className="start-points">
              <div><Check size={19} />$149 setup includes first-year registration of one available, non-premium .com</div>
              <div><Check size={19} />$24.95/month operates the managed website service and included breeder workspace</div>
              <div><Check size={19} />BreederWeb Designer is included for website design, copy, and revisions</div>
              <div><Check size={19} />MyDogPortal companion access includes applications, buyers, waitlist, breeding dogs, litters, and puppies</div>
              <div><Check size={19} />$39/year domain renewal is billed separately before renewal after year one</div>
              <div><Check size={19} />Business Voice is optional; no design-service add-on is required</div>
            </div>
          </section>
          <InquiryForm requestedService={requestedService} requestedServiceLabel={requestedServiceLabel} />
        </div>
      </main>
      <Footer />
    </>
  );
}
