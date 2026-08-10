export const websitePlan = {
  id: "website-monthly",
  name: "Dog Breeder Web",
  eyebrow: "Connected breeder website service",
  setupFee: "89.00",
  monthlyPrice: "20.00",
  domainRenewal: "39.00",
  interval: "month",
  description: "A connected breeder website service with BreederWeb Designer, managed hosting, an included standard .com, branded business email, MyDogPortal breeder workspace access, DogBreederDocs document tools, publishing, forms, embeds, and version history.",
  features: [
    "BreederWeb Designer",
    "MyDogPortal connected breeder workspace",
    "DogBreederDocs.Online document workspace",
    "Managed Vercel hosting",
    "SSL",
    "Updates",
    "Two business email addresses branded to the included domain",
    "Puppy and litter publishing",
    "Applications and contact forms",
    "Embeddable website sections",
    "Mobile-ready pages",
    "Brand controls",
    "Version history",
  ],
} as const;

export const websiteAddOns = [
  {
    id: "website-personalization",
    name: "Done-for-you personalization",
    price: "$299 one time",
    recurring: "One-time service",
    description: "We personalize the website for you using your kennel identity, photography, content, colors, and breeder information.",
  },
  {
    id: "custom-website",
    name: "Ground-up custom website",
    price: "From $749",
    recurring: "Custom project",
    description: "Custom page planning and design beyond the BreederWeb Designer workflow, scoped around the breeder's specific brand and content needs.",
  },
  {
    id: "business-voice",
    name: "Business Voice",
    price: "$69 setup",
    recurring: "$8.99/month or $99/year, plus usage",
    description: "A local business number with your greeting, business hours, voicemail, routing, and custom phone menu.",
  },
] as const;

export function formatPrice(price: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(price));
}
