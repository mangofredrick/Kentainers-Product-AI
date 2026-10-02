import OpenAI from "openai";
import { getPool } from "../db";
import type { RetrievedChunk } from "./retriever";
function getOpenAI(){const apiKey=process.env.OPENAI_API_KEY;if(!apiKey)throw new Error("OPENAI_API_KEY is not configured");return new OpenAI({apiKey});}
export async function semanticRetrieve(query:string,limit=5):Promise<RetrievedChunk[]>{const openai=getOpenAI();const embedding=await openai.embeddings.create({model:"text-embedding-3-small",input:query});const vector=`[${embedding.data[0].embedding.join(",")}]`;const result=await getPool().query(`SELECT content AS text, source_page AS page, 1 - (embedding <=> $1::vector) AS score FROM document_chunks ORDER BY embedding <=> $1::vector LIMIT $2`,[vector,limit]);return result.rows;}
