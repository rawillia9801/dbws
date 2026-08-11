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
  [MonitorSmartphone, "MyDogPortal Companion Included"],
  [FileText, "DogBreederDocs Ready"],
  [Mail, "Two Branded Emails"],
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
    text: "Keep available puppies and litter information current from the same breeder records instead of maintaining a second set of listings.",
  },
  {
    icon: FormInput,
    title: "Applications and contact forms",
    text: "Publish breeder-specific forms so inquiries and applications flow into the included breeder workspace for review.",
  },
  {
    icon: MonitorSmartphone,
    title: "Included breeder workspace",
    text: "Use the included MyDogPortal companion workspace to manage applications, buyers, waitlist records, breeding dogs, litters, and puppies that connect to the website.",
  },
  {
    icon: Globe2,
    title: "Your included .com",
    text: "The $149 setup includes first-year registration of one available, non-premium .com so your website launches on your own address.",
  },
  {
    icon: Mail,
    title: "Hosting and branded email",
    text: "Managed Vercel hosting, SSL, updates, and two business email addresses branded to your connected domain are included in the monthly service.",
  },
  {
    icon: Code2,
    title: "Embeddable website sections",
    text: "Use ready-to-embed puppy, litter, application, and other public sections wherever you need them.",
  },
] as const;

