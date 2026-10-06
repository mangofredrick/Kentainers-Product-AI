import fs from "node:fs";
import path from "node:path";
import { semanticRetrieve } from "./vector";
import { expandKnowledgeQuery } from "./query";
import { getPool } from "../db";

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

async function retrieveVerifiedKnowledge(query: string, limit = 4): Promise<RetrievedChunk[]> {
  if (!process.env.DATABASE_URL) return [];
  try {
    const terms = query.toLowerCase().split(/[^a-z0-9]+/).filter((term) => term.length >= 3).slice(0, 12);
    if (!terms.length) return [];
    const conditions = terms.map((_, i) => `question ILIKE ${i + 1}`).join(" OR ");
    const values = terms.map((term) => `%${term}%`);
    const result = await getPool().query(
      `SELECT question, approved_answer, frequency FROM chatbot_question_memory WHERE knowledge_status = 'verified' AND approved_answer IS NOT NULL AND (${conditions}) ORDER BY frequency DESC, last_asked_at DESC LIMIT ${terms.length + 1}`,
      [...values, limit]
    );
    return result.rows.map((row: { question: string; approved_answer: string; frequency: number }) => ({
      text: `Verified Kentainers knowledge from an approved customer question. Question: ${row.question}\nApproved answer: ${row.approved_answer}`,
      score: 1,
      document: "KPIA verified customer knowledge"
    }));
  } catch (error) {
    console.error("Verified customer knowledge retrieval failed.", error);
    return [];
  }
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
 * local source library. Query expansion improves recall for technical,
 * installation, dimension, capacity, pricing and application questions while
 * keeping the source documents themselves unchanged.
 */
export async function retrieveCatalogue(query: string): Promise<RetrievedChunk[]> {
  const expandedQuery = expandKnowledgeQuery(query);
  const local = localKeywordRetrieve(expandedQuery, 6);
  const verified = await retrieveVerifiedKnowledge(expandedQuery, 4);
  let semantic: RetrievedChunk[] = [];

  if (process.env.DATABASE_URL && process.env.OPENAI_API_KEY) {
    try {
      semantic = await semanticRetrieve(expandedQuery, 6);
    } catch (error) {
      console.error("Semantic retrieval failed; using local knowledge library.", error);
    }
  }

  return dedupe([
    ...verified,
    ...semantic.map(chunk => ({ ...chunk, document: chunk.document ?? "database document" })),
    ...local
  ]).slice(0, 8);
}
