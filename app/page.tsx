import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Bot,
  Check,
  Code2,
  FileText,
  FormInput,
  Globe2,
  Mail,
  MonitorSmartphone,
  RefreshCw,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { BrowserPreview } from "@/components/browser-preview";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { PayPalCheckout } from "@/components/paypal-checkout";
import { formatPrice, websiteAddOns, websitePlan } from "@/lib/pricing";

export const dynamic = "force-dynamic";

const values = [
  [Bot, "BreederWeb Designer"],
  [Globe2, "Included .com"],
  [MonitorSmartphone, "Mobile Ready"],
  [Mail, "Two Branded Emails"],
  [ShieldCheck, "Managed Hosting"],
] as const;

const features = [
  {
    icon: Bot,
    title: "Build by conversation",
    text: "Tell BreederWeb Designer about your kennel, your voice, and the families you want to reach. Refine the site as you go while keeping every important field editable.",
  },
  {
    icon: RefreshCw,
    title: "Publish puppies and litters",
    text: "Keep available puppies and litter information current from the same breeder data instead of maintaining a second set of listings.",
  },
  {
    icon: FormInput,
    title: "Applications and contact forms",
    text: "Publish breeder-specific forms so inquiries and applications can flow into your breeder workflow for review.",
  },
  {
    icon: Code2,
    title: "Embeddable website sections",
    text: "Use ready-to-embed puppy, litter, application, and other public sections wherever you need them.",
  },
  {
    icon: Globe2,
    title: "Your included .com",
    text: "The required $89 setup includes registration of one available, non-premium .com so your website launches on your own address.",
  },
  {
    icon: Mail,
    title: "Hosting and branded email",
    text: "Managed Vercel hosting, SSL, updates, and two business email addresses branded to your connected domain are included in the monthly service.",
  },
] as const;