const connectedProducts = [
  {
    icon: Globe2,
    name: "DogBreederWeb.Site",
    label: "WEBSITE + BRAND",
    href: "https://dogbreederweb.site",
    text: "Build and manage the public kennel website with BreederWeb Designer, your included .com, branded email, puppy and litter publishing, applications, embeds, and version history.",
  },
  {
    icon: MonitorSmartphone,
    name: "MyDogPortal.Site",
    label: "INCLUDED BREEDER WORKSPACE",
    href: "https://mydogportal.site",
    text: "Every active Dog Breeder Web subscription includes a connected MyDogPortal companion workspace for applications, buyers and families, waitlist records, breeding dogs, litters, and puppies. Upgrade MyDogPortal when you want the advanced breeding, document, automation, payment, e-signature, and private Puppy Portal workflows.",
  },
  {
    icon: FileText,
    name: "DogBreederDocs.Online",
    label: "DOCUMENT WORKSPACE",
    href: "https://dogbreederdocs.online",
    text: "Create reusable state-aware breeder documents with editable clauses and branding. Standalone document purchases remain available, while MyDogPortal Professional and Studio include the complete editable packet.",
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
              <p className="hero-lead">A complete breeder website service—your own .com, managed hosting, branded email, AI-assisted website building, and an included MyDogPortal companion workspace to manage the breeder records that keep the website current.</p>
              <div className="button-row">
                <Link className="button button-primary" href="#pricing">Start Your Website <Sparkles size={17} /></Link>
                <Link className="button button-outline" href="/builder">Open BreederWeb Designer</Link>
              </div>
              <p className="hero-note"><span>$149 setup</span><span>$24.95/month</span><span>$24.99/year managed domain renewal</span></p>
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
              <p>Your standard service includes the website builder, first-year standard .com registration, hosting, SSL, updates, branded email, publishing tools, forms, embeds, mobile-ready pages, brand controls, version history, and the connected breeder workspace used to maintain website data.</p>
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

        <section className="section" id="connected">
          <div className="shell">
            <div className="section-heading centered">
              <p className="eyebrow">WEBSITE + BREEDER WORKSPACE · ONE CONNECTED FLOW</p>
              <h2>Your website comes with the breeder workspace that keeps it current.</h2>
              <p>Every active Dog Breeder Web subscription includes MyDogPortal companion access at no additional charge. Review applications, manage buyers and your waitlist, maintain your breeding program, update litters and puppies, and use those records to keep the public website current from one connected breeder account.</p>
            </div>
            <div className="feature-grid">
              {connectedProducts.map(({ icon: Icon, name, label, href, text }) => (
                <article className="feature-card" key={name}>
                  <span className="icon-circle"><Icon /></span>
                  <p className="pricing-eyebrow">{label}</p>
                  <h3>{name}</h3>
                  <p>{text}</p>
                  <a className="text-link" href={href} target="_blank" rel="noreferrer">Visit {name} <ArrowRight size={15} /></a>
                </article>
              ))}
            </div>
            <div className="section-heading centered">
              <h2>Update the breeder record once. Use it everywhere it belongs.</h2>
              <p>Your website and companion workspace are designed to share the same breeder identity and kennel data. Upgrade to MyDogPortal Professional or Studio whenever you want deeper breeding intelligence, document generation and e-signatures, automation, payment workflows, private Puppy Portals, or the complete business operating system.</p>
            </div>
          </div>
        </section>

        <section className="section comparison" id="examples">
          <div className="shell comparison-grid">
            <div className="comparison-copy">
              <p className="eyebrow">ONE RECORD, THE RIGHT SURFACE</p>
              <h2>Update the breeder record. Publish what belongs on the website.</h2>
              <p>Your private breeder data stays protected. Public pages receive only the information you choose to publish, while the included companion workspace keeps applications, families, breeding dogs, litters, puppies, and waitlist information organized behind the scenes.</p>
              <ul>
                {[
                  "Available puppies can stay synchronized with breeder records",
                  "Applications flow into the breeder workspace for review",
                  "Buyers, families, and waitlist records stay organized",
                  "Breeding dogs, litters, and puppies can drive website content",
                  "Paid MyDogPortal upgrades add advanced automation, documents, portals, and business workflows",
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
              <h2>Your website includes a connected breeder workspace.</h2>
              <p>The $24.95 monthly service includes Dog Breeder Web plus MyDogPortal companion access for applications, buyers, waitlist management, breeding dogs, litters, and puppies. Upgrade MyDogPortal only when you want its advanced operational features.</p>
            </div>
            <div className="single-plan-layout">
              <article className="pricing-card website-plan-card">
                <p className="pricing-eyebrow">{websitePlan.eyebrow}</p>
                <h3>{websitePlan.name}</h3>
                <div className="price"><strong>{formatPrice(websitePlan.setupFee)}</strong><span>one-time setup</span></div>
                <p className="pricing-description">Includes first-year registration of one available, non-premium .com.</p>
                <div className="price"><strong>{formatPrice(websitePlan.monthlyPrice)}</strong><span>/ month</span></div>
                <p className="pricing-description">{websitePlan.description}</p>
                <div className="price"><strong>{formatPrice(websitePlan.domainRenewal)}</strong><span>/ year managed domain renewal</span></div>
                <p className="pricing-description">The annual managed domain renewal is billed separately each year before renewal. It is not a second billing cycle inside the monthly PayPal subscription.</p>
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
                  <h3>Website service + the breeder workspace needed to run it.</h3>
                  <p>Dog Breeder Web includes the public website and a connected MyDogPortal companion workspace so the breeder can manage the records that feed the site without paying for a second basic system.</p>
                  <dl>
                    <div><dt>Setup</dt><dd>$149 once, including first-year registration of one available non-premium .com</dd></div>
                    <div><dt>Monthly</dt><dd>$24.95 for the complete managed breeder website service</dd></div>
                    <div><dt>Included workspace</dt><dd>MyDogPortal companion access for applications, buyers, waitlist, breeding dogs, litters, and puppies</dd></div>
                    <div><dt>Upgrades</dt><dd>Professional and Studio remain available for advanced MyDogPortal workflows</dd></div>
                    <div><dt>Managed domain renewal</dt><dd>$24.99/year, billed separately before renewal</dd></div>
                    <div><dt>Business email</dt><dd>Two domain-branded addresses with the connected domain</dd></div>
                  </dl>
                </div>
              </aside>
            </div>

            <div className="addons-heading">
              <p className="eyebrow">OPTIONAL BUSINESS VOICE</p>
              <h3>Add a professional local business phone system if you want one.</h3>
              <p>The AI website builder is included and is intended to handle the website design and content workflow without requiring a separate design service.</p>
            </div>
            <div className="addons-grid">
              {websiteAddOns.map((addOn) => (
                <article className="addon-card" key={addOn.id}>
                  <h4>{addOn.name}</h4>
                  <strong>{addOn.price}</strong>
                  <small>{addOn.recurring}</small>
                  <p>{addOn.description}</p>
                  <Link href={`/start?service=${addOn.id}`}>Request service <ArrowRight size={15} /></Link>
                </article>
              ))}
            </div>
            <p className="pricing-fineprint">Business Voice usage is metered separately. Premium domains are outside the included standard .com registration and require separate approval and pricing.</p>
          </div>
        </section>

        <section className="section final-cta">
          <div className="shell final-cta-inner">
            <div><p className="eyebrow">READY WHEN YOU ARE</p><h2>Start with your own .com and one connected breeder workspace.</h2></div>
            <Link className="button button-primary" href="#pricing">Start Your Website <ArrowRight size={18} /></Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
