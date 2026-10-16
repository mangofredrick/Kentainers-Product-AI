# KPIA Capstone Evidence Register — 16 October 2026

## Scope and evidence integrity

This register distinguishes source/repository evidence from runtime evidence. A deployment status or a source file is not proof that an end-to-end workflow passed. Do not report invented accuracy, latency, cost, or improvement figures.

## Verified repository evidence

- Repository: https://github.com/mangofredrick/Kentainers-Product-AI
- Branch evaluated for this register: `main`; proposed hardening branch: `capstone/evidence-hardening-2026-10-16`.
- The `package.json` declares scripts for `build`, `ingest:pgvector`, `ingest:library`, `verify:knowledge`, `eval:baseline`, `eval:agent`, and `validate:catalogue`.
- `eval/kpia-test-cases.json` parses as JSON and contains **280 regression cases** (version 3.5).
- `docs/KPIA_TEST_BANK.md` is documented by the repository as the 110-question product-intelligence bank.
- `.env.example` names the required runtime variables: `OPENAI_API_KEY`, `DATABASE_URL`, `RESEND_API_KEY`, `KPIA_FROM_EMAIL`, and `RESEND_WEBHOOK_SECRET`.
- The repository README documents the inbound Resend webhook endpoint as `POST /api/webhooks/resend` and requires production environment variables plus an inbound `email.received` webhook configuration.

## Deployment status evidence

At 2026-10-16 09:19 UTC, GitHub's combined status for commit `9e96a240571c7c678179754eee0f50a5fbb3f99b` was `success`, with two Vercel status contexts reporting “Deployment has completed.” This confirms deployment completion for that commit; it does **not** prove the current public URL is reachable or that chat, retrieval, email processing, or database persistence works end to end.

The live URL could not be independently loaded from the current verification environment. Record a fresh browser test and screenshot before claiming current production functionality.

GitHub Actions API returned zero workflow runs at the time checked. Therefore, no GitHub Actions build/test result is claimed here.

## Source-level defects identified and proposed corrections

1. **Agent evaluation anchor extraction:** the existing evaluation script used double-escaped regex metacharacters in regex literals (for example, `\\b`), causing product/code/unit anchor extraction to match literal backslash sequences rather than word boundaries/digits/whitespace. The proposed branch changes these to normal regex metacharacters. This is a source review finding; it still requires running the evaluator and checking representative expected anchors.
2. **Inbound email duplicate handling:** the webhook's conflict update allowed an event in `processing` state to be reclaimed by another delivery while the first delivery was still active. The proposed branch permits reclaim only when the stored state is `failed`, while the unique email ID prevents duplicate work for events already `processing` or `processed`. This needs a concurrency/retry test with a configured database.

These are proposed changes on the hardening branch, not yet production fixes. Do not describe them as deployed until merged and redeployed.

## Runtime execution results

| Check | Status | Required evidence |
|---|---|---|
| JSON regression suite parse | Passed in source inspection | 280 cases parsed from the repository file |
| Current production URL reachable | Not verified | Browser screenshot + date/time |
| `npm install` / `npm ci` | Pending | Full terminal output |
| `npm run build` | Pending | Successful build log |
| `npm run validate:catalogue` | Pending | Output showing product count and schema |
| `npm run verify:knowledge` | Pending | Output showing source count and zero failures |
| `npm run ingest:pgvector` | Pending | Ingestion summary and DB confirmation |
| `npm run eval:baseline` | Pending | `eval/results/baseline-latest.json` |
| `npm run eval:agent` | Pending | `eval/results/agent-latest.json` |
| Prompt variants (2–3) | Pending | Same input set, prompt IDs, results and selection rationale |
| Before/after improvement | Pending | Baseline and post-change outputs, comparable metrics |
| Traced failure + regression | Pending | Real trace, root cause, fix commit and passing rerun |
| Website email capture | Not production-verified | Resend delivery/webhook logs and saved enquiry ID |
| Verified auto-reply | Not production-verified | Source evidence + sent-message log |
| Uncertain-query escalation | Not production-verified | Escalation email/log; no customer auto-reply |
| Duplicate webhook handling | Pending | Same event delivered twice; one enquiry/reply |
| Five-minute demo video | Not recorded | Final video file/link and duration |
| LMS submission | Not performed | Submission confirmation from course LMS |

## Commands to run in the configured project environment

Use the repository's Node.js/npm environment and set secrets only in local environment variables or deployment secret settings. Do not paste API keys into the report or commit them.

```bash
npm ci
npm run build
npm run validate:catalogue
npm run verify:knowledge
npm run ingest:pgvector
npm run eval:baseline
npm run eval:agent
```

Save the complete console output and generated JSON under `eval/results/`. Run baseline and post-improvement evaluations on the same fixed test set. If an evaluation runner or the application fails, preserve the error and trace before changing code.

## Minimum acceptance criteria before final submission

- Build exits successfully.
- Catalogue and source verification exit successfully.
- RAG ingestion completes against the intended database.
- Baseline and agent evaluation JSON files are generated with real timestamps and outputs.
- Prompt variants are compared on the same inputs.
- One reproducible failure is corrected and the same regression case passes afterward.
- Current public URL is opened and the core workflow is tested.
- Email webhook verifies signatures, persists one enquiry, replies only to source-grounded answers, escalates uncertain cases, and safely handles duplicate/retry events.
- Demo video is recorded and reviewed; submit through the LMS only after collecting the required evidence.

**Current conclusion:** the repository and deployment status provide meaningful implementation evidence, but runtime evaluation, current live workflow verification, production email configuration, failure regression proof, and the demo video remain outstanding. This is an evidence register, not a claim that all capstone requirements have passed.
