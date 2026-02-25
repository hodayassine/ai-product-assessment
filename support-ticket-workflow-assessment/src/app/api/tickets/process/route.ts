import { NextResponse } from "next/server";
import { z } from "zod";
import { processTicket } from "@/lib/process";

const ProcessRequestBody = z.object({
  ticketText: z.string().min(1, "ticketText is required and cannot be empty"),
});

export async function POST(request: Request) {
  try {
    const raw = await request.json();
    const parsed = ProcessRequestBody.safeParse(raw);
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      return NextResponse.json(
        { error: first ? `${first.path.join(".")}: ${first.message}` : "Invalid request body" },
        { status: 400 }
      );
    }
    const { ticketText } = parsed.data;

    const result = await processTicket(ticketText);
    // Log for debugging/compliance (no ticket content)
    console.log("[tickets/process]", {
      classification: result.classification.category,
      severity: result.classification.severity,
      teamId: result.routing.teamId,
    });
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Processing failed.";
    console.error("[tickets/process]", message, err);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
