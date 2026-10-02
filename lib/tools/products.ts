import fs from "node:fs";
import path from "node:path";
import type { Product } from "../types";
let cache: Product[] | null = null;
function loadProducts(): Product[] {
  if (cache) return cache;
  const file = path.join(process.cwd(), "data", "product_catalogue_populated.csv");
  const text = fs.readFileSync(file, "utf8");
  const lines = text.split(/\r?\n/).filter(Boolean);
  const headers = lines[0].split(",");
  const loaded = lines.slice(1).map((line) => { const values = line.split(","); const row: Record<string,string> = {}; headers.forEach((h,i)=>row[h]=values[i]??""); return { product_id:row.product_id, product_code:row.product_code, product_name:row.product_name, category:row.category, capacity:row.capacity, capacity_unit:row.capacity_unit, application:row.application, dimensions:row.dimensions, material:row.material, features:row.features, source_document:row.source_document, source_page:row.source_page ? Number(row.source_page) : undefined }; });
  cache = loaded; return loaded;
}
export function findProducts(query: string, limit = 6): Product[] { const products=loadProducts(); const tokens=query.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean); return products.map(p=>{const haystack=[p.product_code,p.product_name,p.category,p.capacity,p.capacity_unit,p.application,p.dimensions,p.material,p.features].join(" ").toLowerCase(); const score=tokens.reduce((n,t)=>n+(haystack.includes(t)?1:0),0); return {p,score};}).filter(x=>x.score>0).sort((a,b)=>b.score-a.score).slice(0,limit).map(x=>x.p); }
export function getProductDetails(identifier: string): Product | undefined { const q=identifier.toLowerCase(); return loadProducts().find(p=>p.product_code.toLowerCase()===q||p.product_name.toLowerCase()===q||p.product_id.toLowerCase()===q); }
