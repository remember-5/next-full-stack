import { APICallError } from "ai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createOpenAI } from "@ai-sdk/openai";
import { type ChatProvider } from "@/features/chat/lib/chat-models";

type CreateChatLanguageModelOptions = {
  provider: ChatProvider;
  model: string;
  apiKey: string;
  baseURL?: string;
};

const OPENAI_API_ORIGIN = "https://api.openai.com";
const OPENAI_API_PATH = "/v1";
const OPENAI_CHAT_COMPLETIONS_PATH = "/chat/completions";
const OPENAI_RESPONSES_PATH = "/responses";

function normalizeBaseURLValue(baseURL?: string) {
  const nextBaseURL = baseURL?.trim();

  return nextBaseURL && nextBaseURL.length > 0 ? nextBaseURL : undefined;
}

function stripOpenAIEndpointPath(pathname: string) {
  for (const suffix of [
    OPENAI_CHAT_COMPLETIONS_PATH,
    OPENAI_RESPONSES_PATH,
  ] as const) {
    if (pathname === suffix) {
      return "/";
    }

    if (pathname.endsWith(suffix)) {
      return pathname.slice(0, -suffix.length) || "/";
    }
  }

  return pathname;
}

function normalizeOpenAIBaseURL(baseURL?: string) {
  const nextBaseURL = normalizeBaseURLValue(baseURL);

  if (!nextBaseURL) {
    return undefined;
  }

  try {
    const url = new URL(nextBaseURL);
    const normalizedPath = url.pathname.replace(/\/+$/, "");
    const strippedPath = stripOpenAIEndpointPath(normalizedPath);

    url.pathname =
      normalizedPath.length === 0 ? OPENAI_API_PATH : strippedPath || "/";

    return url.toString();
  } catch {
    return nextBaseURL;
  }
}

function getResolvedBaseURL(provider: ChatProvider, baseURL?: string) {
  const nextBaseURL = normalizeBaseURLValue(baseURL);

  if (!nextBaseURL) {
    return undefined;
  }

  return provider === "openai"
    ? normalizeOpenAIBaseURL(nextBaseURL)
    : nextBaseURL;
}

function isCustomOpenAICompatibleBaseURL(baseURL?: string) {
  if (!baseURL) {
    return false;
  }

  try {
    const url = new URL(baseURL);
    const normalizedPath = url.pathname.replace(/\/+$/, "");

    return (
      url.origin !== OPENAI_API_ORIGIN || normalizedPath !== OPENAI_API_PATH
    );
  } catch {
    return true;
  }
}

function getErrorMessage(error: unknown) {
  if (APICallError.isInstance(error)) {
    const status = error.statusCode ? ` (HTTP ${error.statusCode})` : "";
    const responseBody = error.responseBody
      ?.replace(/\s+/g, " ")
      .trim()
      .slice(0, 240);

    return responseBody && responseBody.length > 0
      ? `${error.message}${status}: ${responseBody}`
      : `${error.message}${status}`;
  }

  if (error == null) {
    return "Request failed.";
  }

  if (typeof error === "string") {
    return error;
  }

  if (error instanceof Error) {
    return error.message;
  }

  try {
    return JSON.stringify(error);
  } catch {
    return "Request failed.";
  }
}

export function createChatLanguageModel({
  provider,
  model,
  apiKey,
  baseURL,
}: CreateChatLanguageModelOptions) {
  const resolvedBaseURL = getResolvedBaseURL(provider, baseURL);

  if (provider === "anthropic") {
    return createAnthropic({
      apiKey,
      baseURL: resolvedBaseURL,
    })(model);
  }

  const useCompatibleMode = isCustomOpenAICompatibleBaseURL(resolvedBaseURL);
  const openai = createOpenAI({
    apiKey,
    baseURL: resolvedBaseURL,
    name: useCompatibleMode ? "openai-compatible" : undefined,
  });

  return useCompatibleMode ? openai.chat(model) : openai(model);
}

export function resolveChatBaseURL(provider: ChatProvider, baseURL?: string) {
  return getResolvedBaseURL(provider, baseURL);
}

export function formatChatProviderErrorMessage(
  error: unknown,
  provider: ChatProvider,
  baseURL?: string,
) {
  const message = getErrorMessage(error);
  const resolvedBaseURL = getResolvedBaseURL(provider, baseURL);

  if (
    provider === "openai" &&
    isCustomOpenAICompatibleBaseURL(resolvedBaseURL) &&
    /invalid json response/i.test(message)
  ) {
    return `${message}. Verify BASE_URL is the API prefix, not the full endpoint, and that the provider supports /chat/completions with OpenAI-style JSON error responses.`;
  }

  return message;
}
