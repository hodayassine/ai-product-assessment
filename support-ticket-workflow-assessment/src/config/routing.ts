import type { TicketCategory } from "@/config/categories";
import type { TicketSeverity } from "@/config/severities";
import type { RoutingResult } from "@/types/tickets";

/**
 * Team assignment for a (category, severity) pair.
 * Edit this table to change routing without touching pipeline code.
 */
export interface TeamAssignment {
  teamId: string;
  teamName?: string;
}

/**
 * Routing table: (category, severity) → team.
 * Add or change entries here to route tickets to the right team.
 */
export const ROUTING_TABLE: Partial<
  Record<TicketCategory, Partial<Record<TicketSeverity, TeamAssignment>>>
> = {
  Billing: {
    Low: { teamId: "billing", teamName: "Billing Team" },
    Medium: { teamId: "billing", teamName: "Billing Team" },
    High: { teamId: "billing", teamName: "Billing Team" },
    Critical: { teamId: "billing-escalation", teamName: "Billing Escalation" },
  },
  Technical: {
    Low: { teamId: "support", teamName: "Support Team" },
    Medium: { teamId: "support", teamName: "Support Team" },
    High: { teamId: "engineering", teamName: "Engineering" },
    Critical: { teamId: "platform-oncall", teamName: "Platform On-Call" },
  },
  Account: {
    Low: { teamId: "support", teamName: "Support Team" },
    Medium: { teamId: "support", teamName: "Support Team" },
    High: { teamId: "support", teamName: "Support Team" },
    Critical: { teamId: "platform-oncall", teamName: "Platform On-Call" },
  },
  Refund: {
    Low: { teamId: "billing", teamName: "Billing Team" },
    Medium: { teamId: "billing", teamName: "Billing Team" },
    High: { teamId: "billing", teamName: "Billing Team" },
    Critical: { teamId: "billing-escalation", teamName: "Billing Escalation" },
  },
  "Feature Request": {
    Low: { teamId: "product", teamName: "Product Team" },
    Medium: { teamId: "product", teamName: "Product Team" },
    High: { teamId: "product", teamName: "Product Team" },
    Critical: { teamId: "product", teamName: "Product Team" },
  },
  Other: {
    Low: { teamId: "support", teamName: "Support Team" },
    Medium: { teamId: "support", teamName: "Support Team" },
    High: { teamId: "support", teamName: "Support Team" },
    Critical: { teamId: "platform-oncall", teamName: "Platform On-Call" },
  },
};

/** Default team when (category, severity) is not in the routing table. */
export const DEFAULT_TEAM: TeamAssignment = {
  teamId: "support",
  teamName: "Support Team",
};

/**
 * Returns the team assignment for a given classification.
 * Uses DEFAULT_TEAM for unknown (category, severity) pairs.
 */
export function routeTicket(classification: {
  category: TicketCategory;
  severity: TicketSeverity;
}): RoutingResult {
  const byCategory = ROUTING_TABLE[classification.category];
  const assignment =
    byCategory?.[classification.severity] ?? DEFAULT_TEAM;

  return {
    teamId: assignment.teamId,
    teamName: assignment.teamName,
    reason: `Category: ${classification.category}, Severity: ${classification.severity}`,
  };
}
