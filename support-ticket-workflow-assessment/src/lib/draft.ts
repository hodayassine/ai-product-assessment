import { chatCompletion } from "@/lib/llm";
import type { TicketCategory } from "@/config/categories";
import type { TicketSeverity } from "@/config/severities";
import type { ExtractedFields } from "@/types/tickets";

const DRAFT_SYSTEM_PROMPT = `You are a professional support agent. Write a SHORT reply: 1–2 paragraphs only, 3–5 sentences total. People skim—keep it concise.

CRITICAL - How to start:
- Do NOT start with "Dear [name]", "Dear Customer", or "Hi [name]". Forbidden.
- Start your first sentence with the specific issue from the ticket (e.g. "We're looking into the duplicate charge for order #12345." or "We've received your refund request and are reviewing it.").

Content: In 3–5 sentences total, (1) acknowledge their issue with a concrete detail, (2) say we're looking into it / escalating, (3) say we'll get back to them, (4) brief sign-off ("Thank you" or "Best regards"). Do NOT promise refunds or specific timelines. Do not invent company or agent names. Output only the reply text.`;

export interface DraftContext {
  category: TicketCategory;
  severity: TicketSeverity;
  extractedFields?: ExtractedFields | null;
}

function buildContextBlock(context: DraftContext): string {
  const parts = [
    `Category: ${context.category}`,
    `Severity: ${context.severity}`,
  ];
  const ef = context.extractedFields;
  if (ef) {
    const fields = [
      ef.summary && `Summary: ${ef.summary}`,
      ef.orderId && `Order/Reference: ${ef.orderId}`,
      ef.customerEmail && `Customer email: ${ef.customerEmail}`,
      ef.productOrFeature && `Product/Feature: ${ef.productOrFeature}`,
      ef.affectedComponentOrError && `Technical detail: ${ef.affectedComponentOrError}`,
    ].filter(Boolean);
    if (fields.length > 0) {
      parts.push("Extracted context:", ...fields);
    }
  }
  return parts.join("\n");
}

/**
 * Proposes a reply draft for a support ticket using the LLM.
 * Uses ticket text plus classification and optional extracted fields for context.
 */
export async function proposeDraft(
  ticketText: string,
  context: DraftContext
): Promise<string> {
  const trimmed = ticketText.trim();
  if (!trimmed) {
    return "Thank you for contacting support. Could you please provide more details about your issue so we can assist you?";
  }

  const contextBlock = buildContextBlock(context);
  const userContent = `Ticket from customer:\n\n${trimmed}\n\n---\nContext (use in reply):\n${contextBlock}\n\nWrite a SHORT reply: 3–5 sentences total, 1–2 paragraphs. Do NOT start with "Dear" or "Hi [name]". Start with the specific issue (e.g. duplicate charge, order #). Then: we're looking into it, we'll get back to you, sign-off. Output only the reply text.`;

  const messages = [
    { role: "system" as const, content: DRAFT_SYSTEM_PROMPT },
    { role: "user" as const, content: userContent },
  ];

  const draft = await chatCompletion(messages, { maxTokens: 2048 });
  return typeof draft === "string" ? draft.trim() : String(draft).trim();
}
