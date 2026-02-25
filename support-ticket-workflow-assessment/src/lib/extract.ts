import { chatCompletion } from "@/lib/llm";
import type { ExtractedFields } from "@/types/tickets";

const EXTRACT_SYSTEM_PROMPT = `You are a support ticket parser. Extract the following fields from the ticket. Respond with exactly one JSON object using these keys only. Use null for any field not mentioned or not found.

Required keys (all must be present; use null if not in the ticket):
- customerEmail: string or null - customer's email address if mentioned
- customerId: string or null - customer ID, account ID, or user ID if mentioned
- orderId: string or null - order number, transaction ID, or reference if mentioned
- productOrFeature: string or null - product name, plan name, or feature if mentioned
- summary: string or null - one or two sentence summary of the issue
- affectedComponentOrError: string or null - for technical issues: component, service, or error message; otherwise null

Output only valid JSON, no other text.`;

function toNull(s: unknown): string | null {
  if (s == null || typeof s !== "string") return null;
  const t = s.trim();
  return t === "" ? null : t;
}

/**
 * Extracts structured fields from a support ticket using the LLM.
 * Missing or invalid values are set to null.
 */
export async function extractFields(rawText: string): Promise<ExtractedFields> {
  const trimmed = rawText.trim();
  if (!trimmed) {
    return {
      customerEmail: null,
      customerId: null,
      orderId: null,
      productOrFeature: null,
      summary: null,
      affectedComponentOrError: null,
    };
  }

  const messages = [
    { role: "system" as const, content: EXTRACT_SYSTEM_PROMPT },
    { role: "user" as const, content: `Extract fields from this support ticket:\n\n${trimmed}` },
  ];

  const raw = await chatCompletion<Record<string, unknown>>(messages, {
    responseFormat: "json_object",
  });

  return {
    customerEmail: toNull(raw?.customerEmail),
    customerId: toNull(raw?.customerId),
    orderId: toNull(raw?.orderId),
    productOrFeature: toNull(raw?.productOrFeature),
    summary: toNull(raw?.summary),
    affectedComponentOrError: toNull(raw?.affectedComponentOrError),
  };
}
