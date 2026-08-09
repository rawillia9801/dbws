export const templatePackages = [
  {
    id: "heritage",
    name: "Heritage",
    eyebrow: "A polished beginning",
    price: "149.00",
    description: "A warm, editorial template for established programs that want a trustworthy online home.",
    featured: false,
    features: [
      "Five essential website pages",
      "Mobile-ready breeder layout",
      "Puppy inquiry contact form",
      "Launch questionnaire and checklist",
    ],
  },
  {
    id: "modern-meadow",
    name: "Modern Meadow",
    eyebrow: "Most popular",
    price: "299.00",
    description: "A welcoming, personalized site with the pages breeders use most often.",
    features: [
      "Everything in Heritage",
      "Personalized colors and typography",
      "Available puppy and litter pages",
      "Structured family application form",
    ],
    featured: true,
  },
  {
    id: "signature",
    name: "Signature",
    eyebrow: "The complete presentation",
    price: "499.00",
    description: "An expanded, distinctive website for programs with a deeper story and more content.",
    featured: false,
    features: [
      "Everything in Modern Meadow",
      "Expanded custom design direction",
      "Up to ten launch-ready pages",
      "Content placement and launch review",
    ],
  },
] as const;

export type TemplatePackageId = (typeof templatePackages)[number]["id"];

export function getTemplatePackage(packageId: string) {
  return templatePackages.find((templatePackage) => templatePackage.id === packageId);
}

export function formatPackagePrice(price: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(price));
}
