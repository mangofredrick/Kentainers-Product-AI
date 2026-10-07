# Kentainers Product AI — Final Submission Package

## 1. Project identity

**Project:** Kentainers Product Intelligence Agent (KPIA)

**Repository:** https://github.com/mangofredrick/Kentainers-Product-AI

**Historical deployment URL:** https://kentainers-product-ai-3kxb-git-main-mango-1d26.vercel.app/

**Default branch:** `main`

## 2. Project purpose

KPIA is an agentic RAG-based product-information assistant for Kentainers sales and product-information users. It uses approved catalogue/document evidence, semantic retrieval and structured product tools to answer product questions, clarify ambiguous requests and avoid unsupported claims.

## 3. Core functionality

- Catalogue-grounded product information
- Expanded structured product catalogue covering the newly supplied Kentainers product PDFs
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

## 5. Historical deployment evidence

A prior Vercel deployment was observed with status **Ready / Production** after resolving build failures involving the missing `@/lib/ai/agent` source path and the missing TypeScript declaration for `pg`. This is historical deployment evidence; the current `main` branch has not been independently verified live from this environment.

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
- [x] Historical production deployment created
- [x] Historical deployment reached Ready / Production status
- [ ] Current `main` deployment independently verified as live
- [x] Live UI opened successfully
- [ ] Full runtime/RAG evaluation completed with recorded metrics
- [ ] Final screenshots/evidence package attached where required by the facilitator

## 9. Submission links

- GitHub: https://github.com/mangofredrick/Kentainers-Product-AI
- Historical live application URL: https://kentainers-product-ai-3kxb-git-main-mango-1d26.vercel.app/
- Test bank: `docs/KPIA_TEST_BANK.md`
- Regression cases: `eval/kpia-test-cases.json`


## 10. Evaluation runner and catalogue validation status

The repository now includes executable evaluation runners referenced by package.json:

- scripts/run-baseline-evaluation.ts — executes the focused regression suite and writes eval/results/baseline-latest.json.
- scripts/run-agent-evaluation.ts — executes the same scenarios using a lightweight 100-point agent-behaviour rubric and writes eval/results/agent-latest.json.

These runners deliberately do not fabricate RAGAS/DeepEval metrics. They provide reproducible behavioural regression evidence; formal RAGAS/DeepEval measurements still require execution in the configured runtime environment. A static product-catalogue validator is also available as `npm run validate:catalogue` to check required fields, duplicate IDs/codes, numeric capacities and source references.

The current focused regression file contains 141 customer-facing cases. The repository also contains the broader product intelligence test bank.

## 11. Final deployment status

The latest source commits on `main` strengthen conversation continuity, grounded generation, customer-contact capture and unresolved-enquiry handling. The current evaluation suite has also been expanded with regression cases for follow-up context and contact capture.

The current source therefore includes:
- strengthened 5,000 L and 6,000 L tank enquiry handling;
- broader application clarification options, including home/domestic, agriculture, commercial, water storage and sanitation/septic use;
- official price-list pricing for supported products and zonal delivery handling;
- customer-enquiry follow-up when a requested price is not available in the verified price list;
- chatbot question memory and verified-answer feedback into retrieval;
- conversation history passed through the chat route and grounded generation prompt;
- customer contact capture for unresolved enquiries, requiring name plus email or phone;
- regression coverage for conversation continuity and contact capture; and
- updated customer-facing wording.

The latest commits have been pushed to `main`. Vercel deployment status for the latest source has not been independently verified in this environment, so this submission does not claim that the newest commits are currently live in production.

Live runtime accuracy and formal RAGAS/DeepEval scores are intentionally not claimed until the evaluation runners have actually executed against the configured production database/API environment.

Current focused regression file: `eval/kpia-test-cases.json` contains 141 customer-facing cases, including the expanded brochure products and cross-product recommendation, clarification, grounding, technical installation and conversation-continuity scenarios. Formal RAGAS/DeepEval scores are intentionally not claimed until the evaluation runners have actually executed against the configured production database/API environment.

## 12. Product-source expansion — 6 October 2026

The product knowledge base was expanded from the newly supplied official Kentainers PDFs for Water Tanks, Bunkatank, Loftank, Nestank, KPOT, Drum, Pedal Hand Wash and Permawell. The structured catalogue and RAG source library now include the product facts extracted from these documents. Missing values such as dimensions for the Pedal Hand Wash PDF are left unspecified rather than inferred.


## 13. Product-source expansion — 7 October 2026

The customer Q&A regression suite has been expanded to cover the additional product brochures supplied on 7 October 2026. Coverage now includes Bins, BlueFlame BioslurriGaz Biodigester, Buckets, Cattle Troughs, Cooler Boxes, Fish Tank, Flower Buckets, LifeLine Gutters, Hand Hole, Mobilet, DuraPall Pallets, Qdesk, TuffBarrier, Traffic Con and Rolling Drum, in addition to the earlier water-storage and sanitation products.

The consolidated source is stored at:
- `data/source/Kentainers_Updated_Product_Brochures_2026-10-07.md`

Customer-facing regression coverage is stored at:
- `eval/kpia-test-cases.json`

The suite deliberately separates questions by customer need. For example, traffic-control requirements and construction-site water-storage requirements are tested as separate questions rather than being combined into one multi-product prompt.

Source conflicts are not silently reconciled. Where website and brochure evidence differ, the agent should identify the source context and avoid presenting conflicting values as a single verified fact.


## 14. Customer conversation and sales Q&A expansion — 7 October 2026

The focused regression suite now contains 141 customer-facing scenarios. The additional cases test natural sales conversations rather than catalogue-only lookups, including product introductions, product-specific follow-up questions, newly added Qdesk, Rolling Drum, Sliver Can, tray, sanitation slab and WonderLoo scenarios, purchase enquiries, quotation information, application clarification, product comparisons and quantity-selection questions.

The agent prompt also explicitly requires:
- accepting a customer's selected product rather than asking them to choose again;
- treating the customer's stated use as conversation context rather than limiting the product to that use;
- naturally mentioning other known product uses where helpful;
- avoiding internal references to PDFs, RAG, retrieval or knowledge-library mechanics;
- avoiding catalogue-style phrases such as "relevant product" and "based on the available catalogue";
- asking only the next useful sales question; and
- keeping product-specific conversations focused on the named product.
