# KPIA Five-Minute Demo Script

**Repository:** https://github.com/mangofredrick/Kentainers-Product-AI  
**Application URL to verify before recording:** https://chatbot.kentainers.co.ke/

Only show and describe results actually observed in the live application.

- **0:00–0:35 — Problem:** Explain that sales staff need quick, reliable product information and customer requirements are often incomplete.
- **0:35–1:15 — Solution:** Show the chat UI and explain the LLM agent, structured product tools, RAG retrieval, clarification, and escalation.
- **1:15–1:50 — Architecture:** Show user → web UI → agent → product tools/RAG → approved Kentainers knowledge → grounded answer.
- **1:50–2:45 — Core scenario:** Ask: “I need a 6,000 litre water storage tank for a farm. What Kentainers product should I consider?” Respond to any clarification naturally. Show source evidence if available.
- **2:45–3:20 — Follow-up:** Ask: “Compare that with the 5,000 litre option.” Describe the actual observed result.
- **3:20–4:00 — Guardrail/failure:** Ask for an unsupported fact, such as a warranty detail not in the evidence. Show whether the app safely acknowledges missing information or escalates. Demonstrate a graceful failure only if reproducible.
- **4:00–4:35 — Evaluation:** Show the test bank and runner files. Report only metrics from actual execution; call pending values pending.
- **4:35–5:00 — Close:** Show the verified app URL and repository, plus one limitation and next step.
