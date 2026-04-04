export const defaultProviderModelMap = {
  anthropic: "claude-sonnet-4.6",
  openai: "gpt-5.4",
} as const;

export type ChatProvider = keyof typeof defaultProviderModelMap;

export const DEFAULT_CHAT_PROVIDER: ChatProvider = "anthropic";

export const providerLabelMap: Record<ChatProvider, string> = {
  anthropic: "Anthropic",
  openai: "OpenAI",
};

export function isChatProvider(value: unknown): value is ChatProvider {
  return typeof value === "string" && value in defaultProviderModelMap;
}

export function getDefaultModel(provider: ChatProvider) {
  return defaultProviderModelMap[provider];
}
