import { describe, it, expect } from "vitest";
import {
  buildSignature,
  findPossibleDuplicate,
  recordTicket,
} from "./dedupe";

const emptyExtracted = {
  customerEmail: null,
  customerId: null,
  orderId: null,
  productOrFeature: null,
  summary: null,
  affectedComponentOrError: null,
};

describe("buildSignature", () => {
  it("returns same hash for same ticket text", () => {
    const text = "I was charged twice for order #12345. Please refund.";
    const a = buildSignature(text, emptyExtracted);
    const b = buildSignature(text, emptyExtracted);
    expect(a).toBe(b);
    expect(a).toMatch(/^[a-f0-9]{64}$/);
  });

  it("returns different hash for different ticket text", () => {
    const a = buildSignature("Ticket A", emptyExtracted);
    const b = buildSignature("Ticket B", emptyExtracted);
    expect(a).not.toBe(b);
  });

  it("normalizes whitespace so same content gives same signature", () => {
    const a = buildSignature("  hello   world  ", emptyExtracted);
    const b = buildSignature("hello world", emptyExtracted);
    expect(a).toBe(b);
  });

  it("returns empty string for empty ticket text", () => {
    expect(buildSignature("", emptyExtracted)).toBe("");
    expect(buildSignature("   ", emptyExtracted)).toBe("");
  });
});

describe("findPossibleDuplicate and recordTicket", () => {
  it("returns null when signature not seen, then returns id after record", () => {
    const sig = buildSignature("Unique ticket " + Math.random(), emptyExtracted);
    expect(findPossibleDuplicate(sig)).toBeNull();
    const id = recordTicket(sig);
    expect(id).toMatch(/^TKT-/);
    expect(findPossibleDuplicate(sig)).toBe(id);
  });
});
