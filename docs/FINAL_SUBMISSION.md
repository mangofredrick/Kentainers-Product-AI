# Kentainers Product AI — Final Submission Package

## 1. Project identity

**Project:** Kentainers Product Intelligence Agent (KPIA)

**Repository:** https://github.com/mangofredrick/Kentainers-Product-AI

**Production URL:** https://kentainers-product-ai-3kxb-git-main-mango-1d26.vercel.app/

**Default branch:** `main`

## 2. Project purpose

KPIA is an agentic RAG-based product-information assistant for Kentainers sales and product-information users. It uses approved catalogue/document evidence, semantic retrieval and structured product tools to answer product questions, clarify ambiguous requests and avoid unsupported claims.

## 3. Core functionality

- Catalogue-grounded product information
- PostgreSQL/pgvector retrieval path
- Structured product search and product-detail tools
- Agent/tool calling
- Clarification of ambiguous product requirements
- Guardrails against unsupported price, stock, certification, compatibility and specification claims
- Multi-document evaluation capability
- Evaluation assets for RAG, retrieval and agent/tool scenarios

## 4. Evaluation package

The repository includes:

- `docs/KPIA_TEST_BANK.md` — expanded 110-question product intelligence test bank
- `eval/kpia-test-cases.json` — focused regression/demo cases
- Product catalogue evaluation/golden-question assets already present in the repository
- Agent/tool evaluation scenarios

The test bank covers:

1. Product identification
2. Product specifications
3. Product comparison
4. Application-based questions
5. Customer-requirement clarification
6. Pedal Hand Wash
7. Permawell
8. Multi-document retrieval
9. Unsupported-information handling
10. Hallucination/grounding resistance
11. Sales-assistant scenarios

## 5. Deployment evidence

The production deployment was observed in Vercel with status **Ready / Production** after resolving the build failures involving the missing `@/lib/ai/agent` source path and the missing TypeScript declaration for `pg`.

The live application UI was subsequently opened and successfully rendered the **Kentainers Product Intelligence Agent** interface.

## 6. Functional test observations

The deployed interface accepts user questions and returns agent responses. An ambiguity test using `6000 litres tank` produced a clarification request asking whether the intended application was water storage, sanitation/septic use, or another purpose. This demonstrates the intended clarification behavior.

During live testing, requests such as `5000 litres tank` and `6000 litres` also produced an `unable to process` response. This indicates that the production frontend/deployment is working but that the live retrieval/runtime path requires final runtime verification before claiming complete functional coverage.

**No runtime accuracy score is fabricated in this submission.** The repository's evaluation assets are provided so the remaining runtime tests can be executed against the configured production database/API environment.

## 7. Local execution

Required environment variables:

```text
OPENAI_API_KEY=...
DATABASE_URL=...
```

Recommended execution sequence:

```bash
npm install
npm run build
npm run ingest:pgvector
npm run eval:baseline
npm run eval:agent
```

## 8. Submission checklist

- [x] Source repository available on GitHub
- [x] Main branch contains the application source
- [x] Evaluation test bank included
- [x] Regression/demo cases included
- [x] Production deployment created
- [x] Production deployment reached Ready / Production status (latest verified commit: `1a39e5b`)
- [x] Live UI opened successfully
- [ ] Full runtime/RAG evaluation completed with recorded metrics
- [ ] Final screenshots/evidence package attached where required by the facilitator

## 9. Submission links

- GitHub: https://github.com/mangofredrick/Kentainers-Product-AI
- Live application: https://kentainers-product-ai-3kxb-git-main-mango-1d26.vercel.app/
- Test bank: `docs/KPIA_TEST_BANK.md`
- Regression cases: `eval/kpia-test-cases.json`


## 10. Evaluation runner status

The repository now includes executable evaluation runners referenced by package.json:

- scripts/run-baseline-evaluation.ts — executes the focused regression suite and writes eval/results/baseline-latest.json.
- scripts/run-agent-evaluation.ts — executes the same scenarios using a lightweight 100-point agent-behaviour rubric and writes eval/results/agent-latest.json.

These runners deliberately do not fabricate RAGAS/DeepEval metrics. They provide reproducible behavioural regression evidence; formal RAGAS/DeepEval measurements still require execution in the configured runtime environment.

The current focused regression file contains 30 cases. The repository documentation also references the separate 110-question product intelligence test bank.

## 11. Final deployment status

The latest production source commit is `1a39e5b` (`refine customer-facing fallback wording`). Vercel shows this commit as **Ready / Production** on the `main` branch.

The current production source therefore includes:
- strengthened 5,000 L and 6,000 L tank enquiry handling;
- restored baseline and agent evaluation runners;
- updated final-submission documentation; and
- refined customer-facing fallback wording.

Live runtime accuracy and formal RAGAS/DeepEval scores are intentionally not claimed until the evaluation runners have actually executed against the configured production database/API environment.
