import fs from "node:fs/promises";
import path from "node:path";
import { isOfficialKentainersUrl } from "../lib/knowledge/source-policy";

const root = path.join(process.cwd(), "data", "source");

async function walk(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await walk(p));
    else files.push(p);
  }
  return files;
}

async function main() {
  const files = await walk(root);
  const manifests = files.filter(f => /manifest\.json$/i.test(f) || /official-sources\.json$/i.test(f));
  let checked = 0;
  let failures = 0;

  for (const file of manifests) {
    const data = JSON.parse(await fs.readFile(file, "utf8"));
    if (data.authority !== "kentainers.co.ke" || !Array.isArray(data.sources)) {
      console.error(`Invalid manifest: ${file}`);
      failures++;
      continue;
    }
    for (const source of data.sources) {
      checked++;
      if (!isOfficialKentainersUrl(source.url)) {
        console.error(`NON-OFFICIAL SOURCE: ${source.url}`);
        failures++;
      }
    }
  }

  console.log(`Verified ${checked} source records; failures=${failures}`);
  if (failures) process.exit(1);
}

main().catch(error => { console.error(error); process.exit(1); });
