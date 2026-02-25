import { createHash } from "crypto";
import type { ExtractedFields } from "@/types/tickets";

/**
 * Normalizes ticket text for signature: lowercase, trim, collapse all whitespace
 * (including newlines) to a single space. Only the ticket text is used so that
 * the same paste always yields the same signature (extracted fields vary by LLM).
 */
function normalizeTicketText(text: string): string {
  if (text == null || typeof text !== "string") return "";
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

/**
 * Builds a signature for duplicate detection from the ticket text only.
 * Same pasted content produces the same signature. Extracted fields are not
 * used because the LLM often returns slightly different values each run.
 */
export function buildSignature(
  ticketText: string,
  _extractedFields: ExtractedFields
): string {
  const normalized = normalizeTicketText(ticketText);
  if (!normalized) return "";

  return createHash("sha256").update(normalized, "utf8").digest("hex");
}

interface StoredTicket {
  ticketId: string;
  createdAt: number;
}

/** In-memory store: signature -> first ticket that had this signature. */
const signatureStore = new Map<string, StoredTicket>();

let ticketCounter = 0;

function generateTicketId(): string {
  ticketCounter += 1;
  return `TKT-${Date.now().toString(36).toUpperCase()}-${ticketCounter}`;
}

/**
 * Looks up whether this signature was seen before. Returns the existing ticket id if so.
 */
export function findPossibleDuplicate(signature: string): string | null {
  if (!signature) return null;
  const stored = signatureStore.get(signature);
  return stored ? stored.ticketId : null;
}

/**
 * Records a processed ticket by signature and returns its id.
 * Use this for new tickets (after checking findPossibleDuplicate).
 */
export function recordTicket(signature: string): string {
  const existing = signatureStore.get(signature);
  if (existing) return existing.ticketId;

  const ticketId = generateTicketId();
  signatureStore.set(signature, { ticketId, createdAt: Date.now() });
  return ticketId;
}
