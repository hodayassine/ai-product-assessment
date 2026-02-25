import { NextResponse } from "next/server";

/**
 * Records assignment of a ticket to a team with the (possibly edited) draft.
 * Human in the loop: no auto-send; this just records the decision.
 * For now logs and returns success; replace with DB or webhook as needed.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const draft = typeof body?.draft === "string" ? body.draft : "";
    const teamId = typeof body?.teamId === "string" ? body.teamId : "";
    const teamName = typeof body?.teamName === "string" ? body.teamName : undefined;
    const ticketId = typeof body?.ticketId === "string" ? body.ticketId : undefined;

    if (!draft.trim() || !teamId) {
      return NextResponse.json(
        { error: "Missing 'draft' or 'teamId' in request body." },
        { status: 400 }
      );
    }

    // Log for auditing (no PII in draft content in production logs if sensitive)
    console.log("[tickets/assign]", {
      teamId,
      teamName,
      ticketId,
      draftLength: draft.length,
    });

    return NextResponse.json({
      ok: true,
      message: "Assignment recorded.",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Assign failed.";
    console.error("[tickets/assign]", message, err);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
