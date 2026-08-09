import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  Check,
  FileText,
  Globe2,
  HeartHandshake,
  ImageIcon,
  Mail,
  MonitorSmartphone,
  PencilLine,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { BrowserPreview } from "@/components/browser-preview";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { PayPalCheckout } from "@/components/paypal-checkout";
import { formatPackagePrice, templatePackages } from "@/lib/pricing";

export const dynamic = "force-dynamic";

const values = [
  [Globe2, "Custom Domain"],
  [MonitorSmartphone, "Mobile Ready"],
  [PencilLine, "Easy Puppy Updates"],
  [Mail, "Professional Email"],
  [ShieldCheck, "Secure Hosting"],
] as const;

const features = [
  {
    icon: HeartHandshake,
    title: "Showcase Your Program",
    text: "Tell your story, introduce your dogs, and explain the care and purpose behind your breeding program.",
  },
  {
    icon: ImageIcon,
    title: "Present Puppies Beautifully",
    text: "Give every available puppy and upcoming litter an organized, photo-first presentation families can trust.",
  },
  {
    icon: BadgeCheck,
    title: "Build Buyer Confidence",
    text: "Answer important questions, share health information, and guide serious families toward the right next step.",
  },
  {
    icon: FileText,
    title: "Applications That Fit",
    text: "Collect structured buyer inquiries through a polished application that feels like part of your website.",
  },
  {
    icon: CalendarDays,
    title: "Litter Announcements",
    text: "Keep visitors informed about planned pairings, expected litters, and availability without a cluttered page.",
  },
  {
    icon: Sparkles,
    title: "A Brand That Feels Like You",
    text: "Colors, typography, photography, and language are shaped around your kennel—not forced into a generic template.",
  },
] as const;

const styles = [
  {
    name: "Heritage",
    type: "Warm, established, editorial",
    image: "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=900&q=88",
    className: "style-heritage",
    packageId: "heritage",
  },
  {
    name: "Modern Meadow",
    type: "Clean, organic, welcoming",
    image: "https://images.unsplash.com/photo-1507146426996-ef05306b995a?auto=format&fit=crop&w=900&q=88",
    className: "style-meadow",
    packageId: "modern-meadow",
  },
  {
    name: "Signature",
    type: "Polished, refined, distinctive",
    image: "https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?auto=format&fit=crop&w=900&q=88",
    className: "style-signature",
    packageId: "signature",
  },
] as const;

