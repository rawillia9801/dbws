const comDomainPattern = /^(?=.{5,67}$)[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.com$/;

export class DomainValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DomainValidationError";
  }
}

export function normalizeComDomain(input: string) {
  let domain = input.trim().toLowerCase();
  if (!domain) throw new DomainValidationError("Enter the .com you would like us to register.");

  domain = domain.replace(/^https?:\/\//, "");
  domain = domain.split(/[\/?#]/, 1)[0] ?? "";
  domain = domain.replace(/^www\./, "").replace(/\.$/, "");
  if (!domain.includes(".")) domain = `${domain}.com`;

  if (!comDomainPattern.test(domain)) {
    throw new DomainValidationError("Enter a standard .com such as yourkennel.com. Letters, numbers, and hyphens are supported.");
  }

  return domain;
}

export function tryNormalizeComDomain(input: string) {
  try {
    return { domain: normalizeComDomain(input), error: null } as const;
  } catch (error) {
    return {
      domain: null,
      error: error instanceof Error ? error.message : "Enter a valid .com domain.",
    } as const;
  }
}
