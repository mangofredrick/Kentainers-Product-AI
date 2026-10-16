# KPIA Final Submission Checklist

## Available
- [x] GitHub repository: https://github.com/mangofredrick/Kentainers-Product-AI
- [x] Application source and README
- [x] `.env.example` with no real secrets
- [x] Evaluation assets and test bank (per repository documentation)
- [x] Capstone report, architecture overview, demo script, and checklist

## Must be verified before final submission
- [ ] Current public application URL opens and core flow is tested: https://chatbot.kentainers.co.ke/
- [ ] Run `npm install`
- [ ] Run `npm run build` and retain output
- [ ] Run `npm run ingest:pgvector`
- [ ] Run `npm run eval:baseline` and retain output
- [ ] Run `npm run eval:agent` and retain output
- [ ] Test 2–3 prompt variants on the same inputs and record actual results
- [ ] Show a measured baseline-to-improved result
- [ ] Capture one real failure trace, root cause, fix, and before/after regression proof
- [ ] Test malformed input, missing knowledge, and tool/retrieval failure
- [ ] Capture screenshots/logs for the core workflow and guardrail
- [ ] Record a demo video of no more than five minutes
- [ ] Confirm final URL and deployment status
- [ ] Submit repository, working URL, demo video/link, and ZIP if required by the LMS

## Evidence integrity
Do not invent accuracy, RAGAS/DeepEval, latency, cost, or improvement metrics. Do not claim the current deployment is live solely because a historical deployment was Ready. Do not assert a failure root cause without an actual trace.
