import fs from "node:fs";
import path from "node:path";
import { runAgent } from "../lib/ai/agent";

type TestCase = { id: string; category: string; prompt: string; expected_behavior: string; expected_answer?: string };

async function main() {
  const suite = JSON.parse(fs.readFileSync(path.join(process.cwd(), "eval", "kpia-test-cases.json"), "utf8")) as { cases: TestCase[] };
  const rows = [];
  const knownTerms = [
    "Kentank","Bunkatank","Loftank","Nestank","KPOT","Pedal Hand Wash","Permawell",
    "BlueFlame","Cattle Trough","Cooler Box","Fish Tank","GranSilo","LifeLine Gutters",
    "Mobilet","Qdesk","TuffBarrier","Traffic Con","Rolling Drum","WonderLoo","EkoSlab",
    "MobiSlab","EkoPlate","SaniSlab","Sliver Can","Tray","Pallet","Bucket","Bins"
  ];
  const anchors = (expected: string) => {
    const found = new Set<string>();
    for (const term of knownTerms) if (expected.toLowerCase().includes(term.toLowerCase())) found.add(term.toLowerCase());
    for (const m of expected.matchAll(/\\b[A-Z]{2,}[A-Z0-9-]*\\d[A-Z0-9-]*\\b/g)) found.add(m[0].toLowerCase());
    for (const m of expected.matchAll(/\\b\\d[\\d,.]*\\s*(?:L|cm|m|t|kg|hours?|years?)\\b/gi)) found.add(m[0].toLowerCase().replace(/\\s+/g, " "));
    return Array.from(found);
  };
  for (const tc of suite.cases) {
    try {
      const r = await runAgent(tc.prompt);
      const toolCalls = r.toolCalls || [];
      const expectedAnchors = anchors(tc.expected_answer || "");
      const lowerAnswer = (r.answer || "").toLowerCase();
      const matchedAnchors = expectedAnchors.filter(a => lowerAnswer.includes(a));
      const answerAlignment = expectedAnchors.length ? Number((matchedAnchors.length / expectedAnchors.length).toFixed(2)) : null;
      const grounded = (r.sources || []).length > 0 || r.action === "clarify" || r.action === "escalate";
      const safe = !/pressure rating is|wall thickness is|structural load is|live stock is available/i.test(r.answer);
      const actionAppropriate = ["details", "search", "clarify", "escalate"].includes(r.action || "");
      const score = (grounded ? 30 : 0) + (safe ? 30 : 0) + (actionAppropriate ? 20 : 0) + (toolCalls.length > 0 || r.action === "clarify" || r.action === "details" ? 20 : 0);
      rows.push({ id: tc.id, category: tc.category, prompt: tc.prompt, expected_answer: tc.expected_answer || "", expectedAnchors, matchedAnchors, answerAlignment, answer: r.answer, action: r.action, sources: r.sources || [], toolCalls, score });
    } catch (error) {
      rows.push({ id: tc.id, category: tc.category, prompt: tc.prompt, expected_answer: tc.expected_answer || "", expectedAnchors: [], matchedAnchors: [], answerAlignment: 0, answer: "", action: "error", sources: [], toolCalls: [], score: 0, error: String(error) });
    }
  }
  const averageScore = rows.length ? Number((rows.reduce((n, r) => n + r.score, 0) / rows.length).toFixed(2)) : 0;
  const alignments = rows.map((r: any) => r.answerAlignment).filter((v: any) => typeof v === "number");
  const averageAnswerAlignment = alignments.length ? Number((alignments.reduce((n: number, v: number) => n + v, 0) / alignments.length).toFixed(2)) : null;
  const summary = {
    generatedAt: new Date().toISOString(),
    scenarios: rows.length,
    averageRubricScore: averageScore,
    maxRubricScore: 100,
    averageAnswerAlignment,
    answerAlignmentMethod: "Checks product names, product codes and explicit numeric/specification anchors from expected_answer; it is a lightweight diagnostic, not semantic grading.",
    note: "This is a lightweight agent behavior rubric. It is not a substitute for RAGAS/DeepEval."
  };
  const outDir = path.join(process.cwd(), "eval", "results");
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "agent-latest.json"), JSON.stringify({ summary, rows }, null, 2));
  console.log(JSON.stringify(summary, null, 2));
}

main().catch(error => { console.error(error); process.exit(1); });
