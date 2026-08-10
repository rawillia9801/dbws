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
  [Bot, "BreederWeb Designer AI Builder"],
  [MonitorSmartphone, "Mobile Ready"],
  [RefreshCw, "Live Puppy Updates"],
  [Mail, "Two Business Emails"],
  [ShieldCheck, "Managed Hosting"],
] as const;

const features = [
  {
    icon: Bot,
    title: "Build by conversation",
    text: "Tell BreederWeb Designer about your program, your voice, and the families you want to reach. It builds and revises the editable site in a live preview.",
  },
  {
    icon: RefreshCw,
    title: "Publish puppies and litters",
    text: "Connected WhiteLabel data keeps available puppies and litter information current without maintaining a second set of listings.",
  },
  {
    icon: FormInput,
    title: "Applications that flow inward",
    text: "Create a breeder-specific application, publish it on the site, and bring each submission into the breeder workflow for review.",
  },
  {
    icon: Code2,
    title: "Embeds and public feeds",
    text: "Use ready-to-paste puppy and application sections—or a structured public feed—when part of the website needs to live elsewhere.",
  },
  {
    icon: Globe2,
    title: "Your address and brand",
    text: "Launch on an included breeder subdomain, connect a domain you already own, and control colors, photography, content, and contact details.",
  },
  {
    icon: Mail,
    title: "Hosting and business email",
    text: "Managed Vercel hosting, SSL, updates, and two branded business email addresses are part of the plan—not a surprise after launch.",
  },
] as const;

const aiChanges = [
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
              <p className="eyebrow">THE AI WEBSITE BUILDER FOR DOG BREEDERS</p>
              <h1>Describe your program. BreederWeb Designer builds the website.</h1>
              <p className="hero-lead">One editable website system for your kennel—connected puppies, litters, applications, hosting, SSL, and business email included.</p>
              <div className="button-row">
                <Link className="button button-primary" href="/builder">Build With BreederWeb Designer <Sparkles size={17} /></Link>
                <Link className="button button-outline" href="#pricing">See the One Plan</Link>
              </div>
              <p className="hero-note"><span>$17.95/month</span><span>No template package to buy</span><span>Optional add-ons only when needed</span></p>
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
              <p className="eyebrow">THE WHITELABEL WEB MODULE, IN ONE PRODUCT</p>
              <h2>Your public website and breeder workflow stay connected</h2>
              <p>The site is not a decorative template purchase. It is the public-facing part of your breeder system, with the information families need and the tools you need to keep it current.</p>
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
              <p className="eyebrow">NO TEMPLATE PICKER</p>
              <h2>Build the site you describe—not one of three packages.</h2>
              <p>Start with your kennel details, then work with BreederWeb Designer like a creative partner. Ask for a warmer voice, a stronger health-testing section, a litter announcement, a new color direction, or a full redesign. Every result stays structured, editable, previewable, and publishable.</p>
              <ul>
                <li><Check size={18} />Conversational design and copy changes</li>
                <li><Check size={18} />Manual controls for every important field</li>
                <li><Check size={18} />Desktop and mobile live preview</li>
                <li><Check size={18} />Drafts, publishing, and version history in Supabase</li>
              </ul>
              <Link className="button button-primary" href="/builder">Open the AI Website Builder <ArrowRight size={17} /></Link>
            </div>
            <div className="ai-builder-demo" aria-label="BreederWeb Designer website builder preview">
              <header><span><Bot size={18} />BreederWeb Designer website copilot</span><em>LIVE</em></header>
              <div className="ai-demo-body">
                <div className="ai-demo-chat">
                  <p className="ai-demo-user">Make this feel established and welcoming. Feature our fall litter and make health testing easier to find.</p>
                  <div className="ai-demo-reply">
                    <strong><Sparkles size={15} />Done. I updated four parts of the site.</strong>
                    <ul>{aiChanges.map((change) => <li key={change}><Check size={12} />{change}</li>)}</ul>
                  </div>
                  <span>Ask BreederWeb Designer to change anything… <ArrowRight size={14} /></span>
                </div>
                <div className="ai-demo-preview">
                  <div className="ai-demo-browser"><i /><i /><i /><small>cedarcreek.dogbreederweb.site</small></div>
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
                  "Available puppies automatically leave the public feed when assigned",
                  "Applications arrive in the breeder workflow for review",
                  "Dogs, health testing, litters, and policies stay presentation-ready",
                  "Embeds can connect an existing website to the same data",
                  "Every public page remains polished on phones and computers",
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
              <p className="eyebrow">ONE PLAN. OPTIONAL ADD-ONS.</p>
              <h2>The whole breeder website system is the plan.</h2>
              <p>No paid template levels. Subscribe for the AI builder and the complete hosted web layer, then add only the launch or communication services your kennel actually needs.</p>
            </div>
            <div className="single-plan-layout">
              <article className="pricing-card website-plan-card">
                <p className="pricing-eyebrow">{websitePlan.eyebrow}</p>
                <h3>{websitePlan.name}</h3>
                <div className="price"><strong>{formatPrice(websitePlan.price)}</strong><span>/ month</span></div>
                <p className="pricing-description">{websitePlan.description}</p>
                <ul>
                  {websitePlan.features.map((feature) => <li key={feature}><Check size={17} />{feature}</li>)}
                </ul>
                <PayPalCheckout />
              </article>
              <aside className="plan-explainer">
                <span><FileText size={22} /></span>
                <div>
                  <p className="pricing-eyebrow">WHAT “CONNECTED” MEANS</p>
                  <h3>Made for the WhiteLabel breeder workflow</h3>
                  <p>Dog Breeder Web is the focused website segment: public pages, puppy and litter publishing, applications, embeds, domains, hosting, and email. The private operational records remain in the same Supabase-backed breeder system.</p>
                  <dl>
                    <div><dt>Included address</dt><dd>yourkennel.dogbreederweb.site</dd></div>
                    <div><dt>Hosting stack</dt><dd>Vercel + SSL + managed updates</dd></div>
                    <div><dt>Business email</dt><dd>Two branded addresses</dd></div>
                    <div><dt>Data connection</dt><dd>Puppies, litters, applications, and embeds</dd></div>
                  </dl>
                </div>
              </aside>
            </div>

            <div className="addons-heading">
              <p className="eyebrow">OPTIONAL ADD-ONS</p>
              <h3>Add human setup, a new domain, custom work, or Business Voice only when you want it.</h3>
            </div>
            <div className="addons-grid">
              {websiteAddOns.map((addOn) => (
                <article className="addon-card" key={addOn.id}>
                  <h4>{addOn.name}</h4>
                  <strong>{addOn.price}</strong>
                  <small>{addOn.recurring}</small>
                  <p>{addOn.description}</p>
                  <Link href={`/start?service=${addOn.id}`}>Request add-on <ArrowRight size={15} /></Link>
                </article>
              ))}
            </div>
            <p className="pricing-fineprint">Already own a domain? Connecting it is supported. Premium domain purchases and metered voice usage are priced separately.</p>
          </div>
        </section>

        <section className="section final-cta">
          <div className="shell final-cta-inner">
            <div><p className="eyebrow">READY WHEN YOU ARE</p><h2>Build the website with BreederWeb Designer, then make every detail yours.</h2></div>
            <Link className="button button-primary" href="/builder">Open the AI Website Builder <ArrowRight size={18} /></Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
