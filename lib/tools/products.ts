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
  kentank: ["kentank", "water tank", "above ground tank"],
  bunkatank: ["bunkatank", "underground tank", "underground water tank"],
  loftank: ["loftank", "rectangular tank", "rectangular water tank"],
  nestank: ["nestank", "nestable tank"],
  kpot: ["kpot", "water pot", "portable water storage"],
  drum: ["drum", "drums"],
  "pedal hand wash": ["pedal hand wash", "hand wash", "handwashing", "hand washing"],
  permawell: ["permawell", "shallow well liner", "well liner"]
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

  return products
    .map(product => {
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

      let score = tokens.reduce((total, token) => total + (haystack.includes(token) ? 1 : 0), 0);

      for (const alias of aliasesFound) {
        if (haystack.includes(normalize(alias)) || normalize(product.product_name).includes(normalize(alias))) {
          score += 4;
        }
      }

      if (product.product_code && normalizedQuery === normalize(product.product_code)) score += 20;
      if (product.product_name && normalizedQuery === normalize(product.product_name)) score += 20;

      return { product, score };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, Math.min(Math.max(limit, 1), 10))
    .map(item => item.product);
}

export function getProductDetails(identifier: string): Product | undefined {
  const q = normalize(identifier);
  return loadProducts().find(product =>
    normalize(product.product_code) === q ||
    normalize(product.product_name) === q ||
    normalize(product.product_id) === q
  );
}

export function listProductsByCategory(category: string, limit = 50): Product[] {
  const q = normalize(category);
  return loadProducts()
    .filter(product => normalize(product.category).includes(q))
    .slice(0, Math.min(Math.max(limit, 1), 100));
}
