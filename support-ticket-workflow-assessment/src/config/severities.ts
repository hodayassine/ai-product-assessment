/**
 * Allowed severities with short criteria. Edit this list to change classification
 * options without touching pipeline code.
 */
export const TICKET_SEVERITIES = ["Low", "Medium", "High", "Critical"] as const;

export type TicketSeverity = (typeof TICKET_SEVERITIES)[number];

export const SEVERITY_CRITERIA: Record<TicketSeverity, string> = {
  Low: "General inquiry, no urgency.",
  Medium: "Issue affecting use but workaround exists.",
  High: "Significant impact; no workaround or many users affected.",
  Critical: "Outage, data loss, or security incident; immediate response required.",
};

export function isTicketSeverity(value: string): value is TicketSeverity {
  return TICKET_SEVERITIES.includes(value as TicketSeverity);
}
