import { NextResponse } from "next/server";
import { extractFields } from "@/lib/extract";

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

    const extractedFields = await extractFields(text);
    return NextResponse.json(extractedFields);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Extraction failed.";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
