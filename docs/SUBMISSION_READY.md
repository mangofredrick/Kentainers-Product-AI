# Kentainers Product AI — Submission-Ready Package

## Project
**Kentainers Product Intelligence Agent (KPIA)**

KPIA is a grounded product-selection assistant for Kentainers sales representatives. It uses the Kentainers product knowledge base to support product discovery, clarification, comparison and customer enquiries.

## Core workflow

Customer details → Product requirement → KPIA clarification/retrieval → Grounded product response → Sources → Enquiry record → Enquiry ID → Follow-up

## Customer enquiry data

The application is designed to capture:

- Customer name
- Customer email
- Customer phone number
- Customer question/requirement
- KPIA response
- Action/outcome
- Retrieved products
- Source references
- Enquiry status
- Date/time
- Enquiry ID

## Evaluation coverage

The project includes an expanded product-intelligence evaluation suite covering:

1. Product identification
2. Product specifications
3. Product comparisons
4. Product applications
5. Customer-requirement clarification
6. Pedal Hand Wash
7. Permawell
8. Multi-document retrieval
9. Grounding and hallucination resistance
10. Sales-conversation scenarios

The evaluation suite contains more than 100 candidate questions plus focused regression/demo cases.

## Representative live test cases

### Test A — Specific requirement
`I need a 6,000 litre water storage tank for a farm. What Kentainers product would you recommend?`

### Test B — Comparison
`Compare it with the 5,000 litre option.`

### Test C — Clarification
`What other information do you need from me before I place the enquiry?`

### Test D — Ambiguous requirement
`I need a 6,000 litre tank.`

Expected behavior: KPIA should request the intended application when the available catalogue contains multiple potentially relevant choices.

### Test E — Unsupported fact
`What is the warranty period for the 6,000 litre tank?`

Expected behavior: KPIA should not invent a warranty period if the knowledge base does not provide one.

## Deployment evidence

The supplied Vercel deployment screenshot confirms that the latest `main` deployment shown in the user's Vercel project is **Ready** in the **Production** environment.

The repository is connected to Vercel and deployments are triggered from `main`.

## Important evidence policy

Only results actually observed during live testing should be entered into the final evaluation-results table. This repository deliberately does not fabricate accuracy percentages or successful answers that have not been observed.

## Submission links

- GitHub repository: https://github.com/mangofredrick/Kentainers-Product-AI
- Production application: https://kentainers-product-ai-3kxb-git-main-mango-1d26.vercel.app/

## Suggested final demonstration

1. Open the production application.
2. Enter customer name, email and phone.
3. Ask Test A.
4. Ask Test B.
5. Ask Test C.
6. Confirm that the enquiry is saved and an enquiry ID is shown.
7. Capture screenshots of the customer details, response, source/grounding information and saved enquiry.
8. Add those observations to `docs/FINAL_EVALUATION_RESULTS.md` before submission.
