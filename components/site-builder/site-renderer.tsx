import type { CSSProperties } from "react";
import { ArrowRight, CheckCircle2, Heart, Mail, MapPin } from "lucide-react";
import type { SiteConfig } from "@/lib/site-builder/schema";
import styles from "./site-renderer.module.css";

type ThemeStyle = CSSProperties & {
  "--site-primary": string;
  "--site-accent": string;
  "--site-background": string;
  "--site-ink": string;
};

export function SiteRenderer({ config, preview = false, mobile = false }: { config: SiteConfig; preview?: boolean; mobile?: boolean }) {
  const theme: ThemeStyle = {
    "--site-primary": config.theme.primary,
    "--site-accent": config.theme.accent,
    "--site-background": config.theme.background,
    "--site-ink": config.theme.ink,
  };

  return (
    <div className={`${styles.site}${preview ? ` ${styles.preview}` : ""}${mobile ? ` ${styles.mobile}` : ""}`} data-template={config.templateId} style={theme}>
      <header className={styles.header}>
        <a className={styles.wordmark} href="#top"><Heart size={19} />{config.brand.name}</a>
        <nav aria-label="Website navigation">
          {config.visibility.about && <a href="#about">Our story</a>}
          {config.visibility.dogs && <a href="#dogs">Our dogs</a>}
          {config.visibility.litters && <a href="#litters">Litters</a>}
          <a href="#contact">Contact</a>
        </nav>
      </header>

      <main id="top">
        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>{config.hero.eyebrow}</p>
            <h1>{config.hero.headline}</h1>
            <p>{config.hero.subheadline}</p>
            <a className={styles.button} href="#dogs">{config.hero.ctaLabel}<ArrowRight size={17} /></a>
          </div>
          <div className={styles.heroImage} style={{ backgroundImage: `url("${config.hero.imageUrl}")` }} role="img" aria-label={`${config.brand.breed} from ${config.brand.name}`} />
        </section>

        <section className={styles.trustBar} aria-label="Program highlights">
          {config.highlights.map((highlight) => (
            <article key={highlight.title}><CheckCircle2 /><div><strong>{highlight.title}</strong><span>{highlight.text}</span></div></article>
          ))}
        </section>

        {config.visibility.about && (
          <section className={styles.about} id="about">
            <div className={styles.aboutImage} style={{ backgroundImage: `url("${config.about.imageUrl}")` }} role="img" aria-label={`${config.brand.name} breeding program`} />
            <div>
              <p className={styles.eyebrow}>OUR PROGRAM</p>
              <h2>{config.about.title}</h2>
              <p>{config.about.body}</p>
              <span className={styles.location}><MapPin size={16} />{config.brand.location}</span>
            </div>
          </section>
        )}

        {config.visibility.dogs && (
          <section className={styles.section} id="dogs">
            <div className={styles.sectionHeading}><p className={styles.eyebrow}>MEET THE FAMILY</p><h2>Our dogs</h2><p>The heart of everything we do.</p></div>
            <div className={styles.dogGrid}>
              {config.dogs.map((dog) => (
                <article className={styles.dogCard} key={dog.name}>
                  <div className={styles.cardImage} style={{ backgroundImage: `url("${dog.imageUrl}")` }} role="img" aria-label={dog.name} />
                  <div><span>{dog.title}</span><h3>{dog.name}</h3><p>{dog.description}</p><small>{dog.healthTesting}</small></div>
                </article>
              ))}
            </div>
          </section>
        )}

        {config.visibility.litters && config.litters.length > 0 && (
          <section className={`${styles.section} ${styles.litters}`} id="litters">
            <div className={styles.sectionHeading}><p className={styles.eyebrow}>WHAT’S AHEAD</p><h2>Planned litters</h2></div>
            {config.litters.map((litter) => (
              <article className={styles.litterCard} key={litter.name}>
                <div className={styles.litterImage} style={{ backgroundImage: `url("${litter.imageUrl}")` }} role="img" aria-label={litter.name} />
                <div><span>{litter.status}</span><h3>{litter.name}</h3><p>{litter.description}</p><a href="#contact">Ask about this litter <ArrowRight size={15} /></a></div>
              </article>
            ))}
          </section>
        )}

        {config.visibility.testimonial && (
          <figure className={styles.quote}>
            <blockquote>“{config.testimonial.quote}”</blockquote>
            <figcaption>{config.testimonial.attribution}</figcaption>
          </figure>
        )}

        <section className={styles.contact} id="contact">
          <p className={styles.eyebrow}>LET’S TALK</p>
          <h2>{config.contact.headline}</h2>
          <p>{config.contact.body}</p>
          <a className={styles.button} href={`mailto:${config.brand.email}`}><Mail size={17} />{config.contact.buttonLabel}</a>
        </section>
      </main>

      <footer className={styles.footer}>
        <strong>{config.brand.name}</strong><span>{config.brand.tagline}</span><span>{config.brand.email} · {config.brand.phone}</span>
      </footer>
    </div>
  );
}
