import { generateText } from "ai";
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

type ChatTestBody = {
  provider?: unknown;
  model?: unknown;
  baseUrl?: unknown;
  apiKey?: unknown;
};

function hasChatTestBody(value: unknown): value is ChatTestBody {
  return typeof value === "object" && value !== null;
}

export async function POST(req: Request) {
  const body: unknown = await req.json();

  if (!hasChatTestBody(body)) {
    return Response.json({ error: "Invalid test payload." }, { status: 400 });
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

  if (!apiKey) {
    return Response.json(
      { error: `${providerLabelMap[provider]} API key is required.` },
      { status: 400 },
    );
  }

  if (baseURL) {
    try {
      new URL(baseURL);
    } catch {
      return Response.json({ error: "Invalid base URL." }, { status: 400 });
    }
  }

  try {
    const languageModel = createChatLanguageModel({
      provider,
      model,
      apiKey,
      baseURL,
    });

    const result = await generateText({
      model: languageModel,
      prompt: 'Reply with exactly "OK".',
      maxOutputTokens: 8,
    });

    return Response.json({ ok: true, text: result.text });
  } catch (error) {
    const message = formatChatProviderErrorMessage(error, provider, baseURL);

    return Response.json({ error: message }, { status: 500 });
  }
}
