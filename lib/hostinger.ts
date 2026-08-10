import "server-only";

import { randomBytes } from "node:crypto";
import { normalizeComDomain } from "@/lib/domain";

const HOSTINGER_API_BASE = "https://developers.hostinger.com";

type HostingerErrorBody = { error?: string; message?: string; correlation_id?: string };
type AvailabilityRow = { domain?: string; is_available?: boolean; available?: boolean; price?: number | string | null; item_id?: string | null; product_id?: string | null };
export type DomainAvailability = { domain: string; available: boolean; priceCents: number | null; itemId: string | null };

export class HostingerApiError extends Error {
  constructor(message: string, public readonly status: number, public readonly correlationId?: string) {
    super(message);
    this.name = "HostingerApiError";
  }
}

function token() {
  const value = process.env.HOSTINGER_API_TOKEN?.trim();
  if (!value || /^your[_-]/i.test(value)) throw new HostingerApiError("Hostinger automation is not configured.", 503);
  return value;
}

async function hostingerRequest<T>(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  headers.set("authorization", `Bearer ${token()}`);
  headers.set("accept", "application/json");
  if (init.body) headers.set("content-type", "application/json");
  const response = await fetch(`${HOSTINGER_API_BASE}${path}`, { ...init, headers, cache: "no-store" });
  const body = await response.json().catch(() => ({})) as T & HostingerErrorBody;
  if (!response.ok) throw new HostingerApiError(body.error || body.message || "Hostinger could not complete the request.", response.status, body.correlation_id);
  return body as T;
}

function listFrom(payload: unknown, keys: string[] = ["data", "items"]): Record<string, unknown>[] {
  if (Array.isArray(payload)) return payload as Record<string, unknown>[];
  if (payload && typeof payload === "object") {
    const value = payload as Record<string, unknown>;
    for (const key of keys) if (Array.isArray(value[key])) return value[key] as Record<string, unknown>[];
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
  const payload = await hostingerRequest<unknown>("/api/domains/v1/availability", {
    method: "POST",
    body: JSON.stringify({ domain: domain.slice(0, -4), tlds: ["com"], with_alternatives: false }),
  });
  const rows = listFrom(payload, ["data", "domains"]) as AvailabilityRow[];
  const row = rows.find((item) => String(item.domain || "").toLowerCase() === domain) ?? rows[0];
  return { domain, available: Boolean(row?.is_available ?? row?.available), priceCents: cents(row?.price), itemId: String(row?.item_id || row?.product_id || "") || null };
}

type CatalogRow = { id?: string; item_id?: string; name?: string; title?: string };
async function comCatalogItemId() {
  const rows = listFrom(await hostingerRequest<unknown>("/api/billing/v1/catalog?category=domain")) as CatalogRow[];
  const candidate = rows.find((row) => /domain/.test(`${row.id || ""} ${row.item_id || ""} ${row.name || ""} ${row.title || ""}`.toLowerCase()) && /(?:^|[-\s])com(?:[-\s]|$)/.test(`${row.id || ""} ${row.item_id || ""} ${row.name || ""} ${row.title || ""}`.toLowerCase()));
  const id = String(candidate?.item_id || candidate?.id || "");
  if (!id) throw new HostingerApiError("Hostinger did not return a purchasable .com catalog item.", 502);
  return id;
}

export async function purchaseComDomain(input: string) {
  const domain = normalizeComDomain(input);
  const availability = await checkComDomainAvailability(domain);
  if (!availability.available) throw new HostingerApiError(`${domain} is no longer available. Choose another domain before registration.`, 409);
  const itemId = availability.itemId || await comCatalogItemId();
  const order = await hostingerRequest<Record<string, unknown>>("/api/domains/v1/portfolio", { method: "POST", body: JSON.stringify({ domain, item_id: itemId }) });
  return { domain, itemId, order };
}

export async function getDomainDetails(input: string) {
  const domain = normalizeComDomain(input);
  return hostingerRequest<Record<string, unknown>>(`/api/domains/v1/portfolio/${encodeURIComponent(domain)}`);
}

export async function updateDomainDns(input: string, zone: Array<{ name: string; type: string; ttl?: number; records: Array<{ content: string; is_disabled?: boolean }> }>) {
  const domain = normalizeComDomain(input);
  return hostingerRequest<Record<string, unknown>>(`/api/dns/v1/zones/${encodeURIComponent(domain)}`, { method: "PUT", body: JSON.stringify({ zone, overwrite: false }) });
}

export type MailOrder = { id: string; domain: string; status: string };

export async function findMailOrderForDomain(input: string): Promise<MailOrder | null> {
  const domain = normalizeComDomain(input);
  const rows = listFrom(await hostingerRequest<unknown>("/api/mail/v1/orders?per_page=100"));
  const row = rows.find((item) => String(item.domain || item.domain_name || "").toLowerCase() === domain);
  if (!row) return null;
  const id = String(row.id || row.order_id || row.resource_id || "");
  return id ? { id, domain, status: String(row.status || "unknown") } : null;
}

export async function listMailboxes(orderId: string) {
  return listFrom(await hostingerRequest<unknown>(`/api/mail/v1/orders/${encodeURIComponent(orderId)}/mailboxes?per_page=100`));
}

function mailboxPassword() {
  return `Dbw!${randomBytes(18).toString("base64url")}9aA`;
}

export async function createMailbox(orderId: string, localPart: string) {
  const local = localPart.trim().toLowerCase();
  if (!/^[a-z0-9](?:[a-z0-9._-]{0,62}[a-z0-9])?$/.test(local)) throw new HostingerApiError("Use letters, numbers, dots, underscores, or hyphens for the email name.", 400);
  const password = mailboxPassword();
  const mailbox = await hostingerRequest<Record<string, unknown>>(`/api/mail/v1/orders/${encodeURIComponent(orderId)}/mailboxes`, {
    method: "POST",
    body: JSON.stringify({ local_part: local, password }),
  });
  return { localPart: local, password, mailbox };
}
