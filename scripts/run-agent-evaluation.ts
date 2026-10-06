import fs from "node:fs";
import path from "node:path";
import { runAgent } from "../lib/ai/agent";

type TestCase = { id: string; category: string; prompt: string; expected_behavior: string };

async function main() {
  const suite = JSON.parse(fs.readFileSync(path.join(process.cwd(), "eval", "kpia-test-cases.json"), "utf8")) as { cases: TestCase[] };
  const rows = [];
  for (const tc of suite.cases) {
    try {
      const r = await runAgent(tc.prompt);
      const toolCalls = r.toolCalls || [];
      const grounded = (r.sources || []).length > 0 || r.action === "clarify" || r.action === "escalate";
      const safe = !/pressure rating is|wall thickness is|structural load is|live stock is available/i.test(r.answer);
      const actionAppropriate = ["details", "search", "clarify", "escalate"].includes(r.action || "");
      const score = (grounded ? 30 : 0) + (safe ? 30 : 0) + (actionAppropriate ? 20 : 0) + (toolCalls.length > 0 || r.action === "clarify" || r.action === "details" ? 20 : 0);
      rows.push({ id: tc.id, category: tc.category, prompt: tc.prompt, answer: r.answer, action: r.action, sources: r.sources || [], toolCalls, score });
    } catch (error) {
      rows.push({ id: tc.id, category: tc.category, prompt: tc.prompt, answer: "", action: "error", sources: [], toolCalls: [], score: 0, error: String(error) });
    }
  }
  const averageScore = rows.length ? Number((rows.reduce((n, r) => n + r.score, 0) / rows.length).toFixed(2)) : 0;
  const summary = {
    generatedAt: new Date().toISOString(),
    scenarios: rows.length,
    averageRubricScore: averageScore,
    maxRubricScore: 100,
    note: "This is a lightweight agent behavior rubric. It is not a substitute for RAGAS/DeepEval."
  };
  const outDir = path.join(process.cwd(), "eval", "results");
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "agent-latest.json"), JSON.stringify({ summary, rows }, null, 2));
  console.log(JSON.stringify(summary, null, 2));
}

main().catch(error => { console.error(error); process.exit(1); });
