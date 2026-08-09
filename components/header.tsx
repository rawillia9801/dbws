import Link from "next/link";
import { Menu } from "lucide-react";
import { Logo } from "./logo";

const links = [
  ["Website Styles", "/#styles"],
  ["Features", "/#features"],
  ["Pricing", "/#pricing"],
  ["Examples", "/#examples"],
] as const;

export function Header() {
  return (
    <header className="site-header">
      <div className="shell header-inner">
        <Logo />
        <nav className="desktop-nav" aria-label="Primary navigation">
          <Link href="/">Home</Link>
          {links.map(([label, href]) => (
            <Link href={href} key={href}>{label}</Link>
          ))}
        </nav>
        <div className="header-actions">
          <Link className="sign-in" href="/login">Sign In</Link>
          <Link className="button button-primary button-small" href="/builder">Start Your Website</Link>
        </div>
        <details className="mobile-menu">
          <summary aria-label="Open navigation"><Menu size={24} /></summary>
          <nav aria-label="Mobile navigation">
            <Link href="/">Home</Link>
            {links.map(([label, href]) => (
              <Link href={href} key={href}>{label}</Link>
            ))}
            <Link href="/builder">Start Your Website</Link>
          </nav>
        </details>
      </div>
    </header>
  );
}
