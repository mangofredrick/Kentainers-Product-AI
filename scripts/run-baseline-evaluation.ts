import fs from "node:fs";
import path from "node:path";
import { runAgent } from "../lib/ai/agent";

type TestCase = { id: string; category: string; prompt: string; expected_behavior: string };
type Result = TestCase & { answer: string; action?: string; sources: unknown[]; toolCalls: unknown[]; pass: boolean; notes: string[] };

function evaluate(tc: TestCase, answer: string, action: string | undefined, sources: unknown[]): {pass:boolean;notes:string[]} {
  const a = answer.toLowerCase();
  const notes: string[] = [];
  const hasEvidence = sources.length > 0;
  let pass = hasEvidence || action === "clarify" || action === "escalate";

  if (tc.category === "clarification") pass = pass && action === "clarify";
  if (tc.id === "KPIA-002") pass = pass && a.includes("ccv 600");
  if (tc.id === "KPIA-003") pass = pass && a.includes("ccv 500 short") && a.includes("ccv 500");
  if (tc.id === "KPIA-004") pass = pass && a.includes("ccv 800");
  if (tc.id === "KPIA-008") pass = pass && a.includes("15 april 2026") && a.includes("nairobi");
  if (tc.id === "KPIA-009") pass = pass && (a.includes("15 april 2026") || action === "clarify");
  if (tc.id === "KPIA-010" || tc.id === "KPIA-030") pass = pass && a.includes("warranty") && (a.includes("not") || a.includes("different"));
  if (tc.id === "KPIA-018") pass = pass && (a.includes("not") || a.includes("does not") || a.includes("cannot"));
  if (tc.id === "KPIA-027") pass = pass && !/available today|in stock today|stock is available/.test(a);

  if (!hasEvidence && action !== "clarify" && action !== "escalate") notes.push("No source evidence returned.");
  if (!pass) notes.push("Behavioral expectation not matched by the lightweight regression checks.");
  return { pass, notes };
}

async function main() {
  const file = path.join(process.cwd(), "eval", "kpia-test-cases.json");
  const suite = JSON.parse(fs.readFileSync(file, "utf8")) as { cases: TestCase[] };
  const results: Result[] = [];
  for (const tc of suite.cases) {
    try {
      const r = await runAgent(tc.prompt);
      const check = evaluate(tc, r.answer, r.action, r.sources || []);
      results.push({ ...tc, answer: r.answer, action: r.action, sources: r.sources || [], toolCalls: r.toolCalls || [], pass: check.pass, notes: check.notes });
    } catch (error) {
      results.push({ ...tc, answer: "", sources: [], toolCalls: [], pass: false, notes: [String(error)] });
    }
  }
  const passed = results.filter(r => r.pass).length;
  const summary = {
    generatedAt: new Date().toISOString(),
    suite: suite.cases.length,
    passed,
    failed: suite.cases.length - passed,
    behavioralPassRate: suite.cases.length ? Number((passed / suite.cases.length).toFixed(4)) : 0,
    note: "This is a lightweight behavioral regression runner, not a RAGAS/DeepEval score."
  };
  const outDir = path.join(process.cwd(), "eval", "results");
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "baseline-latest.json"), JSON.stringify({ summary, results }, null, 2));
  console.log(JSON.stringify(summary, null, 2));
}

main().catch(error => { console.error(error); process.exit(1); });
