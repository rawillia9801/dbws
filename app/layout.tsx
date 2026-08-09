import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import "./globals.css";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const sans = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

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
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
