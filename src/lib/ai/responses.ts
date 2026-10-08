import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { stepCountIs, streamText, type ModelMessage, type ToolSet, type UIMessage } from "ai";

import {
  createLovableAiGatewayRunIdFetch,
  getLovableAiGatewayRunId,
  withLovableAiGatewayRunIdHeader,
} from "./run-id.ts";

export function createPowLinkResponse(
  request: Request,
  config: { apiKey: string; model: string; direct?: boolean; gemini?: boolean },
  messages: ModelMessage[],
  instructions: string,
  tools?: ToolSet,
) {
  const runIdFetch = createLovableAiGatewayRunIdFetch(getLovableAiGatewayRunId(request));
  const direct = config.direct === true;
  const gemini = config.gemini === true;
  const provider = gemini
    ? null
    : direct
      ? createOpenAI({ apiKey: config.apiKey })
      : createOpenAI({
          baseURL: "https://ai.gateway.lovable.dev/v1",
          apiKey: config.apiKey,
          headers: {
            "Lovable-API-Key": config.apiKey,
            "X-Lovable-AIG-SDK": "vercel-ai-sdk",
          },
          fetch: runIdFetch.fetch,
        });
  const google = gemini ? createGoogleGenerativeAI({ apiKey: config.apiKey }) : null;

  const result = streamText({
    model: google ? google(config.model) : direct ? provider!.responses(config.model) : provider!.chat(config.model),
    instructions,
    messages,
    tools,
    stopWhen: stepCountIs(5),
    abortSignal: request.signal,
    maxRetries: 2,
    providerOptions: gemini
      ? undefined
      : {
          openai: { store: false },
        },
  });

  return {
    response: (originalMessages: UIMessage[]) => {
      const streamResponse = result.toUIMessageStreamResponse({
        originalMessages,
        sendReasoning: false,
        onError: (error) => getSafeAiError(error),
      });
      // Only the Lovable gateway path goes through runIdFetch; other providers would wait forever.
      return gemini || direct
        ? Promise.resolve(streamResponse)
        : withLovableAiGatewayRunIdHeader(streamResponse, runIdFetch);
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
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: fetchImpl,
  });
}
