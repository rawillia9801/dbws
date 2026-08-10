import "server-only";

import { normalizeComDomain } from "@/lib/domain";

const HOSTINGER_API_BASE = "https://developers.hostinger.com";

type HostingerErrorBody = { error?: string; message?: string; correlation_id?: string };

type AvailabilityRow = {
  domain?: string;
  is_available?: boolean;
  available?: boolean;
  price?: number | string | null;
  item_id?: string | null;
  product_id?: string | null;
};

export type DomainAvailability = {
  domain: string;
  available: boolean;
  priceCents: number | null;
  itemId: string | null;
};

export class HostingerApiError extends Error {
  constructor(message: string, public readonly status: number, public readonly correlationId?: string) {
    super(message);
    this.name = "HostingerApiError";
  }
}

function token() {
  const value = process.env.HOSTINGER_API_TOKEN?.trim();
  if (!value || /^your[_-]/i.test(value)) throw new HostingerApiError("Domain registration is not configured.", 503);
  return value;
}

async function hostingerRequest<T>(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  headers.set("authorization", `Bearer ${token()}`);
  headers.set("accept", "application/json");
  if (init.body) headers.set("content-type", "application/json");
  const response = await fetch(`${HOSTINGER_API_BASE}${path}`, { ...init, headers, cache: "no-store" });
  const body = await response.json().catch(() => ({})) as T & HostingerErrorBody;
  if (!response.ok) throw new HostingerApiError(body.error || body.message || "Hostinger could not complete the domain request.", response.status, body.correlation_id);
  return body as T;
}

function rowsFromAvailability(payload: unknown): AvailabilityRow[] {
  if (Array.isArray(payload)) return payload as AvailabilityRow[];
  if (payload && typeof payload === "object") {
    const value = payload as Record<string, unknown>;
    if (Array.isArray(value.data)) return value.data as AvailabilityRow[];
    if (Array.isArray(value.domains)) return value.domains as AvailabilityRow[];
  }
  return [];
}

function cents(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return null;
  return Number.isInteger(n) ? n : Math.round(n * 100);
}

export async function checkComDomainAvailability(input: string): Promise<DomainAvailability> {
  const domain = normalizeComDomain(input);
  const label = domain.slice(0, -4);
  const payload = await hostingerRequest<unknown>("/api/domains/v1/availability", {
    method: "POST",
    body: JSON.stringify({ domain: label, tlds: ["com"], with_alternatives: false }),
  });
  const row = rowsFromAvailability(payload).find((item) => String(item.domain || "").toLowerCase() === domain) ?? rowsFromAvailability(payload)[0];
  return {
    domain,
    available: Boolean(row?.is_available ?? row?.available),
    priceCents: cents(row?.price),
    itemId: String(row?.item_id || row?.product_id || "") || null,
  };
}

type CatalogRow = {
  id?: string;
  item_id?: string;
  name?: string;
  title?: string;
  category?: string;
  price?: number;
};

function catalogRows(payload: unknown): CatalogRow[] {
  if (Array.isArray(payload)) return payload as CatalogRow[];
  if (payload && typeof payload === "object") {
    const value = payload as Record<string, unknown>;
    if (Array.isArray(value.data)) return value.data as CatalogRow[];
    if (Array.isArray(value.items)) return value.items as CatalogRow[];
  }
  return [];
}

async function comCatalogItemId() {
  const payload = await hostingerRequest<unknown>("/api/billing/v1/catalog?category=domain");
  const rows = catalogRows(payload);
  const candidate = rows.find((row) => {
    const text = `${row.id || ""} ${row.item_id || ""} ${row.name || ""} ${row.title || ""}`.toLowerCase();
    return /(?:^|[-\s])com(?:[-\s]|$)/.test(text) && /domain/.test(text);
  });
  const id = String(candidate?.item_id || candidate?.id || "");
  if (!id) throw new HostingerApiError("Hostinger did not return a purchasable .com catalog item.", 502);
  return id;
}

export async function purchaseComDomain(input: string) {
  const domain = normalizeComDomain(input);
  const availability = await checkComDomainAvailability(domain);
  if (!availability.available) throw new HostingerApiError(`${domain} is no longer available. Choose another domain before registration.`, 409);
  const itemId = availability.itemId || await comCatalogItemId();
  const order = await hostingerRequest<Record<string, unknown>>("/api/domains/v1/portfolio", {
    method: "POST",
    body: JSON.stringify({ domain, item_id: itemId }),
  });
  return { domain, itemId, order };
}

export async function getDomainDetails(input: string) {
  const domain = normalizeComDomain(input);
  return hostingerRequest<Record<string, unknown>>(`/api/domains/v1/portfolio/${encodeURIComponent(domain)}`);
}

export async function updateDomainDns(input: string, zone: Array<{ name: string; type: string; ttl?: number; records: Array<{ content: string; is_disabled?: boolean }> }>) {
  const domain = normalizeComDomain(input);
  return hostingerRequest<Record<string, unknown>>(`/api/dns/v1/zones/${encodeURIComponent(domain)}`, {
    method: "PUT",
    body: JSON.stringify({ zone, overwrite: false }),
  });
}
