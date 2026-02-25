import { NextResponse } from "next/server";
import { proposeDraft } from "@/lib/draft";
import { isTicketCategory, isTicketSeverity } from "@/config";
import type { ExtractedFields } from "@/types/tickets";

function parseExtractedFields(ef: unknown): ExtractedFields | null {
  if (ef == null || typeof ef !== "object") return null;
  const o = ef as Record<string, unknown>;
  const toStr = (v: unknown): string | null =>
    typeof v === "string" && v.trim() ? v.trim() : null;
  return {
    customerEmail: toStr(o.customerEmail),
    customerId: toStr(o.customerId),
    orderId: toStr(o.orderId),
    productOrFeature: toStr(o.productOrFeature),
    summary: toStr(o.summary),
    affectedComponentOrError: toStr(o.affectedComponentOrError),
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const text = typeof body?.text === "string" ? body.text : "";
    const category = isTicketCategory(body?.category) ? body.category : null;
    const severity = isTicketSeverity(body?.severity) ? body.severity : null;

    if (!text.trim()) {
      return NextResponse.json(
        { error: "Missing or empty 'text' in request body." },
        { status: 400 }
      );
    }
    if (!category || !severity) {
      return NextResponse.json(
        {
          error:
            "Missing or invalid 'category' or 'severity'. Use values from POST /api/tickets/classify or /api/tickets/analyze.",
        },
        { status: 400 }
      );
    }

    const extractedFields = parseExtractedFields(body.extractedFields);
    const draft = await proposeDraft(text, {
      category,
      severity,
      extractedFields: extractedFields ?? undefined,
    });

    return NextResponse.json({ draft });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Draft generation failed.";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
