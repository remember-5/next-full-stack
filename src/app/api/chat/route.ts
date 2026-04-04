import type { JSONSchema7 } from "json-schema";
import { frontendTools } from "@assistant-ui/react-ai-sdk";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import {
  DEFAULT_CHAT_PROVIDER,
  getDefaultModel,
  isChatProvider,
  providerLabelMap,
} from "@/features/chat/lib/chat-models";
import {
  createChatLanguageModel,
  formatChatProviderErrorMessage,
  resolveChatBaseURL,
} from "@/features/chat/lib/language-model";

export const maxDuration = 30;

function hasChatMessages(value: unknown): value is {
  messages: UIMessage[];
  provider?: unknown;
  model?: unknown;
  baseUrl?: unknown;
  apiKey?: unknown;
  system?: unknown;
  tools?: unknown;
} {
  return (
    typeof value === "object" &&
    value !== null &&
    "messages" in value &&
    Array.isArray(value.messages)
  );
}

export async function POST(req: Request) {
  const body: unknown = await req.json();

  if (!hasChatMessages(body)) {
    return new Response("Invalid chat payload.", { status: 400 });
  }

  const provider = isChatProvider(body.provider)
    ? body.provider
    : DEFAULT_CHAT_PROVIDER;
  const model =
    typeof body.model === "string" && body.model.trim().length > 0
      ? body.model.trim()
      : getDefaultModel(provider);
  const baseURL = resolveChatBaseURL(
    provider,
    typeof body.baseUrl === "string" ? body.baseUrl : undefined,
  );
  const apiKey =
    typeof body.apiKey === "string" && body.apiKey.trim().length > 0
      ? body.apiKey.trim()
      : undefined;
  const tools =
    typeof body.tools === "object" && body.tools !== null
      ? frontendTools(
          body.tools as Record<
            string,
            {
              description?: string;
              parameters: JSONSchema7;
            }
          >,
        )
      : undefined;

  if (baseURL) {
    try {
      new URL(baseURL);
    } catch {
      return new Response("Invalid base URL.", { status: 400 });
    }
  }

  if (!apiKey) {
    return new Response(`${providerLabelMap[provider]} API key is required.`, {
      status: 400,
    });
  }

  const languageModel = createChatLanguageModel({
    provider,
    model,
    apiKey,
    baseURL,
  });

  const result = streamText({
    model: languageModel,
    system:
      typeof body.system === "string" && body.system.trim().length > 0
        ? body.system.trim()
        : "You are a concise and helpful assistant for this admin dashboard.",
    messages: await convertToModelMessages(body.messages),
    tools,
  });

  return result.toUIMessageStreamResponse({
    onError: (error) =>
      formatChatProviderErrorMessage(error, provider, baseURL),
  });
}
