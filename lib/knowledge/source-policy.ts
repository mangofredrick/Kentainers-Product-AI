export const OFFICIAL_HOSTS = new Set(["kentainers.co.ke","www.kentainers.co.ke"]);

export type SourceType = "page" | "pdf" | "pricing";

export interface SourceRecord {
  url: string;
  title: string;
  sourceType: SourceType;
  product?: string;
  effectiveDate?: string;
  verifiedAt: string;
  authority: "kentainers.co.ke";
}

export function isOfficialKentainersUrl(rawUrl: string): boolean {
  try {
    const u = new URL(rawUrl);
    return (u.protocol === "https:" || u.protocol === "http:") && OFFICIAL_HOSTS.has(u.hostname.toLowerCase());
  } catch {
    return false;
  }
}

export function classifySource(url: string): SourceType {
  return /\.pdf(?:$|[?#])/i.test(url) || /\/wp-content\/uploads\//i.test(url)
    ? "pdf"
    : /price|pricelist|pricing/i.test(url)
      ? "pricing"
      : "page";
}

export function assertOfficialSource(url: string): void {
  if (!isOfficialKentainersUrl(url)) {
    throw new Error(`Rejected non-authoritative source: ${url}`);
  }
}
