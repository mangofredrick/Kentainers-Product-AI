# KPIA Final Evaluation Results

## Purpose

This document is the final evidence table for the Kentainers Product Intelligence Agent. It is intentionally structured so that observed application behavior can be recorded without inventing results.

## Test environment

- Application: Kentainers Product Intelligence Agent (KPIA)
- Branch: `main`
- Deployment platform: Vercel
- Production URL: https://kentainers-product-ai-3kxb-git-main-mango-1d26.vercel.app/
- Repository: https://github.com/mangofredrick/Kentainers-Product-AI

## Deployment verification

| Check | Evidence | Status |
|---|---|---|
| Latest deployment shown in supplied Vercel screenshot | Vercel deployment page | Verified Ready/Production |
| `main` branch deployment | Vercel deployment page | Verified |
| Customer enquiry schema deployment | Vercel deployment page | Verified Ready/Production |
| Customer enquiry persistence deployment | Vercel deployment page | Verified Ready/Production |
| 30 starter questions deployment | Vercel deployment page | Verified Ready/Production |

## Live functional tests

The following rows should be completed from the actual production application. Do not replace `Pending live observation` with a pass unless the behavior is observed.

| ID | Test | Expected behavior | Observed result | Status |
|---|---|---|---|---|
| T01 | Enter customer name, email and phone | Details accepted and associated with enquiry | Pending live observation | Pending |
| T02 | Ask for a 6,000-litre farm water-storage tank | Retrieve relevant catalogue information and provide grounded response | Pending live observation | Pending |
| T03 | Compare 6,000-litre and 5,000-litre options | Distinguish product capacities/specifications | Pending live observation | Pending |
| T04 | Ask what additional customer information is needed | Ask useful clarification questions | Pending live observation | Pending |
| T05 | Ask `I need a 6,000 litre tank` | Clarify intended application if necessary | Pending live observation | Pending |
| T06 | Ask about Permawell for a shallow well | Retrieve Permawell information from knowledge base | Pending live observation | Pending |
| T07 | Ask about hand washing at a school | Retrieve relevant Pedal Hand Wash information | Pending live observation | Pending |
| T08 | Ask for an unavailable warranty fact | Avoid inventing unsupported information | Pending live observation | Pending |
| T09 | Save enquiry | Create enquiry record and display/return enquiry ID if implemented in deployed build | Pending live observation | Pending |
| T10 | Start a new enquiry | Clear prior customer/enquiry context without corrupting previous record | Pending live observation | Pending |

## Evaluation interpretation

A test should be marked **Pass** only when the expected behavior is observed in the deployed application. If a test returns an application error, mark it **Fail** and record the error. If it has not yet been run, keep it **Pending**.

## Recommended evidence screenshots

Capture:

1. Customer details form.
2. Product question and KPIA response.
3. Retrieved/source evidence, where displayed.
4. Clarification response.
5. Saved enquiry confirmation/enquiry ID.
6. Vercel Production deployment showing Ready status.
7. GitHub repository showing the final documentation and evaluation assets.

## Final submission note

This evaluation document distinguishes deployment verification from live functional verification. This prevents unsupported claims about RAG accuracy or database persistence and keeps the final submission evidence-based.
