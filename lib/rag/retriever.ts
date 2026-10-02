import fs from "node:fs";
import path from "node:path";
import { semanticRetrieve } from "./vector";

export type RetrievedChunk = {
  text: string;
  page?: number;
  score?: number;
  document?: string;
};

const SOURCE_DIR = path.join(process.cwd(), "data", "source");

function localKnowledgeFiles(): string[] {
  if (!fs.existsSync(SOURCE_DIR)) return [];
  return fs.readdirSync(SOURCE_DIR)
    .filter(name => /\.(txt|md|csv)$/i.test(name))
    .map(name => path.join(SOURCE_DIR, name));
}

function localKeywordRetrieve(query: string, limit = 6): RetrievedChunk[] {
  const files = localKnowledgeFiles();
  if (!files.length) return [];

  const terms = query.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
  if (!terms.length) return [];

  const results: RetrievedChunk[] = [];
  for (const file of files) {
    const raw = fs.readFileSync(file, "utf8");
    const sections = raw.split(/\n(?=#{1,3}\s)|\f/).map(s => s.trim()).filter(Boolean);

    sections.forEach((text, index) => {
      const low = text.toLowerCase();
      const matched = terms.reduce((n, term) => n + (low.includes(term) ? 1 : 0), 0);
      if (matched > 0) {
        results.push({
          text,
          page: index + 1,
          score: matched / Math.max(terms.length, 1),
          document: path.basename(file)
        });
      }
    });
  }

  return results.sort((a, b) => (b.score ?? 0) - (a.score ?? 0)).slice(0, limit);
}

function dedupe(chunks: RetrievedChunk[]): RetrievedChunk[] {
  const seen = new Set<string>();
  return chunks.filter(chunk => {
    const key = `${chunk.document ?? ""}|${chunk.page ?? ""}|${chunk.text.slice(0, 180)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Hybrid retrieval: combine pgvector semantic evidence with the repository's
 * local source library. This means newly added official PDFs/website extracts
 * can be useful immediately, while the database remains the scalable semantic
 * index for the full knowledge base.
 */
export async function retrieveCatalogue(query: string): Promise<RetrievedChunk[]> {
  const local = localKeywordRetrieve(query, 6);
  let semantic: RetrievedChunk[] = [];

  if (process.env.DATABASE_URL && process.env.OPENAI_API_KEY) {
    try {
      semantic = await semanticRetrieve(query, 6);
    } catch (error) {
      console.error("Semantic retrieval failed; using local knowledge library.", error);
    }
  }

  return dedupe([
    ...semantic.map(chunk => ({ ...chunk, document: chunk.document ?? "database document" })),
    ...local
  ]).slice(0, 8);
}
