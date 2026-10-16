# KPIA Architecture

```mermaid
flowchart TD
    U[Sales representative / user] --> UI[Next.js / React chat UI]
    UI --> A[LLM agent orchestrator]
    A --> T[Structured product tools]
    A --> R[RAG retriever]
    T --> C[Structured Kentainers catalogue]
    R --> K[Approved product documents / indexed chunks]
    C --> A
    K --> A
    A --> G[Grounded answer, clarification, or escalation]
    G --> UI
    UI --> E[Customer enquiry persistence / follow-up]
```

## Design boundaries
- Ground product facts in approved evidence.
- Clarify ambiguous customer requirements.
- Escalate when evidence is missing or conflicting.
- Do not invent current prices, stock, delivery dates, warranty, certification, compatibility, or technical specifications.
- Keep secrets in server-side environment variables.
- Decision support only; no autonomous irreversible transactions.
