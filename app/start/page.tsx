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
            <p>Share a few details about your dogs, your current online presence, and any optional launch help you need. The website plan stays the same; this form is for human setup and add-on requests.</p>
            <div className="start-points">
              <div><Check size={19} />One $17.95/month website plan</div>
              <div><Check size={19} />Clear add-on scope before any extra work begins</div>
              <div><Check size={19} />Built on Vercel and the same Supabase breeder data</div>
            </div>
          </section>
          <InquiryForm />
        </div>
      </main>
      <Footer />
    </>
  );
}
