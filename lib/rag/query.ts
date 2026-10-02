const expansions: Record<string, string[]> = {
  technical: ["specification", "dimensions", "application", "installation", "material", "features", "technical"],
  install: ["installation", "base", "fittings", "overflow", "inlet", "outlet", "pipe"],
  dimension: ["height", "diameter", "length", "width", "dimensions"],
  size: ["capacity", "litre", "litres", "dimensions", "product code"],
  underground: ["Bunkatank", "BKT", "underground water storage"],
  aboveground: ["Kentank", "CCV", "above-ground water storage"],
  water: ["water storage", "Kentank", "Bunkatank", "Loftank", "Nestank"],
  sanitation: ["septic", "slab", "WonderLoo", "sanitation"],
  price: ["pricing", "price list", "zone", "VAT", "effective date"],
  delivery: ["delivery", "location", "zone", "route", "working days"]
};

export function expandKnowledgeQuery(query: string): string {
  const lower = query.toLowerCase();
  const additions = new Set<string>();

  for (const [trigger, terms] of Object.entries(expansions)) {
    if (lower.includes(trigger)) terms.forEach(term => additions.add(term));
  }

  if (/\b\d[\d,]*\s*(l|litre|litres|liter|liters)\b/i.test(query)) {
    additions.add("capacity");
    additions.add("product code");
  }

  if (/\b(ccv|bkt|nst|lr|kpot|dr|spt)\s*[- ]?\d+/i.test(query)) {
    additions.add("product specification");
    additions.add("product code");
  }

  return [query, ...Array.from(additions)].join(" ");
}
