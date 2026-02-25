import { NextResponse } from "next/server";
import { classifyTicket } from "@/lib/classify";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const text = typeof body?.text === "string" ? body.text : "";

    if (!text.trim()) {
      return NextResponse.json(
        { error: "Missing or empty 'text' in request body." },
        { status: 400 }
      );
    }

    const classification = await classifyTicket(text);
    return NextResponse.json(classification);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Classification failed.";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
