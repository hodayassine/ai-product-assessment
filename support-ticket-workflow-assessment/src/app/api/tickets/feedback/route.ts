import { NextResponse } from "next/server";

/**
 * Records feedback on classification and/or draft for later analysis.
 * Logs and returns success; replace with DB as needed.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const ticketId = typeof body?.ticketId === "string" ? body.ticketId : undefined;
    const classificationCorrect =
      body?.classificationCorrect === true || body?.classificationCorrect === false
        ? body.classificationCorrect
        : undefined;
    const draftHelpful =
      body?.draftHelpful === true || body?.draftHelpful === false
        ? body.draftHelpful
        : undefined;
    const comment = typeof body?.comment === "string" ? body.comment : undefined;

    if (
      classificationCorrect === undefined &&
      draftHelpful === undefined &&
      !comment?.trim()
    ) {
      return NextResponse.json(
        {
          error:
            "Provide at least one of: classificationCorrect, draftHelpful, comment.",
        },
        { status: 400 }
      );
    }

    console.log("[tickets/feedback]", {
      ticketId,
      classificationCorrect,
      draftHelpful,
      comment: comment?.slice(0, 200),
    });

    return NextResponse.json({
      ok: true,
      message: "Thank you for your feedback.",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Feedback failed.";
    console.error("[tickets/feedback]", message, err);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
