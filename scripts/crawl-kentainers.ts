import fs from "node:fs/promises";
import path from "node:path";
import { assertOfficialSource, classifySource } from "../lib/knowledge/source-policy";

const ROOT = "https://kentainers.co.ke/";
const OUT = path.join(process.cwd(), "data", "source", "official-web");
const MAX_PAGES = Number(process.env.KENTAINERS_CRAWL_MAX_PAGES ?? 120);
const REQUEST_TIMEOUT_MS = 15000;

const seedUrls = [
  "https://kentainers.co.ke/",
  "https://kentainers.co.ke/shop/",
  "https://kentainers.co.ke/faqs/",
  "https://kentainers.co.ke/contact-us/",
];

function absoluteUrl(href: string, base: string): string | null {
  try {
    const u = new URL(href, base);
    if (u.protocol !== "https:" || u.hostname !== "kentainers.co.ke") return null;
    u.hash = "";
    return u.toString();
  } catch {
    return null;
  }
}

function stripHtml(html: string): string {
  return html
    .replace(/<script[\\s\\S]*?<\\/script>/gi, " ")
    .replace(/<style[\\s\\S]*?<\\/style>/gi, " ")
    .replace(/<noscript[\\s\\S]*?<\\/noscript>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/gi, '"')
    .replace(/\\s+/g, " ")
    .trim();
}

function titleOf(html: string, fallback: string): string {
  const m = html.match(/<title[^>]*>([\\s\\S]*?)<\\/title>/i);
  return m ? stripHtml(m[1]).slice(0, 240) : fallback;
}

async function fetchText(url: string): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      headers: { "user-agent": "Kentainers-Product-AI-official-source-crawler/1.0" },
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    return await res.text();
  } finally {
    clearTimeout(timer);
  }
}

async function discover(startUrls: string[]): Promise<string[]> {
  const queue = [...startUrls];
  const seen = new Set<string>();
  const urls: string[] = [];

  while (queue.length && urls.length < MAX_PAGES) {
    const url = queue.shift()!;
    if (seen.has(url)) continue;
    seen.add(url);
    assertOfficialSource(url);

    let html: string;
    try {
      html = await fetchText(url);
    } catch (error) {
      console.warn(`Skipping ${url}: ${error instanceof Error ? error.message : error}`);
      continue;
    }

    urls.push(url);
    const hrefs = [...html.matchAll(/href=["']([^"']+)["']/gi)].map(m => m[1]);
    for (const href of hrefs) {
      const next = absoluteUrl(href, url);
      if (next && !seen.has(next) && !/\.(?:jpg|jpeg|png|gif|webp|svg|zip)$/i.test(next)) {
        queue.push(next);
      }
    }
  }
  return urls;
}

async function main() {
  await fs.mkdir(OUT, { recursive: true });
  const urls = await discover(seedUrls);
  const manifest: Array<{url:string;title:string;sourceType:string;file:string;verifiedAt:string}> = [];

  for (const url of urls) {
    const html = await fetchText(url);
    const title = titleOf(html, url);
    const text = stripHtml(html);
    const slug = new URL(url).pathname.replace(/^\\/+|\\/+$/g, "").replace(/[^a-z0-9]+/gi, "-") || "home";
    const file = `${slug}.txt`;
    await fs.writeFile(path.join(OUT, file), `SOURCE_URL: ${url}\\nSOURCE_TITLE: ${title}\\nSOURCE_TYPE: ${classifySource(url)}\\nVERIFIED_AT: ${new Date().toISOString()}\\n\\n${text}\\n`, "utf8");
    manifest.push({ url, title, sourceType: classifySource(url), file: path.posix.join("data/source/official-web", file), verifiedAt: new Date().toISOString() });
  }

  await fs.writeFile(path.join(OUT, "manifest.json"), JSON.stringify({authority:"kentainers.co.ke",generatedAt:new Date().toISOString(),count:manifest.length,sources:manifest}, null, 2));
  console.log(`Crawled ${manifest.length} official Kentainers pages into ${OUT}`);
}

main().catch(error => { console.error(error); process.exit(1); });
