import { classifySource, assertOfficialSource, type SourceRecord } from "./source-policy";

export function createSourceRecord(input: {
  url: string;
  title: string;
  product?: string;
  effectiveDate?: string;
  verifiedAt?: string;
}): SourceRecord {
  assertOfficialSource(input.url);
  return {
    url: input.url,
    title: input.title,
    sourceType: classifySource(input.url),
    product: input.product,
    effectiveDate: input.effectiveDate,
    verifiedAt: input.verifiedAt ?? new Date().toISOString(),
    authority: "kentainers.co.ke",
  };
}
