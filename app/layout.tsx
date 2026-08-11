import type { Metadata, Viewport } from "next";
import "./globals.css";

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
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
