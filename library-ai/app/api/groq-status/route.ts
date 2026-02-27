import { NextResponse } from "next/server";
import { getGroqApiKey } from "@/lib/ai/aiService";

/**
 * GET /api/groq-status
 * Returns whether GROQ_API_KEY is visible (from process.env or .env file). Use this to debug
 * "Groq is not configured" when you've already set the key in .env.
 */
export async function GET() {
  const key = getGroqApiKey();
  return NextResponse.json({
    configured: key.length > 0,
    hint:
      key.length > 0
        ? "Key is set. AI features should work. If you still see 'not configured', hard-refresh the page (Ctrl+Shift+R)."
        : "GROQ_API_KEY not found. Add GROQ_API_KEY=your_key to .env in the folder that contains package.json (library-ai), then stop and run 'npm run dev' again from that folder.",
  });
}
