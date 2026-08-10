export const websitePlan = {
  id: "website-monthly",
  name: "Dog Breeder Web",
  eyebrow: "Complete breeder website + companion workspace",
  setupFee: "149.00",
  monthlyPrice: "24.95",
  domainRenewal: "39.00",
  interval: "month",
  description: "A complete breeder website service with BreederWeb Designer, managed hosting, an included standard .com for the first year, two branded business email addresses, publishing, forms, embeds, mobile-ready pages, brand controls, version history, and an included MyDogPortal companion workspace for the breeder records that power the website. Cancel the website service at any time; the kennel remains the owner of its registered domain.",
  features: [
    "BreederWeb Designer",
    "One available non-premium .com for the first year",
    "The kennel owns its registered domain",
    "Cancel the website service at any time",
    "Managed Vercel hosting",
    "SSL",
    "Website updates and version history",
    "Two business email addresses branded to the connected domain",
    "Puppy and litter publishing",
    "Applications and contact forms",
    "Embeddable public website sections",
    "Mobile-ready pages",
    "Kennel branding and content controls",
    "Included MyDogPortal companion workspace",
    "Applications, buyers, families, and waitlist records",
    "Breeding dogs, litters, and puppy records",
    "Connected website publishing from breeder records",
    "Upgrade path to MyDogPortal Professional or Studio",
  ],
} as const;

export const websiteAddOns = [
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
