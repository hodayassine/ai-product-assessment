import { NextResponse } from "next/server";
import { analyzeTicket } from "@/lib/analyze";

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

    const result = await analyzeTicket(text);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Analysis failed.";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
