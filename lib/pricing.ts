export const websitePlan = {
  id: "website-monthly",
  name: "Dog Breeder Web",
  eyebrow: "One complete website plan",
  price: "17.95",
  interval: "month",
  description: "The public website layer from the WhiteLabel breeder platform, rebuilt around an interactive BreederWeb Designer website builder.",
  features: [
    "Interactive BreederWeb Designer AI website builder",
    "Managed Vercel hosting, SSL, and updates",
    "Two branded business email addresses",
    "Included kennel subdomain",
    "Connected available-puppy and litter publishing",
    "Editable puppy application and contact forms",
    "Embeddable puppy, litter, and application sections",
    "Mobile-ready pages, brand controls, and version history",
  ],
} as const;

export const websiteAddOns = [
  {
    id: "brand-launch",
    name: "Brand Launch",
    price: "$149 setup",
    recurring: "$29/year after the first year",
    description: "Registration of an available standard .com with DNS and SSL configuration handled for you.",
  },
  {
    id: "website-personalization",
    name: "Done-for-you personalization",
    price: "$299 one time",
    recurring: "No recurring design fee",
    description: "A human-assisted launch using your kennel identity, photography, content, colors, and connected breeder information.",
  },
  {
    id: "custom-website",
    name: "Ground-up custom website",
    price: "From $749",
    recurring: "Scoped before work begins",
    description: "Custom page planning and design beyond the supported AI builder, with connected breeder data where appropriate.",
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
