import fs from "node:fs";
import path from "node:path";
import type { Product } from "../types";

let cache: Product[] | null = null;

function parseCsvLine(line: string): string[] {
  const values: string[] = [];
  let current = "";
  let quoted = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (quoted && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        quoted = !quoted;
      }
    } else if (ch === "," && !quoted) {
      values.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  values.push(current);
  return values;
}

function loadProducts(): Product[] {
  if (cache) return cache;

  const file = path.join(process.cwd(), "data", "product_catalogue_populated.csv");
  const text = fs.readFileSync(file, "utf8");
  const lines = text.split(/\r?\n/).filter(Boolean);
  const headers = parseCsvLine(lines[0]);

  cache = lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = values[index] ?? "";
    });

    return {
      product_id: row.product_id,
      product_code: row.product_code,
      product_name: row.product_name,
      category: row.category,
      capacity: row.capacity,
      capacity_unit: row.capacity_unit,
      application: row.application,
      dimensions: row.dimensions,
      material: row.material,
      features: row.features,
      source_document: row.source_document,
      source_page: row.source_page ? Number(row.source_page) : undefined
    };
  });

  return cache;
}

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/\b(litres?|liters?)\b/g, "l")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

const aliases: Record<string, string[]> = {
  kentank: ["kentank", "water tank", "above ground tank", "storage tank"],
  bunkatank: ["bunkatank", "underground tank", "underground water tank", "underground storage"],
  loftank: ["loftank", "rectangular tank", "rectangular water tank"],
  nestank: ["nestank", "nestable tank", "nestable water tank"],
  kpot: ["kpot", "water pot", "portable water storage"],
  drum: ["drum", "drums", "water drum", "rolling drum"],
  "pedal hand wash": ["pedal hand wash", "hand wash", "handwashing", "hand washing", "handwashing station"],
  permawell: ["permawell", "shallow well liner", "well liner"],
  bins: ["bin", "bins", "dust bin", "dustbin", "waste bin", "waste bins"],
  bucket: ["bucket", "buckets"],
  blueflame: ["blueflame", "blue flame", "bioslurrigaz", "biodigester", "biogas digester"],
  "cattle trough": ["cattle trough", "cattle troughs", "livestock trough", "feeding trough", "drinking trough"],
  "cooler box": ["cooler box", "cooler boxes", "insulated cooler", "cooler"],
  "fish tank": ["fish tank", "fish tanks", "fish farming tank", "fish farming tanks"],
  "flower bucket": ["flower bucket", "flower buckets"],
  gransilo: ["gransilo", "grain silo", "grain storage silo", "hermetic grain silo"],
  "lifeline gutter": ["lifeline gutter", "lifeline gutters", "rainwater gutter", "rainwater harvesting gutter"],
  mobilet: ["mobilet", "mobile toilet", "mobile toilets", "mobile toilet block", "mobile toile", "portable toilet", "portable toilets"],
  "hand hole": ["hand hole", "handhole", "cable chamber", "telecommunication chamber"],
  pallet: ["pallet", "pallets", "durapall", "durapall pallet"],
  qdesk: ["qdesk", "school desk", "student desk"],
  "sliver can": ["sliver can", "sliver cans", "inmotion tote", "inmotion tote box", "tote box"],
  tray: ["tray", "trays", "nestable tray", "stackable tray", "fodder tray"],
  "tuffbarrier": ["tuffbarrier", "tuff barrier", "road barrier", "road barricade"],
  "traffic con": ["traffic con", "traffic cone", "traffic cones"],
  "e koslab": ["ekoslab", "eko slab"],
  "mobislab": ["mobislab", "mobi slab"],
  "ekoplate": ["ekoplate", "eko plate"],
  "sanislab": ["sanislab", "sani slab"],
  wonderloo: ["wonderloo", "wonder loo", "toilet pedestal"]
};

function aliasTerms(query: string): string[] {
  const normalized = normalize(query);
  return Object.entries(aliases)
    .filter(([, terms]) => terms.some(term => normalized.includes(normalize(term))))
    .map(([key]) => key);
}

export function findProducts(query: string, limit = 6): Product[] {
  const products = loadProducts();
  const normalizedQuery = normalize(query);
  const aliasesFound = aliasTerms(query);
  const tokens = normalizedQuery.split(" ").filter(token => token.length > 1);

  const scored = products.map(product => {
    const haystack = normalize([
      product.product_code,
      product.product_name,
      product.category,
      product.capacity,
      product.capacity_unit,
      product.application,
      product.dimensions,
      product.material,
      product.features
    ].join(" "));

    const productName = normalize(product.product_name || "");
    const productCategory = normalize(product.category || "");

    let score = tokens.reduce((total, token) => total + (haystack.includes(token) ? 1 : 0), 0);

    for (const alias of aliasesFound) {
      const aliasNormalized = normalize(alias);
      const aliasMatched =
        productName.includes(aliasNormalized) ||
        productCategory === aliasNormalized ||
        haystack.includes(aliasNormalized);

      if (aliasMatched) score += 20;
      else score -= 5;
    }

    if (product.product_code && normalizedQuery === normalize(product.product_code)) score += 50;
    if (product.product_name && normalizedQuery === productName) score += 50;

    return { product, score };
  });

  // When a recognized product-family alias is present, only return products
  // belonging to that family. This prevents shared words/capacities from
  // selecting an unrelated product such as Pedal Hand Wash for "dust bin".
  const familyMatched = aliasesFound.length
    ? scored.filter(item => aliasesFound.every(alias => {
        const a = normalize(alias);
        return normalize(item.product.product_name || "").includes(a) ||
          normalize(item.product.category || "") === a ||
          normalize(item.product.category || "").includes(a);
      }))
    : [];

  const candidates = familyMatched.length ? familyMatched : scored;

  return candidates
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, Math.min(Math.max(limit, 1), 10))
    .map(item => item.product);
}

function compactNormalize(text: string): string {
  return normalize(text).replace(/[^a-z0-9]/g, "");
}

export function getProductDetails(identifier: string): Product | undefined {
  const q = normalize(identifier);
  const compact = compactNormalize(identifier);
  return loadProducts().find(product =>
    normalize(product.product_code) === q ||
    normalize(product.product_name) === q ||
    normalize(product.product_id) === q ||
    compactNormalize(product.product_code || "") === compact ||
    compactNormalize(product.product_name || "") === compact ||
    compactNormalize(product.product_id || "") === compact
  );
}

export function listProductsByCategory(category: string, limit = 50): Product[] {
  const q = normalize(category);
  return loadProducts()
    .filter(product => normalize(product.category).includes(q))
    .slice(0, Math.min(Math.max(limit, 1), 100));
}
