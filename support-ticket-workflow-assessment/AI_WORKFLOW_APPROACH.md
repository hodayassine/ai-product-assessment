# AI Support Ticket Workflow — Approach

## Problem Statement

Support tickets arrive with **inconsistent quality** and **duplication**. We need an AI workflow that:

1. **Classifies** the ticket (category + severity)
2. **Extracts** required fields
3. **Proposes** a response draft
4. **Routes** to the right team

---

## High-Level Approach

Treat this as a **pipeline**: each ticket passes through stages in order. Use **one or more LLM calls** per stage, with **structured outputs** and **routing rules** so the system is predictable and debuggable.

```
Ticket (raw) → Classify → Extract → Draft → Route → Output
```

---

## 1. Classify (Category + Severity)

**Goal:** Normalize how we label tickets so routing and prioritization are consistent.

**Approach:**

- **Single LLM call** with a strict schema (e.g. JSON).
- **Prompt:** “Given this support ticket, return only: category (from list X) and severity (from list Y).”
- **Category:** Predefined list (e.g. Billing, Technical, Account, Refund, Feature Request, Other). Few-shot examples in the prompt improve consistency.
- **Severity:** Predefined scale (e.g. Low, Medium, High, Critical) with clear criteria (e.g. “Critical = outage / data loss / security”).

**Implementation notes:**

- Use **structured output** (JSON mode / function calling / response format) so you never have to parse free text.
- If the model is uncertain, define a fallback (e.g. “Unclassified” or “Medium”) and optionally flag for human review.

---

## 2. Extract Required Fields

**Goal:** Pull out a fixed set of fields from messy, inconsistent ticket text.

**Approach:**

- **Single LLM call** (can be combined with classification in one “analyze” step to save latency/cost).
- **Schema:** Define exactly which fields you need, e.g.:
  - Customer ID / email
  - Order ID / transaction ID
  - Product or feature name
  - Short summary (1–2 sentences)
  - Affected component or error message (if technical)
- **Prompt:** “From this ticket, extract the following fields. If a value is not present, use null.”

**Implementation notes:**

- Again use **structured output** (JSON) with optional vs required fields.
- **Validation:** Run basic checks (e.g. email format, ID format) and mark fields as “low confidence” if missing or ambiguous.
- Store raw + extracted in DB so you can improve prompts or add a second pass later.

---

## 3. Propose a Response Draft

**Goal:** Generate a first draft reply that agents can edit and send.

**Approach:**

- **LLM call** with:
  - Full ticket text (or summary from step 2)
  - Category and severity (from step 1)
  - Optional: tone (professional, empathetic), max length, and “do not include” rules (e.g. no pricing promises).
- **Prompt:** “You are a support agent. Using the ticket and context below, write a concise, helpful reply. Do not make promises we cannot keep.”

**Implementation notes:**

- **Templates:** For common categories, you can use template placeholders and let the LLM fill them (e.g. “Hi {{name}}, we’re looking into your issue with {{order_id}}…”).
- **Safety:** Add guardrails (no PII in draft, no commitments to refunds/credits unless allowed).
- **Versioning:** Keep “draft v1” in history so agents can revert or compare.

---

## 4. Route to the Right Team

**Goal:** Assign the ticket to the correct team (or queue) based on category, severity, and possibly content.

**Approach:**

- **Deterministic rules first:** Map (category, severity) → team using a table or config (e.g. “Billing + High → Billing Team”, “Technical + Critical → Platform On-Call”).
- **Optional LLM assist:** If routing is complex (e.g. “could be Billing or Technical”), add an optional LLM step: “Which team should handle this: A, B, or C?” with structured output, then feed that into the same routing table.
- **Output:** Team ID or queue name + optional reason (for auditing).

**Implementation notes:**

- Prefer **rules over pure LLM** for routing so behavior is explainable and stable.
- Log routing decision + confidence so you can tune rules or add exceptions.

---

## 5. Deduplication (Given “Duplication” in the Brief)

**Approach:**