export default function Home() {
  const paypalClientId = process.env.PAYPAL_CLIENT_ID ?? "";
  const paypalEnvironment = process.env.PAYPAL_ENVIRONMENT === "sandbox" ? "sandbox" : "live";

  return (
    <>
      <Header />
      <main>
        <section className="hero">
          <div className="shell hero-grid">
            <div className="hero-copy">
              <p className="eyebrow">WEBSITES MADE FOR DOG BREEDERS</p>
              <h1>Your breeding program deserves a website this beautiful.</h1>
              <p className="hero-lead">Custom, mobile-ready websites that showcase your dogs, upcoming litters, available puppies, and the care behind your program.</p>
              <div className="button-row">
                <Link className="button button-primary" href="#styles">Explore Website Styles</Link>
                <Link className="button button-outline" href="#examples">See Live Examples</Link>
              </div>
              <p className="hero-note"><span>Custom .com available</span><span>Managed hosting</span><span>Two professional email addresses</span></p>
            </div>
            <BrowserPreview />
          </div>
        </section>

        <section className="value-strip" aria-label="Included website features">
          <div className="shell value-grid">
            {values.map(([Icon, label]) => <div key={label}><Icon /><span>{label}</span></div>)}
          </div>
        </section>

        <section className="section" id="features">
          <div className="shell">
            <div className="section-heading centered">
              <p className="eyebrow">EVERYTHING YOUR WEBSITE NEEDS</p>
              <h2>Built around the way breeders actually work</h2>
              <p>Your website should do more than look pretty. It should make your program easier to understand and easier to trust.</p>
            </div>
            <div className="feature-grid">
              {features.map(({ icon: Icon, title, text }) => (
                <article className="feature-card" key={title}>
                  <span className="icon-circle"><Icon /></span>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section section-tinted" id="styles">
          <div className="shell">
            <div className="section-heading split-heading">
              <div><p className="eyebrow">CHOOSE YOUR DIRECTION</p><h2>A website style that fits your program</h2></div>
              <p>Start with a carefully designed visual direction, then make it yours with your photos, dogs, colors, and story.</p>
            </div>
            <div className="styles-grid">
              {styles.map((style) => (
                <article className={`style-card ${style.className}`} key={style.name}>
                  <div className="style-image"><Image src={style.image} alt={`${style.name} dog breeder website style`} fill sizes="(max-width: 760px) 100vw, 33vw" /></div>
                  <div className="style-browser">
                    <small>KENNEL NAME</small>
                    <h3>{style.name}</h3>
                    <p>{style.type}</p>
                    <span>From {formatPackagePrice(templatePackages.find((item) => item.id === style.packageId)?.price ?? "0")} <ArrowRight size={15} /></span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section comparison" id="examples">
          <div className="shell comparison-grid">
            <div className="comparison-copy">
              <p className="eyebrow">DESIGNED FOR THE FULL STORY</p>
              <h2>Not another one-page puppy listing</h2>
              <p>Families want to understand who you are before they ask about a puppy. We create a complete home for your program.</p>
              <ul>
                {[
                  "Your dogs, pedigrees, and health testing",
                  "Available puppies and planned litters",
                  "Your application and placement process",
                  "Policies, FAQs, testimonials, and contact details",
                  "A polished experience on phones, tablets, and computers",
                ].map((item) => <li key={item}><Check size={18} />{item}</li>)}
              </ul>
              <Link className="text-link" href="/start">Tell us about your program <ArrowRight size={17} /></Link>
            </div>
            <div className="editorial-card">
              <Image src="https://images.unsplash.com/photo-1558788353-f76d92427f16?auto=format&fit=crop&w=1100&q=90" alt="Dog outdoors representing a professional breeder website" fill sizes="(max-width: 850px) 100vw, 46vw" />
              <div><span>YOUR PROGRAM</span><strong>Presented with the care it deserves.</strong></div>
            </div>
          </div>
        </section>

        <section className="section pricing-section" id="pricing">
          <div className="shell pricing-shell">
            <div className="section-heading centered light-heading">
              <p className="eyebrow">CLEAR TEMPLATE PRICING</p>
              <h2>Choose your website foundation</h2>
              <p>Purchase your template securely with PayPal. Each listed price is a one-time charge, with no automatic subscription added at checkout.</p>
            </div>
            <div className="pricing-grid">
              {templatePackages.map((templatePackage) => (
                <article className={`pricing-card${templatePackage.featured ? " featured" : ""}`} key={templatePackage.id}>
                  {templatePackage.featured && <span className="popular-badge">MOST POPULAR</span>}
                  <p className="pricing-eyebrow">{templatePackage.eyebrow}</p>
                  <h3>{templatePackage.name}</h3>
                  <div className="price"><strong>{formatPackagePrice(templatePackage.price)}</strong><span>one time</span></div>
                  <p className="pricing-description">{templatePackage.description}</p>
                  <ul>
                    {templatePackage.features.map((feature) => <li key={feature}><Check size={17} />{feature}</li>)}
                  </ul>
                  <PayPalCheckout packageId={templatePackage.id} clientId={paypalClientId} environment={paypalEnvironment} />
                </article>
              ))}
            </div>
            <div className="care-plan">
              <div><strong>Website care after launch</strong><span>Secure managed hosting, custom .com domain, SSL, and two professional email addresses.</span></div>
              <p><strong>$17.95</strong><span>/ month, billed separately</span></p>
            </div>
            <p className="pricing-fineprint">Need a different scope? <Link href="/start">Request a custom website plan.</Link></p>
          </div>
        </section>

        <section className="section final-cta">
          <div className="shell final-cta-inner">
            <div><p className="eyebrow">READY WHEN YOU ARE</p><h2>Give your breeding program a home online.</h2></div>
            <Link className="button button-primary" href="/start">Start Your Website <ArrowRight size={18} /></Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
