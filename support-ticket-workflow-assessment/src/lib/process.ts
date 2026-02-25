import { analyzeTicket } from "@/lib/analyze";
import { proposeDraft } from "@/lib/draft";
import { routeTicket } from "@/config/routing";
import {
  buildSignature,
  findPossibleDuplicate,
  recordTicket,
} from "@/lib/dedupe";
import type { DeduplicationResult, ProcessTicketResult } from "@/types/tickets";

/**
 * Runs the full ticket pipeline: classify + extract → dedup lookup → draft → route.
 * Returns everything the UI needs in one result, including deduplication info.
 */
export async function processTicket(
  ticketText: string
): Promise<ProcessTicketResult> {
  const { classification, extractedFields } = await analyzeTicket(ticketText);

  const signature = buildSignature(ticketText, extractedFields);
  let deduplication: DeduplicationResult;
  const relatedId = signature ? findPossibleDuplicate(signature) : null;
  if (relatedId) {
    deduplication = { isPossibleDuplicate: true, relatedTicketId: relatedId };
  } else {
    const currentId = signature ? recordTicket(signature) : undefined;
    deduplication = {
      isPossibleDuplicate: false,
      ...(currentId && { currentTicketId: currentId }),
    };
  }

  const [draft, routing] = await Promise.all([
    proposeDraft(ticketText, {
      category: classification.category,
      severity: classification.severity,
      extractedFields,
    }),
    Promise.resolve(routeTicket(classification)),
  ]);

  return {
    classification,
    extractedFields,
    draft,
    routing,
    deduplication,
  };
}
