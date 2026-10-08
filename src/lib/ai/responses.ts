import { createOpenAI } from "@ai-sdk/openai";
import { stepCountIs, streamText, type ModelMessage, type ToolSet, type UIMessage } from "ai";

import {
  createLovableAiGatewayRunIdFetch,
  getLovableAiGatewayRunId,
  withLovableAiGatewayRunIdHeader,
} from "./run-id.ts";

const GATEWAY_BASE_URL = "https://ai.gateway.lovable.dev/v1";

export type PowLinkAiProvider = {
  kind: "lovable" | "groq" | "openrouter";
  apiKey: string;
  model: string;
  baseURL: string;
  headers: Record<string, string>;
};

function readEnv(name: string) {
  const value = process.env[name];
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

/**
 * Picks the AI route for the assistant.
 * Order: Lovable AI (used automatically in the Lovable preview), then a free
 * Groq key, then a free OpenRouter key. Only one of them needs to exist.
 */
export function resolvePowLinkProvider(): PowLinkAiProvider | null {
  const override = readEnv("POWLINK_MODEL");

  const lovableKey = readEnv("LOVABLE_API_KEY");
  if (lovableKey) {
    return {
      kind: "lovable",
      apiKey: lovableKey,
      model: override ?? "google/gemini-2.5-flash",
      baseURL: GATEWAY_BASE_URL,
      headers: {
        "Lovable-API-Key": lovableKey,
        "X-Lovable-AIG-SDK": "vercel-ai-sdk",
      },
    };
  }

  const groqKey = readEnv("GROQ_API_KEY");
  if (groqKey) {
    return {
      kind: "groq",
      apiKey: groqKey,
      model: override ?? "llama-3.3-70b-versatile",
      baseURL: "https://api.groq.com/openai/v1",
      headers: {},
    };
  }

  const openRouterKey = readEnv("OPENROUTER_API_KEY");
  if (openRouterKey) {
    return {
      kind: "openrouter",
      apiKey: openRouterKey,
      model: override ?? "meta-llama/llama-3.3-70b-instruct:free",
      baseURL: "https://openrouter.ai/api/v1",
      headers: { "X-Title": "PowLink" },
    };
  }

  return null;
}

export function createPowLinkResponse(
  request: Request,
  provider: PowLinkAiProvider,
  messages: ModelMessage[],
  instructions: string,
  tools?: ToolSet,
) {
  const usesGateway = provider.kind === "lovable";
  const runIdFetch = createLovableAiGatewayRunIdFetch(getLovableAiGatewayRunId(request));

  const openai = createOpenAI({
    baseURL: provider.baseURL,
    apiKey: provider.apiKey,
    headers: provider.headers,
    fetch: usesGateway ? runIdFetch.fetch : undefined,
  });

  const result = streamText({
    model: openai.chat(provider.model),
    instructions,
    messages,
    tools,
    stopWhen: stepCountIs(5),
    abortSignal: request.signal,
    maxRetries: 2,
    providerOptions: usesGateway ? { openai: { store: false } } : undefined,
  });

  return {
    response: (originalMessages: UIMessage[]) => {
      const streamResponse = result.toUIMessageStreamResponse({
        originalMessages,
        sendReasoning: false,
        onError: (error) => getSafeAiError(error),
      });
      return usesGateway ? withLovableAiGatewayRunIdHeader(streamResponse, runIdFetch) : streamResponse;
    },
  };
}

export function getSafeAiError(error: unknown) {
  if (error && typeof error === "object") {
    const candidate = error as { message?: string; data?: unknown; responseBody?: string };
    if (candidate.responseBody) {
      try {
        const body = JSON.parse(candidate.responseBody) as { message?: string; error?: { message?: string } };
        return body.message ?? body.error?.message ?? candidate.message ?? "تعذر إكمال الرد الآن.";
      } catch {
        return candidate.message ?? "تعذر إكمال الرد الآن.";
      }
    }
    if (candidate.message) return candidate.message;
  }
  return "تعذر إكمال الرد الآن.";
}

export function createGatewayOpenAI(apiKey: string, fetchImpl: typeof fetch) {
  return createOpenAI({
    baseURL: GATEWAY_BASE_URL,
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: fetchImpl,
  });
}
