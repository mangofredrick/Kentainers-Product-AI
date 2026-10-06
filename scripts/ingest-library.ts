import fs from "node:fs";
import path from "node:path";
import OpenAI from "openai";
import pg from "pg";

const { Pool } = pg;
const sourceDir = path.join(process.cwd(), "data", "source");

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");
if (!process.env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is required");

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function chunkText(text: string, maxChars = 3500): string[] {
  const sections = text.split(/\n(?=#{1,3}\s)|\f/).map(s => s.trim()).filter(Boolean);
  const chunks: string[] = [];
  let current = "";

  for (const section of sections) {
    if ((current + "\n\n" + section).length <= maxChars) {
      current = current ? `${current}\n\n${section}` : section;
      continue;
    }
    if (current) chunks.push(current);
    current = section;
  }
  if (current) chunks.push(current);
  return chunks;
}

async function main() {
  const files = fs.readdirSync(sourceDir)
    .filter(name => /\.(txt|md|csv)$/i.test(name))
    .sort();

  if (!files.length) throw new Error(`No source files found in ${sourceDir}`);

  await pool.query(`CREATE EXTENSION IF NOT EXISTS vector`);

  let indexed = 0;
  for (const file of files) {
    const content = fs.readFileSync(path.join(sourceDir, file), "utf8");
    const sourceUrl = content.match(/^SOURCE_URL:\s*(.+)$/m)?.[1]?.trim() || null;
    const sourceTitle = content.match(/^SOURCE_TITLE:\s*(.+)$/m)?.[1]?.trim() || file;
    const sourceType = content.match(/^SOURCE_TYPE:\s*(.+)$/m)?.[1]?.trim() || "local";
    const verifiedAt = content.match(/^VERIFIED_AT:\s*(.+)$/m)?.[1]?.trim() || null;
    if (sourceUrl && !/^https?:\/\/([a-z0-9-]+\.)?kentainers\.co\.ke(?:\/|$)/i.test(sourceUrl)) {
      throw new Error("Rejected non-official source URL in " + file + ": " + sourceUrl);
    }
    const chunks = chunkText(content);
    if (!chunks.length) continue;

    // Replace only this repository source file's indexed chunks; preserve
    // other PDF/document sources that may already exist in the database.
    await pool.query(`DELETE FROM document_chunks WHERE source_document = $1`, [file]);

    const embeddings = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: chunks
    });

    for (let i = 0; i < chunks.length; i++) {
      const vector = `[${embeddings.data[i].embedding.join(",")}]`;
      await pool.query(
        `INSERT INTO document_chunks (source_document, source_page, chunk_index, content, source_url, source_title, source_type, verified_at, embedding)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::vector)`,
        [file, i + 1, i, chunks[i], sourceUrl, sourceTitle, sourceType, verifiedAt, vector]
      );
      indexed++;
    }

    console.log(`Indexed ${file}: ${chunks.length} chunks`);
  }

  console.log(`Knowledge library indexing complete: ${indexed} chunks`);
  await pool.end();
}

main().catch(async error => {
  console.error(error);
  await pool.end();
  process.exit(1);
});
