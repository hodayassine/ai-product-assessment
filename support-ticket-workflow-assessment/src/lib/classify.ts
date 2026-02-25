import { chatCompletion } from "@/lib/llm";
import {
  TICKET_CATEGORIES,
  TICKET_SEVERITIES,
  isTicketCategory,
  isTicketSeverity,
} from "@/config";
import type { TicketClassification } from "@/types/tickets";

const CATEGORIES_LIST = TICKET_CATEGORIES.join(", ");
const SEVERITIES_LIST = TICKET_SEVERITIES.join(", ");

const CLASSIFY_SYSTEM_PROMPT = `You are a support ticket classifier. Given a support ticket, respond with exactly one JSON object in this form, with no other text:
{"category": "<one of: ${CATEGORIES_LIST}>", "severity": "<one of: ${SEVERITIES_LIST}>"}

Rules:
- category: must be exactly one of: ${CATEGORIES_LIST}.
- severity: must be exactly one of: ${SEVERITIES_LIST}.
- Use "Other" only when the ticket does not fit Billing, Technical, Account, Refund, or Feature Request.
- Severity: Low = general inquiry; Medium = issue with workaround; High = significant impact; Critical = outage, data loss, or security.`;

/**
 * Classifies a support ticket into category and severity using the LLM.
 * Invalid or missing values are fallback to "Other" and "Medium".
 */
export async function classifyTicket(
  rawText: string
): Promise<TicketClassification> {
  const trimmed = rawText.trim();
  if (!trimmed) {
    return {
      category: "Other",
      severity: "Medium",
    };
  }

  const messages = [
    { role: "system" as const, content: CLASSIFY_SYSTEM_PROMPT },
    { role: "user" as const, content: `Classify this support ticket:\n\n${trimmed}` },
  ];

  const raw = await chatCompletion<{ category?: string; severity?: string }>(
    messages,
    { responseFormat: "json_object" }
  );

  let category: TicketClassification["category"] = "Other";
  if (raw && raw.category && isTicketCategory(raw.category)) {
    category = raw.category;
  }

  let severity: TicketClassification["severity"] = "Medium";
  if (raw && raw.severity && isTicketSeverity(raw.severity)) {
    severity = raw.severity;
  }

  return { category, severity };
}
