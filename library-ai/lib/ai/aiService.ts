import OpenAI from "openai";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

const GROQ_TIMEOUT_MS = 20_000;
const GROQ_BASE_URL = "https://api.groq.com/openai/v1";
const GROQ_MODEL = "llama-3.1-8b-instant";

const GROQ_NOT_CONFIGURED_MSG =
  "Groq is not configured. Add GROQ_API_KEY to your .env file (no quotes needed), then restart the dev server (stop and run npm run dev again).";

function stripQuotes(s: string): string {
  const t = s.trim();
  if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) {
    return t.slice(1, -1).trim();
  }
  return t;
}

/** Try to read GROQ_API_KEY from .env or .env.local in the given dir (e.g. process.cwd()). */
function loadGroqKeyFromEnvFile(dir: string): string {
  for (const file of [".env", ".env.local"]) {
    const path = join(dir, file);
    try {
      if (!existsSync(path)) continue;
      const content = readFileSync(path, "utf-8");
      for (const line of content.split("\n")) {
        const match = line.match(/^GROQ_API_KEY\s*=\s*(.*)$/);
        if (match) return stripQuotes(match[1].trim());
      }
    } catch {
      // ignore read errors
    }
  }
  return "";
}

export function getGroqApiKey(): string {
  let raw = process.env.GROQ_API_KEY;
  if (typeof raw === "string" && raw.trim()) {
    return stripQuotes(raw.trim());
  }

  // Fallback for local development only: try reading .env / .env.local from disk.
  // In production (e.g. Vercel), rely solely on real environment variables.
  if (process.env.NODE_ENV !== "production") {
    const fromCwd = loadGroqKeyFromEnvFile(process.cwd());
    if (fromCwd) return fromCwd;
    try {
      const fromDir = loadGroqKeyFromEnvFile(join(__dirname, "..", ".."));
      if (fromDir) return fromDir;
    } catch {
      // __dirname may not be available in all bundles
    }
  }

  return "";
}

let _groqConfigLogged = false;

function getClient(): OpenAI | null {
  const key = getGroqApiKey();
  if (!key) {
    if (process.env.NODE_ENV === "development" && !_groqConfigLogged) {
      _groqConfigLogged = true;
      console.warn("[aiService] GROQ_API_KEY is missing or empty. Add it to .env in the project root (library-ai folder) and restart the dev server.");
    }
    return null;
  }
  if (process.env.NODE_ENV === "development" && !_groqConfigLogged) {
    _groqConfigLogged = true;
    console.info("[aiService] GROQ_API_KEY is set, AI features enabled.");
  }
  return new OpenAI({ apiKey: key, baseURL: GROQ_BASE_URL });
}

/** Extract JSON from model response, stripping optional markdown code fences. */
function parseJsonResponse(raw: string): unknown {
  const trimmed = raw.trim();
  const jsonMatch = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
  const toParse = jsonMatch ? jsonMatch[1].trim() : trimmed;
  return JSON.parse(toParse);
}

function formatGroqError(err: unknown): string {
  if (err instanceof Error) {
    if (err.name === "AbortError") return "Request timed out. Please try again.";
    const msg = err.message || "";
    if (msg.includes("401") || msg.toLowerCase().includes("invalid api key") || msg.toLowerCase().includes("authentication")) return "Invalid Groq API key. Check GROQ_API_KEY in .env.";
    if (msg.includes("429") || msg.toLowerCase().includes("rate limit")) return "Groq rate limit reached. Please try again in a moment.";
    return msg;
  }
  if (err && typeof err === "object" && "status" in err) {
    const status = (err as { status?: number }).status;
    if (status === 401) return "Invalid Groq API key. Check GROQ_API_KEY in .env.";
    if (status === 429) return "Groq rate limit reached. Please try again in a moment.";
  }
  return "AI request failed.";
}

export type BookSummaryResult = {
  summary: string;
  keyThemes: string[];
  idealReader: string;
};

export async function getBookSummary(description: string): Promise<{ success: true; data: BookSummaryResult } | { success: false; error: string }> {
  const client = getClient();
  if (!client) return { success: false, error: GROQ_NOT_CONFIGURED_MSG };
  if (!description?.trim()) return { success: false, error: "No description provided." };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), GROQ_TIMEOUT_MS);

  try {
    const completion = await client.chat.completions.create(
      {
        model: GROQ_MODEL,
        messages: [
          {
            role: "system",
            content: "You are a librarian assistant. Output only valid JSON. Do not invent or add content that is not supported by the input.",
          },
          {
            role: "user",
            content: `Given this book description, respond with a JSON object with exactly these keys (no other keys):
- "summary": a 3-line summary string
- "keyThemes": array of 3-5 short theme strings
- "idealReader": one short sentence describing the ideal reader

Book description:\n${description.trim().slice(0, 3000)}

Respond with only the JSON object, no markdown or extra text.`,
          },
        ],
        response_format: { type: "json_object" },
        max_tokens: 400,
      },
      { signal: controller.signal }
    );

    const raw = completion.choices[0]?.message?.content;
    if (!raw) return { success: false, error: "Empty response from AI." };

    const parsed = parseJsonResponse(raw) as unknown;
    if (typeof parsed !== "object" || parsed === null) return { success: false, error: "Invalid JSON." };
    const o = parsed as Record<string, unknown>;
    const summary = typeof o.summary === "string" ? o.summary : "";
    const keyThemes = Array.isArray(o.keyThemes) ? o.keyThemes.filter((t): t is string => typeof t === "string") : [];
    const idealReader = typeof o.idealReader === "string" ? o.idealReader : "";
    if (!summary) return { success: false, error: "Invalid summary in response." };
    return { success: true, data: { summary, keyThemes, idealReader } };
  } catch (err) {
    if (process.env.NODE_ENV === "development") console.error("[aiService] getBookSummary:", err);
    return { success: false, error: formatGroqError(err) };
  } finally {
    clearTimeout(timeout);
  }
}

