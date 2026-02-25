/**
 * Allowed ticket categories. Edit this list to change classification options
 * without touching pipeline code.
 */
export const TICKET_CATEGORIES = [
  "Billing",
  "Technical",
  "Account",
  "Refund",
  "Feature Request",
  "Other",
] as const;

export type TicketCategory = (typeof TICKET_CATEGORIES)[number];

export function isTicketCategory(value: string): value is TicketCategory {
  return TICKET_CATEGORIES.includes(value as TicketCategory);
}
