"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Bot,
  Check,
  ChevronDown,
  ExternalLink,
  Laptop,
  LoaderCircle,
  Palette,
  Plus,
  Save,
  Send,
  Smartphone,
  Sparkles,
  Trash2,
} from "lucide-react";
import type { BuilderResponse, SiteConfig } from "@/lib/site-builder/schema";
import { cloneConfig } from "@/lib/site-builder/templates";
import { SiteRenderer } from "./site-renderer";
import styles from "./builder.module.css";

type Message = { role: "assistant" | "user"; text: string; changes?: string[] };

type BuilderProps = {
  initialConfig: SiteConfig;
  initialSiteId: string | null;
  initialSlug: string;
  initialPublished: boolean;
  userEmail: string;
};

const starterPrompts = [
  "Redesign the whole site to feel warm, established, and family-focused.",
  "Build a confident preservation-breeder story around health and purpose.",
  "Feature our next litter and make the application the primary action.",
];

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 64);
}

export function Builder({ initialConfig, initialSiteId, initialSlug, initialPublished, userEmail }: BuilderProps) {
  const [config, setConfig] = useState<SiteConfig>(() => cloneConfig(initialConfig));
  const [siteId, setSiteId] = useState<string | null>(initialSiteId);
  const [slug, setSlug] = useState(initialSlug);
  const [published, setPublished] = useState(initialPublished);
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [panel, setPanel] = useState<"content" | "style">("content");
  const [prompt, setPrompt] = useState("");
  const [generationId, setGenerationId] = useState<string | null>(null);
  const [source, setSource] = useState<"manual" | "ai">("manual");
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", text: "Tell me what you want to change. I can rewrite the story, shape a litter announcement, adjust the style, or rebuild the whole site around your program." },
  ]);
  const [aiBusy, setAiBusy] = useState(false);
  const [saveBusy, setSaveBusy] = useState(false);
  const [notice, setNotice] = useState("");

  const publicUrl = useMemo(() => `/sites/${slug}`, [slug]);

  function updateBrand<K extends keyof SiteConfig["brand"]>(key: K, value: SiteConfig["brand"][K]) {
    setConfig((current) => ({ ...current, brand: { ...current.brand, [key]: value } }));
    setSource("manual");
  }

  function updateHero<K extends keyof SiteConfig["hero"]>(key: K, value: SiteConfig["hero"][K]) {
    setConfig((current) => ({ ...current, hero: { ...current.hero, [key]: value } }));
    setSource("manual");
  }

  function updateAbout<K extends keyof SiteConfig["about"]>(key: K, value: SiteConfig["about"][K]) {
    setConfig((current) => ({ ...current, about: { ...current.about, [key]: value } }));
    setSource("manual");
  }

  function addDog() {
    if (config.dogs.length >= 6) return;
    setConfig((current) => ({
      ...current,
      dogs: [...current.dogs, { name: "New dog", title: "A beloved part of our program", description: "Add a short introduction to this dog and the qualities they bring to your program.", imageUrl: current.hero.imageUrl, healthTesting: "Add completed health testing" }],
    }));
    setSource("manual");
  }

  function updateDog(index: number, key: keyof SiteConfig["dogs"][number], value: string) {
    setConfig((current) => ({ ...current, dogs: current.dogs.map((dog, dogIndex) => dogIndex === index ? { ...dog, [key]: value } : dog) }));
    setSource("manual");
  }

  function removeDog(index: number) {
    if (config.dogs.length === 1) return;
    setConfig((current) => ({ ...current, dogs: current.dogs.filter((_, dogIndex) => dogIndex !== index) }));
    setSource("manual");
  }

  async function askDesigner(requestedPrompt?: string) {
    const nextPrompt = (requestedPrompt ?? prompt).trim();
    if (!nextPrompt || aiBusy) return;
    setPrompt("");
    setAiBusy(true);
    setMessages((current) => [...current, { role: "user", text: nextPrompt }]);

    try {
      const response = await fetch("/api/site-builder/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteId, prompt: nextPrompt, currentConfig: config }),
      });
      const payload = await response.json() as (BuilderResponse & { generationId: string }) | { error: string };
      if (!response.ok || !("config" in payload)) throw new Error("error" in payload ? payload.error : "BreederWeb Designer could not update the site.");
      setConfig(payload.config);
      setGenerationId(payload.generationId);
      setSource("ai");
      setMessages((current) => [...current, { role: "assistant", text: payload.assistantMessage, changes: payload.changeSummary }]);
      setNotice("BreederWeb Designer’s changes are now in the live preview. Save when you are happy with them.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "BreederWeb Designer could not update the site.";
      setMessages((current) => [...current, { role: "assistant", text: message }]);
    } finally {
      setAiBusy(false);
    }
  }

  async function save(publish: boolean) {
    if (saveBusy) return;
    setSaveBusy(true);
    setNotice("");
    try {
      const response = await fetch("/api/site-builder/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteId, slug, config, publish, source, generationId }),
      });
      const payload = await response.json() as { siteId?: string; slug?: string; published?: boolean; error?: string };
      if (!response.ok || !payload.siteId) throw new Error(payload.error ?? "The site could not be saved.");
      setSiteId(payload.siteId);
      setPublished((current) => Boolean(payload.published) || current);
      setGenerationId(null);
      setSource("manual");
      setNotice(publish ? "Published. Your public website is live." : "Draft saved to your breeder workspace.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "The site could not be saved.");
    } finally {
      setSaveBusy(false);
    }
  }

  return (
    <main className={styles.builder}>
      <header className={styles.topbar}>
        <Link className={styles.builderBrand} href="/"><span>DBW</span><div><strong>Dog Breeder Web</strong><small>AI website builder</small></div></Link>
        <div className={styles.siteIdentity}>
          <label>Website address<span>dogbreederweb.site/sites/</span><input value={slug} onChange={(event) => setSlug(slugify(event.target.value))} aria-label="Website address" /></label>
        </div>
        <div className={styles.topActions}>
          {published && <Link className={styles.iconButton} href={publicUrl} target="_blank"><ExternalLink size={16} />View live</Link>}
          <button className={styles.secondaryButton} disabled={saveBusy} onClick={() => save(false)}><Save size={16} />Save draft</button>
          <button className={styles.publishButton} disabled={saveBusy} onClick={() => save(true)}>{saveBusy ? <LoaderCircle className={styles.spin} size={17} /> : <Check size={17} />}Publish</button>
        </div>
      </header>

      <div className={styles.workspace}>
        <aside className={styles.controls}>
          <div className={styles.accountLine}><span>{userEmail.slice(0, 1).toUpperCase()}</span><div><strong>Breeder workspace</strong><small>{userEmail}</small></div></div>
          <div className={styles.tabRow}>
            <button className={panel === "content" ? styles.activeTab : ""} onClick={() => setPanel("content")}>Content</button>
            <button className={panel === "style" ? styles.activeTab : ""} onClick={() => setPanel("style")}>Style</button>
          </div>

          {panel === "style" ? (
            <div className={styles.controlBody}>
              <div className={styles.styleIntro}><Sparkles size={18} /><div><strong>Your site is not locked to a template.</strong><p>Set exact colors here or ask BreederWeb Designer to rethink the complete visual direction in the conversation panel.</p></div></div>
              <ControlSection title="Colors" icon={<Palette size={15} />}>
                {(Object.keys(config.theme) as Array<keyof SiteConfig["theme"]>).map((key) => (
                  <label className={styles.colorField} key={key}><span>{key}</span><input type="color" value={config.theme[key]} onChange={(event) => { setConfig((current) => ({ ...current, theme: { ...current.theme, [key]: event.target.value } })); setSource("manual"); }} /><code>{config.theme[key]}</code></label>
                ))}
              </ControlSection>
              <ControlSection title="Visible sections">
                {(Object.keys(config.visibility) as Array<keyof SiteConfig["visibility"]>).map((key) => (
                  <label className={styles.switchField} key={key}><span>{key}</span><input type="checkbox" checked={config.visibility[key]} onChange={(event) => { setConfig((current) => ({ ...current, visibility: { ...current.visibility, [key]: event.target.checked } })); setSource("manual"); }} /></label>
                ))}
              </ControlSection>
            </div>
          ) : (
            <div className={styles.controlBody}>
              <ControlSection title="Brand details" open>
                <TextField label="Kennel name" value={config.brand.name} onChange={(value) => { updateBrand("name", value); if (!siteId) setSlug(slugify(value)); }} />
                <TextField label="Breed" value={config.brand.breed} onChange={(value) => updateBrand("breed", value)} />
                <TextField label="Tagline" value={config.brand.tagline} onChange={(value) => updateBrand("tagline", value)} />
                <TextField label="Location" value={config.brand.location} onChange={(value) => updateBrand("location", value)} />
                <TextField label="Email" type="email" value={config.brand.email} onChange={(value) => updateBrand("email", value)} />
                <TextField label="Phone" value={config.brand.phone} onChange={(value) => updateBrand("phone", value)} />
              </ControlSection>
              <ControlSection title="Hero section" open>
                <TextField label="Headline" value={config.hero.headline} onChange={(value) => updateHero("headline", value)} />
                <TextArea label="Introduction" value={config.hero.subheadline} onChange={(value) => updateHero("subheadline", value)} />
                <TextField label="Hero image URL" value={config.hero.imageUrl} onChange={(value) => updateHero("imageUrl", value)} />
                <TextField label="Button label" value={config.hero.ctaLabel} onChange={(value) => updateHero("ctaLabel", value)} />
              </ControlSection>
              <ControlSection title="Our story">
                <TextField label="Section heading" value={config.about.title} onChange={(value) => updateAbout("title", value)} />
                <TextArea label="Story" value={config.about.body} onChange={(value) => updateAbout("body", value)} />
                <TextField label="Image URL" value={config.about.imageUrl} onChange={(value) => updateAbout("imageUrl", value)} />
              </ControlSection>
              <ControlSection title={`Our dogs (${config.dogs.length})`}>
                {config.dogs.map((dog, index) => (
                  <div className={styles.repeater} key={`${dog.name}-${index}`}>
                    <div><strong>Dog {index + 1}</strong><button aria-label={`Remove ${dog.name}`} disabled={config.dogs.length === 1} onClick={() => removeDog(index)}><Trash2 size={14} /></button></div>
                    <TextField label="Name" value={dog.name} onChange={(value) => updateDog(index, "name", value)} />
                    <TextField label="Role" value={dog.title} onChange={(value) => updateDog(index, "title", value)} />
                    <TextArea label="Description" value={dog.description} onChange={(value) => updateDog(index, "description", value)} />
                    <TextField label="Image URL" value={dog.imageUrl} onChange={(value) => updateDog(index, "imageUrl", value)} />
                    <TextField label="Health testing" value={dog.healthTesting} onChange={(value) => updateDog(index, "healthTesting", value)} />
                  </div>
                ))}
                <button className={styles.addButton} disabled={config.dogs.length >= 6} onClick={addDog}><Plus size={15} />Add a dog</button>
              </ControlSection>
            </div>
          )}
        </aside>

        <section className={styles.previewArea}>
          <div className={styles.previewToolbar}>
            <span>Live preview</span>
            <div><button aria-label="Desktop preview" className={device === "desktop" ? styles.activeDevice : ""} onClick={() => setDevice("desktop")}><Laptop size={17} /></button><button aria-label="Mobile preview" className={device === "mobile" ? styles.activeDevice : ""} onClick={() => setDevice("mobile")}><Smartphone size={17} /></button></div>
          </div>
          {notice && <div className={styles.notice}>{notice}</div>}
          <div className={`${styles.previewFrame} ${device === "mobile" ? styles.mobileFrame : ""}`}>
            <SiteRenderer config={config} preview mobile={device === "mobile"} />
          </div>
        </section>

        <aside className={styles.copilot}>
          <div className={styles.copilotHeader}><span><Bot size={20} /></span><div><strong>BreederWeb Designer website copilot</strong><small>Interactive design partner</small></div><Sparkles size={16} /></div>
          <div className={styles.messages}>
            {messages.map((message, index) => (
              <div className={message.role === "user" ? styles.userMessage : styles.aiMessage} key={`${message.role}-${index}`}>
                <p>{message.text}</p>
                {message.changes && <ul>{message.changes.map((change) => <li key={change}><Check size={12} />{change}</li>)}</ul>}
              </div>
            ))}
            {aiBusy && <div className={styles.thinking}><LoaderCircle className={styles.spin} size={17} />BreederWeb Designer is shaping your site…</div>}
          </div>
          <div className={styles.promptIdeas}>{starterPrompts.map((idea) => <button key={idea} onClick={() => askDesigner(idea)}>{idea}</button>)}</div>
          <div className={styles.composer}>
            <textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void askDesigner(); } }} placeholder="Ask BreederWeb Designer to redesign or rewrite anything…" />
            <button aria-label="Send to BreederWeb Designer" disabled={!prompt.trim() || aiBusy} onClick={() => askDesigner()}><Send size={17} /></button>
          </div>
          <p className={styles.aiNote}>BreederWeb Designer changes editable site content—not raw code. Review all health claims and litter details before publishing.</p>
        </aside>
      </div>
    </main>
  );
}

function ControlSection({ title, children, icon, open = false }: { title: string; children: React.ReactNode; icon?: React.ReactNode; open?: boolean }) {
  return <details className={styles.controlSection} open={open}><summary>{icon}{title}<ChevronDown size={15} /></summary><div>{children}</div></details>;
}

function TextField({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return <label className={styles.field}><span>{label}</span><input type={type} value={value} onChange={(event) => onChange(event.target.value)} /></label>;
}

function TextArea({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className={styles.field}><span>{label}</span><textarea value={value} onChange={(event) => onChange(event.target.value)} /></label>;
}
