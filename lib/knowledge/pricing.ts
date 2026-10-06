export type PricingModel =
  | "official_zonal_table"
  | "product_page"
  | "request_for_quote"
  | "unavailable";

export interface PricingQuery {
  productCode?: string;
  productName?: string;
  capacityLitres?: number;
  zone?: number;
}

export interface PricingResult {
  model: PricingModel;
  priceKsh?: number;
  zone?: number;
  sourceUrl: string;
  effectiveDate?: string;
  reason?: string;
}

export function zonalPrice(
  rows: Array<{ productCode: string; capacityLitres: number; pricesKsh: number[] }>,
  query: PricingQuery,
  sourceUrl: string,
  effectiveDate: string
): PricingResult {
  const row = rows.find(r =>
    (query.productCode && r.productCode.toLowerCase() === query.productCode.toLowerCase()) ||
    (query.capacityLitres != null && r.capacityLitres === query.capacityLitres)
  );

  if (!row) {
    return {
      model: "unavailable",
      sourceUrl,
      effectiveDate,
      reason: "No matching verified price row was found."
    };
  }

  if (!query.zone || query.zone < 1 || query.zone > row.pricesKsh.length) {
    return {
      model: "official_zonal_table",
      sourceUrl,
      effectiveDate,
      reason: "A valid delivery zone is required before returning the zonal price."
    };
  }

  return {
    model: "official_zonal_table",
    priceKsh: row.pricesKsh[query.zone - 1],
    zone: query.zone,
    sourceUrl,
    effectiveDate
  };
}
