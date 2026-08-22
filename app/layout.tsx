import type { Metadata, Viewport } from "next";
import Script from "next/script";
import type { CSSProperties } from "react";
import "./globals.css";

const fontVariables = {
  "--font-display": 'Georgia, "Times New Roman"',
  "--font-sans": 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI"',
} as CSSProperties;

export const metadata: Metadata = {
  metadataBase: new URL("https://dogbreederweb.site"),
  title: {
    default: "Dog Breeder Web | Websites Made for Dog Breeders",
    template: "%s | Dog Breeder Web",
  },
  description:
    "Custom, mobile-ready websites for dog breeders—built to showcase dogs, litters, available puppies, and the care behind every breeding program.",
  openGraph: {
    title: "Dog Breeder Web",
    description: "Beautiful websites built specifically for dog breeders.",
    url: "https://dogbreederweb.site",
    siteName: "Dog Breeder Web",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#fbf8f2",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" style={fontVariables}>
      <body>
        {children}
        <Script src="https://dogbreederos.com/api/public/support/widget?site=dogbreederweb" strategy="afterInteractive" />
      </body>
    </html>
  );
}
