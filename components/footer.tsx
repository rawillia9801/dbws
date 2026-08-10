import Link from "next/link";
import { Logo } from "./logo";

export function Footer() {
  return (
    <footer className="footer">
      <div className="shell footer-grid">
        <div>
          <Logo />
          <p>AI-built, breeder-editable websites connected to the public web layer of your breeder system.</p>
        </div>
        <div>
          <h3>Explore</h3>
          <Link href="/#builder">AI Website Builder</Link>
          <Link href="/#features">Features</Link>
          <Link href="/#examples">Connected Web</Link>
        </div>
        <div>
          <h3>Get started</h3>
          <Link href="/builder">Build With BreederWeb Designer</Link>
          <Link href="/#pricing">One Plan + Add-ons</Link>
          <a href="mailto:hello@dogbreederweb.site">hello@dogbreederweb.site</a>
        </div>
      </div>
      <div className="shell footer-bottom">
        <span>© {new Date().getFullYear()} Dog Breeder Web</span>
        <span>Built for breeders who care how their program is presented.</span>
      </div>
    </footer>
  );
}
