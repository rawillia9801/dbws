import type { Metadata } from "next";
import { Check } from "lucide-react";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { InquiryForm } from "@/components/inquiry-form";

export const metadata: Metadata = {
  title: "Optional Website Services",
  description: "Request optional personalization, custom website work, or Business Voice for Dog Breeder Web.",
};

const optionalServices = {
  "website-personalization": "Done-for-you personalization",
  "custom-website": "Ground-up custom website",
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
            <p className="eyebrow">OPTIONAL WEBSITE SERVICES</p>
            <h1>{requestedService === "general" ? "Get extra launch help only if you want it." : `${requestedServiceLabel}—only if you want it.`}</h1>
            <p>The complete website service is $89 setup, $20 per month, and $39 per year for domain renewal. It already includes your available non-premium .com, BreederWeb Designer, managed Vercel hosting, SSL, updates, two domain-branded business email addresses, publishing, forms, embeds, mobile-ready pages, brand controls, and version history.</p>
            <div className="start-points">
              <div><Check size={19} />$89 setup includes one available, non-premium .com</div>
              <div><Check size={19} />$20/month operates the complete managed website service</div>
              <div><Check size={19} />$39/year domain renewal is billed separately before renewal</div>
              <div><Check size={19} />Personalization, custom design, and Business Voice are completely optional</div>
              <div><Check size={19} />No add-on is required to build, launch, host, or operate the website</div>
            </div>
          </section>
          <InquiryForm requestedService={requestedService} requestedServiceLabel={requestedServiceLabel} />
        </div>
      </main>
      <Footer />
    </>
  );
}
