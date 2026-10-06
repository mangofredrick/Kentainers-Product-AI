import fs from "node:fs";
import path from "node:path";

function parseCsvLine(line: string): string[] {
  const values: string[] = [];
  let current = "";
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (quoted && line[i + 1] === '"') { current += '"'; i++; }
      else quoted = !quoted;
    } else if (ch === "," && !quoted) {
      values.push(current);
      current = "";
    } else current += ch;
  }
  values.push(current);
  return values;
}

const file = path.join(process.cwd(), "data", "product_catalogue_populated.csv");
const lines = fs.readFileSync(file, "utf8").split(/\r?\n/).filter(Boolean);
if (lines.length < 2) throw new Error("Product catalogue is empty.");

const headers = parseCsvLine(lines[0]);
const required = ["product_id","product_code","product_name","category","capacity","capacity_unit","application","dimensions","source_document","source_page"];
for (const field of required) if (!headers.includes(field)) throw new Error(`Missing required column: ${field}`);

const rows = lines.slice(1).map(parseCsvLine);
const index = Object.fromEntries(headers.map((h, i) => [h, i]));
const ids = new Set<string>();
const codes = new Set<string>();

rows.forEach((row, i) => {
  const lineNo = i + 2;
  const value = (field: string) => (row[index[field]] ?? "").trim();
  const id = value("product_id");
  const code = value("product_code");
  const name = value("product_name");
  if (!id || !code || !name) throw new Error(`Row ${lineNo}: product_id, product_code and product_name are required.`);
  if (ids.has(id)) throw new Error(`Row ${lineNo}: duplicate product_id "${id}".`);
  if (codes.has(code)) throw new Error(`Row ${lineNo}: duplicate product_code "${code}".`);
  ids.add(id); codes.add(code);
  const capacity = value("capacity");
  if (capacity && Number.isNaN(Number(capacity))) throw new Error(`Row ${lineNo}: invalid capacity "${capacity}".`);
  if (!value("source_document") || !value("source_page")) throw new Error(`Row ${lineNo}: source_document and source_page are required.`);
});

console.log(`Product catalogue validation passed: ${rows.length} products, ${headers.length} columns.`);
