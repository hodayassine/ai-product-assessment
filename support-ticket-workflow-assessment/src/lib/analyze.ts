import { classifyTicket } from "@/lib/classify";
import { extractFields } from "@/lib/extract";
import type { ExtractedFields, TicketClassification } from "@/types/tickets";

export interface AnalyzeTicketResult {
  classification: TicketClassification;
  extractedFields: ExtractedFields;
}

/**
 * Runs classification and field extraction in parallel (two LLM calls).
 * Use this when you need both in one round trip.
 */
export async function analyzeTicket(rawText: string): Promise<AnalyzeTicketResult> {
  const [classification, extractedFields] = await Promise.all([
    classifyTicket(rawText),
    extractFields(rawText),
  ]);
  return { classification, extractedFields };
}