const designerChanges = [
  "Rewrote the hero around health-tested Goldens",
  "Added the fall litter announcement",
  "Changed the brand palette to evergreen and cream",
  "Made the application the primary call to action",
] as const;

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <section className="hero">
          <div className="shell hero-grid">
            <div className="hero-copy">
              <p className="eyebrow">THE WEBSITE BUILDER FOR DOG BREEDERS</p>
              <h1>Describe your program. BreederWeb Designer builds with you.</h1>
              <p className="hero-lead">A complete breeder website service with your own .com, managed hosting, branded email, puppy and litter publishing, applications, embeds, and an editable website builder.</p>
              <div className="button-row">
                <Link className="button button-primary" href="#pricing">Start Your Website <Sparkles size={17} /></Link>
                <Link className="button button-outline" href="/builder">Open BreederWeb Designer</Link>
              </div>
              <p className="hero-note"><span>$89 setup</span><span>$20/month</span><span>$39/year domain renewal</span></p>
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
              <p className="eyebrow">A COMPLETE BREEDER WEBSITE SERVICE</p>
              <h2>Everything required to build, launch, host, and operate the website.</h2>
              <p>Your standard service already includes the website builder, domain, hosting, SSL, updates, branded email, publishing tools, forms, embeds, mobile-ready pages, brand controls, and version history. Optional add-ons are never required.</p>
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

        <section className="section ai-builder-section" id="builder">
          <div className="shell ai-builder-grid">
            <div className="ai-builder-copy">
              <p className="eyebrow">BUILD BY CONVERSATION</p>
              <h2>Start with your kennel. Shape every detail as you go.</h2>
              <p>Work with BreederWeb Designer like a creative partner. Ask for a warmer voice, a stronger health-testing section, a litter announcement, a new color direction, or a full redesign. Every result remains structured, editable, previewable, and publishable.</p>
              <ul>
                <li><Check size={18} />Conversational design and copy changes</li>
                <li><Check size={18} />Manual controls for important fields</li>
                <li><Check size={18} />Desktop and mobile live preview</li>
                <li><Check size={18} />Drafts, publishing, and version history</li>
              </ul>
              <Link className="button button-primary" href="/builder">Open BreederWeb Designer <ArrowRight size={17} /></Link>
            </div>
            <div className="ai-builder-demo" aria-label="BreederWeb Designer website builder preview">
              <header><span><Bot size={18} />BreederWeb Designer</span><em>LIVE</em></header>
              <div className="ai-demo-body">
                <div className="ai-demo-chat">
                  <p className="ai-demo-user">Make this feel established and welcoming. Feature our fall litter and make health testing easier to find.</p>
                  <div className="ai-demo-reply">
                    <strong><Sparkles size={15} />Done. I updated four parts of the site.</strong>
                    <ul>{designerChanges.map((change) => <li key={change}><Check size={12} />{change}</li>)}</ul>
                  </div>
                  <span>Ask BreederWeb Designer to change anything… <ArrowRight size={14} /></span>
                </div>
                <div className="ai-demo-preview">
                  <div className="ai-demo-browser"><i /><i /><i /><small>cedarcreek.com</small></div>
                  <div className="ai-demo-site">
                    <nav><b>CEDAR &amp; CREEK</b><span>Our Dogs&nbsp;&nbsp; Litters&nbsp;&nbsp; Apply</span></nav>
                    <section><small>HEALTH-TESTED GOLDEN RETRIEVERS</small><h3>Raised with purpose.<br />Matched with care.</h3><p>Thoughtful Golden Retrievers raised in the heart of Virginia.</p><button>Meet our fall litter</button></section>
                    <footer><b>Fall litter now planned</b><span>Applications are open for prepared families.</span></footer>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section comparison" id="examples">
          <div className="shell comparison-grid">
            <div className="comparison-copy">
              <p className="eyebrow">ONE RECORD, TWO SURFACES</p>
              <h2>Update the breeder record. Publish the right parts.</h2>
              <p>Your private breeder data stays protected. The public website receives only the puppy, litter, application, and program information you choose to publish.</p>
              <ul>
                {[
                  "Available puppies can stay synchronized with breeder records",
                  "Applications arrive in the breeder workflow for review",
                  "Dogs, health testing, litters, and policies stay presentation-ready",
                  "Embeds can connect website sections to the same data",
                  "Every public page is built for phones and computers",
                ].map((item) => <li key={item}><Check size={18} />{item}</li>)}
              </ul>
              <Link className="text-link" href="/builder">Build the public experience <ArrowRight size={17} /></Link>
            </div>
            <div className="editorial-card">
              <Image src="https://images.unsplash.com/photo-1558788353-f76d92427f16?auto=format&fit=crop&w=1100&q=90" alt="Dog outdoors representing a professional breeder website" fill sizes="(max-width: 850px) 100vw, 46vw" />
              <div><span>YOUR PROGRAM</span><strong>One clear, connected home online.</strong></div>
            </div>
          </div>
        </section>

        <section className="section pricing-section" id="pricing">
          <div className="shell pricing-shell">
            <div className="section-heading centered light-heading">
              <p className="eyebrow">SIMPLE WEBSITE PRICING</p>
              <h2>Your website service is complete before add-ons.</h2>
              <p>The required setup and monthly service are enough to build, launch, host, and operate your website. The services below are optional extras only.</p>
            </div>
            <div className="single-plan-layout">
              <article className="pricing-card website-plan-card">
                <p className="pricing-eyebrow">{websitePlan.eyebrow}</p>
                <h3>{websitePlan.name}</h3>
                <div className="price"><strong>{formatPrice(websitePlan.setupFee)}</strong><span>one-time setup</span></div>
                <p className="pricing-description">Includes registration of one available, non-premium .com.</p>
                <div className="price"><strong>{formatPrice(websitePlan.monthlyPrice)}</strong><span>/ month</span></div>
                <p className="pricing-description">{websitePlan.description}</p>
                <div className="price"><strong>{formatPrice(websitePlan.domainRenewal)}</strong><span>/ year domain renewal</span></div>
                <p className="pricing-description">The annual domain renewal is billed separately each year before renewal. It is not a second billing cycle inside the monthly PayPal subscription.</p>
                <ul>
                  {websitePlan.features.map((feature) => <li key={feature}><Check size={17} />{feature}</li>)}
                </ul>
                <p className="pricing-description"><strong>Branded email requires your connected domain.</strong> Without a connected domain, kennel-branded email addresses cannot be created. The included .com setup provides that domain when it is available and non-premium.</p>
                <PayPalCheckout />
              </article>
              <aside className="plan-explainer">
                <span><FileText size={22} /></span>
                <div>
                  <p className="pricing-eyebrow">WHAT IS INCLUDED</p>
                  <h3>The operating website is the standard service.</h3>
                  <p>You do not need personalization, a ground-up custom build, or Business Voice to use BreederWeb Designer, publish the website, connect the included .com, host it on Vercel, use SSL, receive updates, publish puppies or litters, collect forms, use embeds, or manage the site on mobile and desktop.</p>
                  <dl>
                    <div><dt>Setup</dt><dd>$89 once, including one available non-premium .com</dd></div>
                    <div><dt>Monthly</dt><dd>$20 for the complete managed website service</dd></div>
                    <div><dt>Domain renewal</dt><dd>$39/year, billed separately before renewal</dd></div>
                    <div><dt>Business email</dt><dd>Two domain-branded addresses with the connected domain</dd></div>
                  </dl>
                </div>
              </aside>
            </div>

            <div className="addons-heading">
              <p className="eyebrow">COMPLETELY OPTIONAL ADD-ONS</p>
              <h3>Extra help is available when you want it—not because the website requires it.</h3>
              <p>None of these add-ons is required to build, launch, host, or operate your website.</p>
            </div>
            <div className="addons-grid">
              {websiteAddOns.map((addOn) => (
                <article className="addon-card" key={addOn.id}>
                  <h4>{addOn.name}</h4>
                  <strong>{addOn.price}</strong>
                  <small>{addOn.recurring}</small>
                  <p>{addOn.description}</p>
                  <Link href={`/start?service=${addOn.id}`}>Request optional add-on <ArrowRight size={15} /></Link>
                </article>
              ))}
            </div>
            <p className="pricing-fineprint">Optional means optional: these services are not prerequisites for your website. Business Voice usage is metered separately. Premium domains are outside the included .com registration and require separate approval and pricing.</p>
          </div>
        </section>

        <section className="section final-cta">
          <div className="shell final-cta-inner">
            <div><p className="eyebrow">READY WHEN YOU ARE</p><h2>Start with your own .com and build the website with BreederWeb Designer.</h2></div>
            <Link className="button button-primary" href="#pricing">Start Your Website <ArrowRight size={18} /></Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
