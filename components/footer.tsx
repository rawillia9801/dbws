import Link from "next/link";
import { Logo } from "./logo";

export function Footer() {
  return (
    <footer className="footer">
      <div className="shell footer-grid">
        <div>
          <Logo />
          <p>Beautiful, professional websites made specifically for dog breeders.</p>
        </div>
        <div>
          <h3>Explore</h3>
          <Link href="/#styles">Website Styles</Link>
          <Link href="/#features">Features</Link>
          <Link href="/#examples">Examples</Link>
        </div>
        <div>
          <h3>Get started</h3>
          <Link href="/builder">Open Website Studio</Link>
          <Link href="/start">Request Your Website</Link>
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