export type RecommendationInput = {
  bookList: { id: string; title: string; author: string; genre: string }[];
  borrowedBookTitles: string[];
  preferredGenres: string[];
};

export async function getRecommendations(input: RecommendationInput): Promise<{ success: true; bookIds: string[] } | { success: false; error: string }> {
  const client = getClient();
  if (!client) return { success: false, error: GROQ_NOT_CONFIGURED_MSG };
  if (input.bookList.length === 0) return { success: true, bookIds: [] };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), GROQ_TIMEOUT_MS);
  const bookListText = input.bookList.map((b) => `id: ${b.id} | ${b.title} by ${b.author} (${b.genre})`).join("\n");

  try {
    const completion = await client.chat.completions.create(
      {
        model: GROQ_MODEL,
        messages: [
          {
            role: "system",
            content: "You are a recommendation engine. You must ONLY recommend books from the provided list. Output a JSON object with a single key \"bookIds\" that is an array of book id strings from the list. Do not invent or use any book IDs that are not in the list. Maximum 5 recommendations.",
          },
          {
            role: "user",
            content: `Available books (use only these IDs):\n${bookListText}\n\nUser has borrowed: ${input.borrowedBookTitles.join(", ") || "none"}.\nPreferred genres: ${input.preferredGenres.join(", ") || "any"}.\n\nRespond with only: {"bookIds": ["id1","id2",...]} using only IDs from the list above.`,
          },
        ],
        response_format: { type: "json_object" },
        max_tokens: 200,
      },
      { signal: controller.signal }
    );

    const raw = completion.choices[0]?.message?.content;
    if (!raw) return { success: false, error: "Empty response from AI." };

    const parsed = parseJsonResponse(raw) as unknown;
    const o = parsed as Record<string, unknown>;
    const bookIds = Array.isArray(o.bookIds) ? o.bookIds.filter((id): id is string => typeof id === "string") : [];
    const validIds = new Set(input.bookList.map((b) => b.id));
    const filtered = bookIds.filter((id) => validIds.has(id)).slice(0, 5);
    return { success: true, bookIds: filtered };
  } catch (err) {
    if (process.env.NODE_ENV === "development") console.error("[aiService] getRecommendations:", err);
    return { success: false, error: formatGroqError(err) };
  } finally {
    clearTimeout(timeout);
  }
}

export type AdminInsightsInput = {
  genreCounts: { genre: string; count: number }[];
  borrowCountByMonth: { month: string; count: number }[];
  topBorrowedBookTitles: string[];
};

export type AdminInsightsResult = {
  popularGenres: string;
  borrowPatterns: string;
  suggestedAcquisitions: string;
};

export async function getAdminInsights(input: AdminInsightsInput): Promise<{ success: true; data: AdminInsightsResult } | { success: false; error: string }> {
  const client = getClient();
  if (!client) return { success: false, error: GROQ_NOT_CONFIGURED_MSG };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), GROQ_TIMEOUT_MS);

  try {
    const completion = await client.chat.completions.create(
      {
        model: GROQ_MODEL,
        messages: [
          {
            role: "system",
            content: "You are a library analyst. Use ONLY the provided statistics. Do not invent numbers or titles. Output a JSON object with exactly: \"popularGenres\", \"borrowPatterns\", \"suggestedAcquisitions\" (each a short string). Base insights only on the data given.",
          },
          {
            role: "user",
            content: `Statistics (use only these):\nGenre counts: ${JSON.stringify(input.genreCounts)}\nBorrows by month: ${JSON.stringify(input.borrowCountByMonth)}\nTop borrowed books: ${JSON.stringify(input.topBorrowedBookTitles)}\n\nRespond with only: {"popularGenres":"...","borrowPatterns":"...","suggestedAcquisitions":"..."}`,
          },
        ],
        response_format: { type: "json_object" },
        max_tokens: 400,
      },
      { signal: controller.signal }
    );

    const raw = completion.choices[0]?.message?.content;
    if (!raw) return { success: false, error: "Empty response from AI." };

    const parsed = parseJsonResponse(raw) as unknown;
    const o = parsed as Record<string, unknown>;
    const popularGenres = typeof o.popularGenres === "string" ? o.popularGenres : "";
    const borrowPatterns = typeof o.borrowPatterns === "string" ? o.borrowPatterns : "";
    const suggestedAcquisitions = typeof o.suggestedAcquisitions === "string" ? o.suggestedAcquisitions : "";
    return { success: true, data: { popularGenres, borrowPatterns, suggestedAcquisitions } };
  } catch (err) {
    if (process.env.NODE_ENV === "development") console.error("[aiService] getAdminInsights:", err);
    return { success: false, error: formatGroqError(err) };
  } finally {
    clearTimeout(timeout);
  }
}
