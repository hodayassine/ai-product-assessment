import { describe, it, expect } from "vitest";
import { routeTicket, DEFAULT_TEAM } from "./routing";

describe("routeTicket", () => {
  it("returns Billing Team for Billing + High", () => {
    const result = routeTicket({ category: "Billing", severity: "High" });
    expect(result.teamId).toBe("billing");
    expect(result.teamName).toBe("Billing Team");
    expect(result.reason).toContain("Billing");
    expect(result.reason).toContain("High");
  });

  it("returns Platform On-Call for Technical + Critical", () => {
    const result = routeTicket({ category: "Technical", severity: "Critical" });
    expect(result.teamId).toBe("platform-oncall");
    expect(result.teamName).toBe("Platform On-Call");
  });

  it("returns Product Team for Feature Request", () => {
    const result = routeTicket({ category: "Feature Request", severity: "Low" });
    expect(result.teamId).toBe("product");
    expect(result.teamName).toBe("Product Team");
  });

  it("returns default team for unknown category/severity", () => {
    const result = routeTicket({ category: "Other", severity: "Medium" });
    expect(result.teamId).toBe(DEFAULT_TEAM.teamId);
    expect(result.teamName).toBe(DEFAULT_TEAM.teamName);
  });
});
