import type { Metadata } from "next";
import { Check } from "lucide-react";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { InquiryForm } from "@/components/inquiry-form";

export const metadata: Metadata = {
  title: "Start Your Website",
  description: "Tell Dog Breeder Web about your breeding program and request a custom website plan.",
};

export default function StartPage() {
  return (
    <>
      <Header />
      <main className="start-main">
        <div className="shell start-grid">
          <section className="start-copy">
            <p className="eyebrow">START YOUR WEBSITE</p>
            <h1>Let’s build a website worthy of your program.</h1>
            <p>Share a few details about your dogs, your current online presence, and what you need. We will review everything before recommending a direction.</p>
            <div className="start-points">
              <div><Check size={19} />No generic one-size-fits-all design</div>
              <div><Check size={19} />Clear scope and pricing before work begins</div>
              <div><Check size={19} />Built for Vercel, Supabase, and your own domain</div>
            </div>
          </section>
          <InquiryForm />
        </div>
      </main>
      <Footer />
    </>
  );
}