- **Before or right after “Extract”:** Compute a **normalized representation** of the ticket (e.g. hash of: normalized text + customer ID + product + short summary).
- **Check** against recent tickets (e.g. last 7 days) in a store (DB or vector store). If similarity or hash match is high, **link** as duplicate or “related” and optionally skip or shortcut the rest of the workflow (e.g. “Suggest: merge with #12345”).
- **Optional:** Use embeddings + similarity search for “soft” duplicates (same issue, different wording).

---

## 6. Suggested Tech Stack (for the Next.js App)

| Concern              | Suggestion |
|----------------------|------------|
| LLM                  | API to OpenAI, Anthropic, or Azure OpenAI; use structured outputs (e.g. JSON mode / tool use). |
| Workflow orchestration | Simple: sequential API calls in one serverless/API route. Later: a pipeline runner (e.g. Inngest, Temporal) or a small state machine. |
| Storage              | DB for tickets, extracted fields, drafts, and routing results. Optional vector DB for dedup/search. |
| Front-end            | Next.js: form to submit/paste ticket, then show classification, extracted fields, draft, and suggested route. |
| Config               | Categories, severities, and routing table in config (e.g. JSON/TS) or DB so non-devs can adjust. |

---

## 6a. Free LLM Options (for this project)

For **no-cost implementation** (prototypes, MVPs, demos), these options work well with the classify → extract → draft → route pipeline. All support **structured output** (JSON) or can be prompted for it.

| Provider | Free tier | Best for this workflow | Notes |
|----------|-----------|------------------------|--------|
| **Groq** | ~14,400 req/day, 500K tokens/day (e.g. Llama 3.1 8B, Llama 3 70B) | **Recommended:** Very fast, good for classify + extract + draft. | No credit card. [console.groq.com](https://console.groq.com). Use OpenAI-compatible API base. |
| **Google AI Studio (Gemini)** | ~15 RPM, 200–1,000 RPD depending on model (e.g. Gemini 2.0 Flash, 2.5 Flash) | Strong for draft quality; 1M token context on 2.0 Flash. | Free tier data may be used to improve Google products. [aistudio.google.com](https://aistudio.google.com). |
| **OpenRouter** | ~50 req/day free; more with small one-time credit | Single API to many models (Llama, DeepSeek, Qwen, etc.). | Good to swap models without changing code. [openrouter.ai](https://openrouter.ai). |
| **Mistral** | 1B tokens/month free | Good EU-friendly option; solid for classification and extraction. | [mistral.ai](https://mistral.ai). |
| **Ollama (local)** | Unlimited (runs on your machine) | Full control, no rate limits, works offline. | Install [ollama.com](https://ollama.com), pull e.g. `llama3.1` or `mistral`; call local API. Best if you have a decent GPU. |

**Practical pick for this project:** Use **Groq** (free, fast, no card) for classify + extract + draft, and keep routing **rule-based** so you don’t depend on LLM for the final assignment. If you need maximum draft quality or long context, add **Gemini 2.0 Flash** as an option (same pipeline, switch via env var).

---

## 7. Implementation — Multiple Steps

Break the work into **steps** you can do one at a time (e.g. one PR or one sprint per step). Each step has a **goal**, **deliverables**, and **dependency** on the previous step.

---

### Step 1 — Config and types

**Goal:** Define the data model and configuration so the rest of the pipeline and UI can rely on it.

**Deliverables:**

- **Categories:** List of allowed categories (e.g. `Billing`, `Technical`, `Account`, `Refund`, `Feature Request`, `Other`) in a config file or constant.
- **Severities:** List of allowed severities (e.g. `Low`, `Medium`, `High`, `Critical`) with short criteria.
- **Routing table:** Map `(category, severity) → teamId` (e.g. in `config/routing.ts` or JSON).
- **Extracted-fields schema:** TypeScript types or JSON schema for the fields you will extract (e.g. `customerEmail`, `orderId`, `summary`, `affectedComponent`).
- **Environment:** `.env.example` with `LLM_API_KEY` and `LLM_PROVIDER` (e.g. `groq` / `gemini`).

**Dependency:** None.

**Done when:** Config and types are in the repo; routing table is editable without touching pipeline code.

---

### Step 2 — LLM client and classification

**Goal:** Call a free LLM (e.g. Groq) and get structured **category + severity** for a given ticket text.

**Deliverables:**

- **LLM client:** A small module (e.g. `lib/llm.ts`) that:
  - Reads provider and API key from env.
  - Sends a prompt and optional JSON schema.
  - Returns parsed JSON (or throws with a clear error).
- **Classification prompt:** A prompt that asks for `{ category, severity }` from a fixed list; use structured output (JSON mode or response_format) so you don’t parse free text.
- **Classify function:** `classifyTicket(rawText: string) => Promise<{ category, severity }>` that uses the LLM client and returns typed result.
- **Minimal test:** One API route (e.g. `POST /api/tickets/classify`) that accepts `{ text }` and returns `{ category, severity }`, or a simple script that calls `classifyTicket` and logs the result.

**Dependency:** Step 1 (config and types).

**Done when:** Given a sample ticket string, the app returns the correct category and severity in a stable format.

---

### Step 3 — Field extraction

**Goal:** From the same ticket text, extract required fields (e.g. email, order ID, summary) in a structured way.

**Deliverables:**

- **Extraction prompt:** Prompt that asks the LLM to return a fixed set of fields (matching the schema from Step 1); use structured output.
- **Extract function:** `extractFields(rawText: string) => Promise<ExtractedFields>`.
- **Optional:** Combine with classification in a single “analyze” call to save latency/cost: `analyzeTicket(rawText) => { classification, extractedFields }`.
- **API:** Either extend the classify route to also return extracted fields or add `POST /api/tickets/extract` (or both in one `POST /api/tickets/analyze`).

**Dependency:** Step 1, Step 2 (LLM client).

**Done when:** For a sample ticket, the API returns both classification and extracted fields with correct types.

---

### Step 4 — Response draft

**Goal:** Generate a short, professional reply draft using the ticket and the results of classify + extract.

**Deliverables:**

- **Draft prompt:** Prompt that takes ticket text + category + severity (and optionally key extracted fields) and returns a single reply draft; include guardrails (e.g. “do not promise refunds or specific timelines”).
- **Draft function:** `proposeDraft(ticketText: string, context: { category, severity, extractedFields? }) => Promise<string>`.
- **API:** e.g. `POST /api/tickets/draft` that accepts ticket + context and returns `{ draft }`, or integrate into a single “process” route.

**Dependency:** Step 2, Step 3.

**Done when:** The API returns a coherent draft for a few sample tickets.

---

### Step 5 — Routing rules

**Goal:** Map (category, severity) to a team using the config from Step 1; no LLM for this step.

**Deliverables:**

- **Route function:** `routeTicket(classification: { category, severity }) => { teamId, teamName?, reason? }` that reads from the routing table; include a default team for unknown combinations.
- **API:** Either part of the same “process” response or a small `POST /api/tickets/route` that accepts classification and returns team.
- **Logging:** Log the routing decision (e.g. category, severity, teamId) for later tuning.

**Dependency:** Step 1.

**Done when:** For every (category, severity) in your config, the correct team is returned; unknown pairs go to a default team.

---

### Step 6 — Full pipeline API

**Goal:** One endpoint that runs the full workflow: classify → extract → draft → route, and returns everything the UI needs.

**Deliverables:**

- **Process route:** `POST /api/tickets/process` that:
  - Accepts `{ ticketText: string }`.
  - Runs: classify (and optionally extract in the same call), then draft, then route.
  - Returns: `{ classification, extractedFields, draft, routing }` (and optionally a single combined “analyze” object).
- **Error handling:** If LLM or routing fails, return a clear error and optional partial result (e.g. classification only).
- **Idempotency / logging:** Optionally store each request/response (e.g. in memory, file, or DB) for debugging.

**Dependency:** Steps 2–5.

**Done when:** Sending one request with ticket text returns classification, extracted fields, draft, and suggested team in one response.

---

### Step 7 — Basic UI

**Goal:** A page where a user can paste a ticket, run the pipeline, and see all results.

**Deliverables:**

- **Page:** e.g. `/tickets` or `/` with:
  - A text area for “Paste ticket text”.
  - A “Process” or “Analyze” button that calls `POST /api/tickets/process`.
  - Display of: category, severity, extracted fields (in a simple list or table), draft (in an editable or read-only block), and suggested team.
- **Loading and errors:** Show loading state while the request is in flight; show error message if the request fails.
- **No persistence yet:** Results only in the current page (no DB required for this step).

**Dependency:** Step 6.

**Done when:** A user can paste a ticket, click once, and see classification, extracted fields, draft, and routing without leaving the page.

---

### Step 8 — Deduplication (optional)

**Goal:** Detect possible duplicates and suggest linking to an existing ticket.

**Deliverables:**

- **Normalization:** A function that builds a “signature” from ticket text + extracted fields (e.g. hash of normalized summary + customer email + product).
- **Storage:** A simple store (e.g. in-memory, JSON file, or DB) of recent processed tickets with their signatures.
- **Lookup:** Before or after extraction, check if a similar ticket exists (e.g. same signature or high similarity); return `{ isPossibleDuplicate, relatedTicketId?, similarity? }` in the pipeline response.
- **UI:** Show a “Possible duplicate of #…” banner and optionally a “Merge” or “Link” action.

**Dependency:** Step 3 (extracted fields), Step 6 (pipeline). Optional: vector store or embeddings for soft dedup.

**Done when:** Duplicate or near-duplicate tickets are flagged and linkable to a previous ticket.

---

### Step 9 — Polish and feedback (optional)

**Goal:** Make the UI production-friendly and capture feedback to improve prompts and routing.

**Deliverables:**

- **Edit draft:** Allow editing the draft in the UI before “Assign” or “Send”.
- **Assign / Send:** Button(s) that record the chosen team and draft (e.g. save to DB or send to a webhook); keep “human in the loop” (no auto-send unless you explicitly add it).
- **Feedback:** Optional “Was this helpful?” or “Correct classification?” for classification/draft; store feedback for later analysis.
- **Logging and safety:** Ensure prompts and model responses are logged (or hashed) for debugging and compliance.

**Dependency:** Step 7 (and Step 8 if you added it).

**Done when:** Agents can edit the draft, assign the ticket, and optionally submit feedback; decisions are logged.

---

### Implementation order summary

| Step | Focus              | Depends on |
|------|--------------------|------------|
| 1    | Config + types     | —          |
| 2    | LLM client + classify | 1       |
| 3    | Extract fields     | 1, 2       |
| 4    | Response draft     | 2, 3       |
| 5    | Routing rules      | 1          |
| 6    | Full pipeline API  | 2–5        |
| 7    | Basic UI           | 6          |
| 8    | Deduplication      | 3, 6       |
| 9    | Polish + feedback  | 7 (and 8)  |

You can implement **Steps 1, 2, 5** in parallel after Step 1; then **3 and 4** in parallel; then **6**, then **7**. Steps **8** and **9** can follow once the core flow works.

---

## 8. Quality and Safety

- **Human in the loop:** Treat AI output as a proposal; require human approval before sending or routing.
- **Logging:** Log prompt (or hash), model, and response for debugging and compliance.
- **Feedback loop:** Add “Was this classification/draft helpful?” to improve prompts and routing rules over time.

---

## Summary

| Step        | Main action                          | Output format   |
|------------|--------------------------------------|-----------------|
| Classify   | One LLM call with fixed categories/severity | `{ category, severity }` |
| Extract    | One LLM call with field schema       | `{ field1, field2, … }`   |
| Draft      | One LLM call with ticket + context   | Plain text reply draft   |
| Route      | Rules (and optional LLM) on category/severity | `{ teamId, reason }`     |
| Deduplicate | Hash or embedding + lookup           | `{ isDuplicate, relatedTicketId? }` |

Putting this in a single markdown gives the team a clear, consistent approach to implement and iterate on.
