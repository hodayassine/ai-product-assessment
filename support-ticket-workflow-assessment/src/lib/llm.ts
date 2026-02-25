/**
 * Generic LLM client. Reads provider and API key from env.
 * Supports Groq (OpenAI-compatible). Add Gemini or others by extending getConfig and request.
 */

export type LLMProvider = "groq" | "gemini";

interface ProviderConfig {
  baseUrl: string;
  apiKey: string;
  model: string;
  supportsJsonMode: boolean;
}

function getConfig(): ProviderConfig {
  const provider = (process.env.LLM_PROVIDER ?? "groq").toLowerCase() as LLMProvider;
  const apiKey = process.env.LLM_API_KEY?.trim();

  if (!apiKey) {
    throw new Error(
      "LLM_API_KEY is not set. Add it to .env (see .env.example)."
    );
  }

  switch (provider) {
    case "groq":
      return {
        baseUrl: "https://api.groq.com/openai/v1",
        apiKey,
        model: "llama-3.1-8b-instant",
        supportsJsonMode: true,
      };
    case "gemini":
      // Gemini uses a different API; placeholder for Step 2. Implement when needed.
      throw new Error(
        "Gemini provider is not implemented yet. Use LLM_PROVIDER=groq for now."
      );
    default:
      throw new Error(
        `Unknown LLM_PROVIDER: ${process.env.LLM_PROVIDER}. Use "groq" or "gemini".`
      );
  }
}

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatCompletionOptions {
  /** Ask for a JSON object in the response; response will be parsed and returned as object. */
  responseFormat?: "json_object";
  /** Max tokens to generate (default 1024). Use higher for long replies (e.g. drafts). */
  maxTokens?: number;
}

/**
 * Sends messages to the LLM and returns the assistant reply as text.
 * If options.responseFormat === "json_object", parses the reply as JSON and returns the parsed object.
 */
export async function chatCompletion<T = string>(
  messages: ChatMessage[],
  options?: ChatCompletionOptions
): Promise<T> {
  const config = getConfig();

  const body: Record<string, unknown> = {
    model: config.model,
    messages,
    max_tokens: options?.maxTokens ?? 1024,
  };

  if (options?.responseFormat === "json_object" && config.supportsJsonMode) {
    body.response_format = { type: "json_object" };
  }

  const res = await fetch(`${config.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(
      `LLM request failed (${res.status}): ${errText || res.statusText}`
    );
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = data.choices?.[0]?.message?.content?.trim();

  if (content == null) {
    throw new Error("LLM returned no content.");
  }

  if (options?.responseFormat === "json_object") {
    try {
      return JSON.parse(content) as T;
    } catch {
      throw new Error(`LLM response is not valid JSON: ${content.slice(0, 200)}`);
    }
  }

  return content as T;
}
