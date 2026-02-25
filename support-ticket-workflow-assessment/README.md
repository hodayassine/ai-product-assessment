# Support Ticket AI Workflow

An AI-powered workflow that **classifies** support tickets, **extracts** structured fields, **drafts** replies, and **routes** to the right team—with deduplication and human-in-the-loop actions.

## Features

- **Classification** — Category (Billing, Technical, Account, Refund, Feature Request, Other) and severity (Low → Critical) via LLM with structured output
- **Field extraction** — Customer email, order ID, summary, and more from free-text tickets
- **Reply draft** — Short, context-aware reply (3–5 sentences) with guardrails; editable before sending
- **Routing** — Rule-based (category + severity) → team; config-driven, no LLM
- **Deduplication** — Signature-based duplicate detection; “Possible duplicate of #TKT-…” in the UI
- **Assign & feedback** — Record assignment to team; optional “Was this helpful?” for tuning

## Tech Stack

- **Next.js 16** (App Router), **React 19**, **TypeScript**
- **Tailwind CSS** for UI
- **Zod** for request validation on API routes
- **Groq** (Llama) as default LLM—free tier, OpenAI-compatible API
- **Vitest** for unit tests (routing, deduplication)
- In-memory deduplication store (replace with DB for production)

## Quick Start

```bash
# Install
npm install

# Configure (required for Process)
cp .env.example .env
# Edit .env: set LLM_API_KEY (get one at https://console.groq.com)

# Run
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), paste a ticket, and click **Process ticket**.

## Environment Variables

| Variable       | Description                    | Example  |
|----------------|--------------------------------|----------|
| `LLM_PROVIDER` | Provider: `groq` or `gemini`   | `groq`   |
| `LLM_API_KEY`  | API key for the chosen provider| (from Groq / Google AI Studio) |

See `.env.example`.

## API Overview

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST   | `/api/tickets/process` | Full pipeline: classify, extract, draft, route, dedup. Body: `{ "ticketText": "..." }`. |
| POST   | `/api/tickets/classify` | Classification only. Body: `{ "text": "..." }`. |
| POST   | `/api/tickets/extract`  | Extraction only. Body: `{ "text": "..." }`. |
| POST   | `/api/tickets/analyze`  | Classify + extract in one call. Body: `{ "text": "..." }`. |
| POST   | `/api/tickets/draft`    | Draft only. Body: `{ "text", "category", "severity", "extractedFields"? }`. |
| POST   | `/api/tickets/route`    | Routing only. Body: `{ "category", "severity" }`. |
| POST   | `/api/tickets/assign`   | Record assignment. Body: `{ "draft", "teamId", "teamName?", "ticketId"? }`. |
| POST   | `/api/tickets/feedback` | Submit feedback. Body: `{ "ticketId?", "classificationCorrect?", "draftHelpful?", "comment?" }`. |

## Project Structure

```
src/
├── app/
│   ├── api/tickets/     # API routes (process, classify, extract, draft, route, assign, feedback)
│   ├── page.tsx        # Main UI: paste ticket, process, edit draft, assign, feedback
│   ├── layout.tsx
│   └── globals.css
├── config/             # Categories, severities, routing table (edit without touching pipeline)
├── lib/                # Pipeline logic: llm, classify, extract, draft, analyze, process, dedupe
└── types/              # Ticket types and API payloads
```

Configuration (categories, severities, routing table) lives in `src/config/` so product can change behavior without changing pipeline code.

## Testing

```bash
npm test
```

Runs unit tests for routing and deduplication (Vitest). Extend with API and E2E tests as needed.

## Design Decisions

- **Routing is rule-based** — Deterministic (category, severity) → team for explainability and stability; no LLM for routing.
- **Deduplication by ticket text only** — Signature from normalized ticket body so the same paste is always detected; extracted fields are not used (LLM output varies).
- **Human in the loop** — Draft is editable; “Assign” records the decision; no auto-send to customers.
- **Structured LLM output** — JSON mode for classify and extract to avoid free-text parsing.
- **In-memory store for dedup** — Simple for demo; replace with Redis or DB for production.

## Possible Improvements

- **Persistence** — Store tickets and assignments in a DB; persist deduplication store.
- **Soft deduplication** — Embeddings + similarity search for “same issue, different wording”.
- **Rate limiting** — Per-IP or per-key limits on `/api/tickets/process`.
- **Audit log** — Full request/response (or hashes) for compliance.
- **Gemini provider** — Implement `LLM_PROVIDER=gemini` in `lib/llm.ts` for an alternative backend.

## Approach Document

See [AI_WORKFLOW_APPROACH.md](./AI_WORKFLOW_APPROACH.md) for the step-by-step approach, prompts, and implementation order.
