import "server-only";

import { normalizeComDomain } from "@/lib/domain";
import { updateDomainDns } from "@/lib/hostinger";

const VERCEL_API = "https://api.vercel.com";

type Verification = { type?: string; domain?: string; value?: string };
type ProjectDomainResult = { verified?: boolean; verification?: Verification[]; error?: { message?: string }; message?: string };
type DomainConfig = {
  misconfigured?: boolean;
  recommendedCNAME?: Array<{ rank?: number; value?: string }> | string[];
  recommendedIPv4?: Array<{ rank?: number; value?: string }> | string[];
  error?: { message?: string };
};

export class VercelDomainError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = "VercelDomainError";
  }
}

function config() {
  const token = process.env.VERCEL_API_TOKEN?.trim();
  const project = process.env.VERCEL_PROJECT_ID?.trim() || process.env.VERCEL_PROJECT_NAME?.trim();
  const teamId = process.env.VERCEL_TEAM_ID?.trim();
  if (!token || !project || !teamId) throw new VercelDomainError("Automatic Vercel domain attachment is not configured.", 503);
  return { token, project, teamId };
}

async function vercelRequest<T>(path: string, init: RequestInit = {}) {
  const { token } = config();
  const headers = new Headers(init.headers);
  headers.set("authorization", `Bearer ${token}`);
  headers.set("content-type", "application/json");
  const response = await fetch(`${VERCEL_API}${path}`, { ...init, headers, cache: "no-store" });
  const body = await response.json().catch(() => ({})) as T & { error?: { message?: string }; message?: string };
  if (!response.ok) throw new VercelDomainError(body.error?.message || body.message || "Vercel could not configure this domain.", response.status);
  return body as T;
}

function firstRecommendation(value: DomainConfig["recommendedCNAME"] | DomainConfig["recommendedIPv4"]) {
  if (!Array.isArray(value) || value.length === 0) return "";
  const first = value[0];
  return typeof first === "string" ? first : String(first?.value || "");
}

export async function attachDomainToDogBreederWeb(input: string) {
  const domain = normalizeComDomain(input);
  const { project, teamId } = config();
  const query = `teamId=${encodeURIComponent(teamId)}`;

  const addDomain = async (name: string, redirect?: string) => {
    try {
      return await vercelRequest<ProjectDomainResult>(`/v10/projects/${encodeURIComponent(project)}/domains?${query}`, {
        method: "POST",
        body: JSON.stringify({ name, ...(redirect ? { redirect, redirectStatusCode: 308 } : {}) }),
      });
    } catch (error) {
      if (error instanceof VercelDomainError && /already|exists|assigned/i.test(error.message)) return {} as ProjectDomainResult;
      throw error;
    }
  };

  const apex = await addDomain(domain);
  await addDomain(`www.${domain}`, domain);

  const domainConfig = await vercelRequest<DomainConfig>(`/v6/domains/${encodeURIComponent(domain)}/config?${query}`);
  const apexTarget = firstRecommendation(domainConfig.recommendedIPv4) || "76.76.21.21";
  const wwwTarget = firstRecommendation(domainConfig.recommendedCNAME) || "cname.vercel-dns-0.com";

  const verificationRecords = (apex.verification || []).filter((record) => record.type && record.domain && record.value);
  const zone = [
    { name: "@", type: "A", ttl: 300, records: [{ content: apexTarget }] },
    { name: "www", type: "CNAME", ttl: 300, records: [{ content: wwwTarget }] },
    ...verificationRecords.map((record) => ({
      name: String(record.domain).replace(`.${domain}`, "").replace(/\.$/, "") || "@",
      type: String(record.type).toUpperCase(),
      ttl: 300,
      records: [{ content: String(record.value) }],
    })),
  ];
  await updateDomainDns(domain, zone);

  try {
    await vercelRequest<ProjectDomainResult>(`/v9/projects/${encodeURIComponent(project)}/domains/${encodeURIComponent(domain)}/verify?${query}`, { method: "POST", body: "{}" });
  } catch (error) {
    if (!(error instanceof VercelDomainError) || ![400, 409].includes(error.status)) throw error;
  }

  return { domain, apexTarget, wwwTarget, verificationRecords, configured: true };
}
