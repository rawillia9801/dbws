export const websitePlan = {
  id: "website-monthly",
  name: "Dog Breeder Web",
  eyebrow: "Complete breeder website service",
  setupFee: "149.00",
  monthlyPrice: "24.95",
  domainRenewal: "39.00",
  interval: "month",
  description: "A complete breeder website service with BreederWeb Designer, managed hosting, an included standard .com for the first year, two branded business email addresses, publishing, forms, embeds, mobile-ready pages, brand controls, and version history. MyDogPortal and DogBreederDocs integrations are supported, but their paid plans or purchases are separate unless included through an eligible MyDogPortal plan.",
  features: [
    "BreederWeb Designer",
    "One available non-premium .com for the first year",
    "Managed Vercel hosting",
    "SSL",
    "Website updates and version history",
    "Two business email addresses branded to the connected domain",
    "Puppy and litter publishing",
    "Applications and contact forms",
    "Embeddable public website sections",
    "Mobile-ready pages",
    "Kennel branding and content controls",
    "MyDogPortal integration ready",
    "DogBreederDocs integration ready",
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
