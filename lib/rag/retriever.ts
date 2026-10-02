import fs from "node:fs";
import path from "node:path";
import { semanticRetrieve } from "./vector";
export type RetrievedChunk={text:string;page?:number;score?:number};
function localKeywordRetrieve(query:string,limit=5):RetrievedChunk[]{const file=path.join(process.cwd(),"data","source","Kentainers_Product_Catalogue.txt");const pages=fs.readFileSync(file,"utf8").split("\f");const terms=query.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);return pages.map((text,i)=>{const low=text.toLowerCase();const score=terms.reduce((n,t)=>n+(low.includes(t)?1:0),0);return{text,page:i+1,score};}).filter(x=>(x.score??0)>0).sort((a,b)=>(b.score??0)-(a.score??0)).slice(0,limit);}
export async function retrieveCatalogue(query:string):Promise<RetrievedChunk[]>{if(process.env.DATABASE_URL&&process.env.OPENAI_API_KEY){try{return await semanticRetrieve(query);}catch(error){console.error("Semantic retrieval failed; using local fallback.",error);}}return localKeywordRetrieve(query);}
