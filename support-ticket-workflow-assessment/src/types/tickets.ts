import type { TicketCategory } from "@/config/categories";
import type { TicketSeverity } from "@/config/severities";

/** Result of the classification step (category + severity). */
export interface TicketClassification {
  category: TicketCategory;
  severity: TicketSeverity;
}

/**
 * Schema of fields extracted from a ticket. All fields are optional at extraction
 * time; use null when not present. Validation can mark low-confidence values.
 */
export interface ExtractedFields {
  /** Customer email if mentioned. */
  customerEmail: string | null;
  /** Customer or account ID if mentioned. */
  customerId: string | null;
  /** Order or transaction ID if mentioned. */
  orderId: string | null;
  /** Product or feature name. */
  productOrFeature: string | null;
  /** Short summary (1–2 sentences). */
  summary: string | null;
  /** Affected component or error message (for technical tickets). */
  affectedComponentOrError: string | null;
}

/** Result of the routing step. */
export interface RoutingResult {
  teamId: string;
  teamName?: string;
  reason?: string;
}

/** Deduplication result: possible duplicate and/or current ticket id. */
export interface DeduplicationResult {
  isPossibleDuplicate: boolean;
  relatedTicketId?: string;
  currentTicketId?: string;
}

/** Full pipeline result returned by POST /api/tickets/process. */
export interface ProcessTicketResult {
  classification: TicketClassification;
  extractedFields: ExtractedFields;
  draft: string;
  routing: RoutingResult;
  deduplication?: DeduplicationResult;
}

/** Request body for POST /api/tickets/process. */
export interface ProcessTicketRequest {
  ticketText: string;
}
