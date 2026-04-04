"use client";

import {
  AssistantRuntimeProvider,
  ThreadListItemPrimitive,
  ThreadListPrimitive,
  useAui,
  useAuiState,
} from "@assistant-ui/react";
import {
  AssistantChatTransport,
  useChatRuntime,
} from "@assistant-ui/react-ai-sdk";
import { lastAssistantMessageIsCompleteWithToolCalls } from "ai";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ChatSettingsDialog from "@/features/chat/components/chat-settings-dialog";
import AssistantChatThread from "@/features/chat/components/assistant-chat-thread";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DEFAULT_CHAT_PROVIDER,
  getDefaultModel,
  isChatProvider,
  providerLabelMap,
  type ChatProvider,
} from "@/features/chat/lib/chat-models";

const CHAT_PROVIDER_CONFIGS_STORAGE_KEY = "dashboard-chat-provider-configs";
const CHAT_ACTIVE_SELECTION_STORAGE_KEY = "dashboard-chat-active-selection";
const INITIAL_PROVIDER_CONFIG_ID = "default-provider-config";

type ProviderConfig = {
  id: string;
  name: string;
  provider: ChatProvider;
  baseUrl: string;
  apiKey: string;
  models: string[];
};

type ActiveSelection = {
  configId: string;
  model: string;
};

function createProviderConfig(
  provider: ChatProvider = DEFAULT_CHAT_PROVIDER,
  id = crypto.randomUUID(),
) {
  return {
    id,
    name: providerLabelMap[provider],
    provider,
    baseUrl: "",
    apiKey: "",
    models: [getDefaultModel(provider)],
  } satisfies ProviderConfig;
}

function normalizeModels(models: string[], provider: ChatProvider) {
  const nextModels = Array.from(
    new Set(models.map((model) => model.trim()).filter(Boolean)),
  );

  return nextModels.length > 0 ? nextModels : [getDefaultModel(provider)];
}

function parseStoredProviderConfigs(value: string | null) {
  if (!value) {
    return null;
  }

  const parsedValue = JSON.parse(value) as unknown;

  if (!Array.isArray(parsedValue)) {
    return null;
  }

  const configs = parsedValue.flatMap((item) => {
    if (typeof item !== "object" || item === null) {
      return [];
    }

    const candidate = item as Partial<ProviderConfig>;

    if (
      typeof candidate.id !== "string" ||
      typeof candidate.name !== "string" ||
      !isChatProvider(candidate.provider)
    ) {
      return [];
    }

    return [
      {
        id: candidate.id,
        name: candidate.name || providerLabelMap[candidate.provider],
        provider: candidate.provider,
        baseUrl: typeof candidate.baseUrl === "string" ? candidate.baseUrl : "",
        apiKey: typeof candidate.apiKey === "string" ? candidate.apiKey : "",
        models: normalizeModels(
          Array.isArray(candidate.models)
            ? candidate.models.filter(
                (model): model is string => typeof model === "string",
              )
            : [],
          candidate.provider,
        ),
      } satisfies ProviderConfig,
    ];
  });

  return configs.length > 0 ? configs : null;
}

function parseStoredActiveSelection(value: string | null) {
  if (!value) {
    return null;
  }

  const parsedValue = JSON.parse(value) as unknown;

  if (typeof parsedValue !== "object" || parsedValue === null) {
    return null;
  }

  const selection = parsedValue as Partial<ActiveSelection>;

  if (
    typeof selection.configId !== "string" ||
    typeof selection.model !== "string"
  ) {
    return null;
  }

  return {
    configId: selection.configId,
    model: selection.model,
  } satisfies ActiveSelection;
}

function getSelectionLabel(config: ProviderConfig, model: string) {
  return `${config.name} / ${model}`;
}

type ThreadTitleMessage = {
  role: "assistant" | "system" | "user";
  parts: readonly {
    type: string;
    text?: string;
  }[];
};

function getMessageText(message: ThreadTitleMessage) {
  return message.parts
    .filter(
      (part): part is { type: "text"; text: string } =>
        part.type === "text" && typeof part.text === "string",
    )
    .map((part) => part.text.trim())
    .filter(Boolean)
    .join(" ");
}

function buildThreadTitle(messages: readonly ThreadTitleMessage[]) {
  const firstUserMessage = messages.find((message) => message.role === "user");
  const title = firstUserMessage ? getMessageText(firstUserMessage) : "";

  if (!title) {
    return null;
  }

  return title.length > 40 ? `${title.slice(0, 40)}...` : title;
}

function RuntimeEffects({
  clearRequestError,
}: {
  clearRequestError: () => void;
}) {
  const api = useAui();
  const mainThreadId = useAuiState((state) => state.threads.mainThreadId);
  const currentTitle = useAuiState((state) => state.threadListItem.title);
  const messages = useAuiState(
    (state) =>
      state.thread.messages as unknown as readonly ThreadTitleMessage[],
  );
  const messageCount = messages.length;
  const isRunning = useAuiState((state) => state.thread.isRunning);

  useEffect(() => {
    clearRequestError();
  }, [clearRequestError, isRunning, mainThreadId, messageCount]);

  useEffect(() => {
    if (currentTitle) {
      return;
    }

    const nextTitle = buildThreadTitle(messages);

    if (!nextTitle) {
      return;
    }

    void api.threads().item({ id: mainThreadId }).rename(nextTitle);
  }, [api, currentTitle, mainThreadId, messages]);

  return null;
}

function ChatSidebar() {
  const isRunning = useAuiState((state) => state.thread.isRunning);

  return (
    <div className="border-border/45 bg-background/45 h-full min-h-0 overflow-hidden rounded-[24px] border shadow-sm backdrop-blur">
      <ThreadListPrimitive.Root className="flex h-full min-h-0 flex-col">
        <div className="border-border/45 flex flex-col gap-3 border-b px-3.5 py-3.5">
          <div>
            <div className="text-muted-foreground text-[11px] font-medium tracking-[0.18em] uppercase">
              Chats
            </div>
            <div className="mt-1 text-base font-semibold tracking-[-0.02em]">
              Conversation history
            </div>
          </div>

          <ThreadListPrimitive.New
            disabled={isRunning}
            className="border-border/65 bg-background/85 hover:bg-muted text-foreground inline-flex h-9 w-full items-center justify-center gap-2 rounded-2xl border px-3 text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50"
          >
            <Icons.add className="size-4" />
            New chat
          </ThreadListPrimitive.New>
        </div>

        <div className="min-h-0 flex-1 p-2">
          <ScrollArea className="h-full">
            <div className="flex flex-col gap-1.5">
              <ThreadListPrimitive.Items>
                {({ threadListItem }) => (
                  <ThreadListItemPrimitive.Root className="group hover:border-border/45 hover:bg-muted/25 data-[active=true]:border-border/60 data-[active=true]:bg-background/88 flex items-center rounded-xl border border-transparent transition-all data-[active=true]:shadow-sm">
                    <ThreadListItemPrimitive.Trigger className="flex min-w-0 flex-1 flex-col items-start gap-1 px-3 py-2.5 text-left">
                      <span className="w-full truncate text-sm font-medium tracking-[-0.02em]">
                        <ThreadListItemPrimitive.Title fallback="New chat" />
                      </span>
                      {!threadListItem.title ? (
                        <span className="text-muted-foreground text-[11px]">
                          Start a new chat
                        </span>
                      ) : null}
                    </ThreadListItemPrimitive.Trigger>

                    <ThreadListItemPrimitive.Delete className="text-muted-foreground hover:text-foreground hover:bg-background/80 mr-2 inline-flex size-8 items-center justify-center rounded-full opacity-0 transition-all group-hover:opacity-100">
                      <Icons.trash className="size-4" />
                      <span className="sr-only">Delete conversation</span>
                    </ThreadListItemPrimitive.Delete>
                  </ThreadListItemPrimitive.Root>
                )}
              </ThreadListPrimitive.Items>
            </div>
          </ScrollArea>
        </div>
      </ThreadListPrimitive.Root>
    </div>
  );
}

function ChatHeader({
  activeConfigId,
  onOpenSettings,
  providerConfigs,
  selectedModel,
  setActiveConfigId,
  setSelectedModel,
}: {
  activeConfigId: string;
  onOpenSettings: () => void;
  providerConfigs: ProviderConfig[];
  selectedModel: string;
  setActiveConfigId: (configId: string) => void;
  setSelectedModel: (model: string) => void;
}) {
  const isRunning = useAuiState((state) => state.thread.isRunning);

  return (
    <div className="border-border/45 bg-background/72 supports-[backdrop-filter]:bg-background/55 flex items-center justify-between gap-3 border-b px-5 py-3.5 backdrop-blur md:px-7">
      <Select
        value={
          activeConfigId && selectedModel
            ? `${activeConfigId}::${selectedModel}`
            : undefined
        }
        onValueChange={(value) => {
          const [configId, model] = value.split("::");
          const nextConfig = providerConfigs.find(
            (config) => config.id === configId,
          );

          if (!nextConfig || !model) {
            return;
          }

          setActiveConfigId(nextConfig.id);
          setSelectedModel(model);
        }}
        disabled={isRunning}
      >
        <SelectTrigger className="border-border/60 bg-background/78 h-8 w-full max-w-[16.5rem] rounded-full px-3.5 text-[13px] shadow-none">
          <SelectValue placeholder="Choose provider and model" />
        </SelectTrigger>
        <SelectContent>
          {providerConfigs.flatMap((config) =>
            normalizeModels(config.models, config.provider).map((model) => (
              <SelectItem
                key={`${config.id}-${model}`}
                value={`${config.id}::${model}`}
              >
                {getSelectionLabel(config, model)}
              </SelectItem>
            )),
          )}
        </SelectContent>
      </Select>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="border-border/65 bg-background/78 hover:bg-muted size-9 rounded-full border"
        onClick={onOpenSettings}
      >
        <Icons.settings className="size-4" />
        <span className="sr-only">Open settings</span>
      </Button>
    </div>
  );
}

function ChatRuntimeLayout({
  activeConfigId,
  clearRequestError,
  disabled,
  errorMessage,
  onOpenSettings,
  providerConfigs,
  selectedModel,
  setActiveConfigId,
  setSelectedModel,
}: {
  activeConfigId: string;
  clearRequestError: () => void;
  disabled: boolean;
  errorMessage?: string;
  onOpenSettings: () => void;
  providerConfigs: ProviderConfig[];
  selectedModel: string;
  setActiveConfigId: (configId: string) => void;
  setSelectedModel: (model: string) => void;
}) {
  return (
    <>
      <RuntimeEffects clearRequestError={clearRequestError} />

      <div className="grid h-[calc(100dvh-8rem)] min-h-0 gap-3 overflow-hidden lg:grid-cols-[224px_minmax(0,1fr)]">
        <ChatSidebar />

        <div className="border-border/40 bg-card/45 flex h-full min-h-0 flex-col overflow-hidden rounded-[26px] border shadow-sm backdrop-blur">
          <ChatHeader
            activeConfigId={activeConfigId}
            onOpenSettings={onOpenSettings}
            providerConfigs={providerConfigs}
            selectedModel={selectedModel}
            setActiveConfigId={setActiveConfigId}
            setSelectedModel={setSelectedModel}
          />

          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <AssistantChatThread
              disabled={disabled}
              errorMessage={errorMessage}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default function ChatPage() {
  const initialProviderConfig = useRef(
    createProviderConfig(DEFAULT_CHAT_PROVIDER, INITIAL_PROVIDER_CONFIG_ID),
  ).current;
  const [providerConfigs, setProviderConfigs] = useState<ProviderConfig[]>([
    initialProviderConfig,
  ]);
  const [activeConfigId, setActiveConfigId] = useState(
    initialProviderConfig.id,
  );
  const [editingConfigId, setEditingConfigId] = useState(
    initialProviderConfig.id,
  );
  const [selectedModel, setSelectedModel] = useState<string>(
    initialProviderConfig.models[0] ??
      getDefaultModel(initialProviderConfig.provider),
  );
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [testingConfigId, setTestingConfigId] = useState<string | null>(null);
  const [testFeedback, setTestFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [requestError, setRequestError] = useState<string | undefined>(
    undefined,
  );
  const clearRequestError = useCallback(() => {
    setRequestError(undefined);
  }, []);
  const transportConfigRef = useRef<{
    apiKey: string;
    baseUrl: string;
    model: string;
    provider: ChatProvider;
  }>({
    apiKey: initialProviderConfig.apiKey,
    baseUrl: initialProviderConfig.baseUrl,
    model:
      initialProviderConfig.models[0] ??
      getDefaultModel(initialProviderConfig.provider),
    provider: initialProviderConfig.provider,
  });

  const updateProviderConfig = (
    configId: string,
    updater: (config: ProviderConfig) => ProviderConfig,
  ) => {
    setProviderConfigs((currentConfigs) =>
      currentConfigs.map((config) =>
        config.id === configId ? updater(config) : config,
      ),
    );
  };

  const handleAddProviderConfig = () => {
    const nextConfig = createProviderConfig();

    setProviderConfigs((currentConfigs) => [nextConfig, ...currentConfigs]);
    setActiveConfigId(nextConfig.id);
    setEditingConfigId(nextConfig.id);
    setSelectedModel(
      nextConfig.models[0] ?? getDefaultModel(nextConfig.provider),
    );
    setTestFeedback(null);
  };

  const handleRemoveProviderConfig = (configId: string) => {
    if (providerConfigs.length <= 1) {
      return;
    }

    setProviderConfigs((currentConfigs) =>
      currentConfigs.filter((config) => config.id !== configId),
    );
  };

  const handleProviderTypeChange = (
    configId: string,
    provider: ChatProvider,
  ) => {
    updateProviderConfig(configId, (config) => ({
      ...config,
      provider,
      name:
        config.name === providerLabelMap[config.provider]
          ? providerLabelMap[provider]
          : config.name,
      models: [getDefaultModel(provider)],
    }));

    if (activeConfigId === configId) {
      setSelectedModel(getDefaultModel(provider));
    }

    setTestFeedback(null);
  };

  const handleTestConfig = async (config: ProviderConfig) => {
    setTestingConfigId(config.id);
    setTestFeedback(null);

    try {
      const response = await fetch("/api/chat/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          provider: config.provider,
          model: config.models[0] ?? getDefaultModel(config.provider),
          baseUrl: config.baseUrl.trim(),
          apiKey: config.apiKey.trim(),
        }),
      });

      const result = (await response.json()) as {
        ok?: boolean;
        text?: string;
        error?: string;
      };

      if (!response.ok || !result.ok) {
        setTestFeedback({
          type: "error",
          message: result.error ?? "Connection test failed.",
        });
        return;
      }

      setTestFeedback({
        type: "success",
        message: `Connection OK${result.text ? `: ${result.text}` : ""}`,
      });
    } catch (testError) {
      setTestFeedback({
        type: "error",
        message:
          testError instanceof Error
            ? testError.message
            : "Connection test failed.",
      });
    } finally {
      setTestingConfigId(null);
    }
  };

  const activeConfig =
    providerConfigs.find((config) => config.id === activeConfigId) ??
    providerConfigs[0];
  const hasActiveApiKey = Boolean(
    activeConfig?.apiKey.trim() && selectedModel.trim(),
  );

  transportConfigRef.current = {
    apiKey: activeConfig?.apiKey ?? "",
    baseUrl: activeConfig?.baseUrl ?? "",
    model:
      selectedModel.trim() ||
      getDefaultModel(activeConfig?.provider ?? DEFAULT_CHAT_PROVIDER),
    provider: activeConfig?.provider ?? DEFAULT_CHAT_PROVIDER,
  };

  const transport = useMemo(
    () =>
      new AssistantChatTransport({
        api: "/api/chat",
        body: () => {
          const config = transportConfigRef.current;

          return {
            provider: config.provider,
            model: config.model,
            baseUrl: config.baseUrl.trim() || undefined,
            apiKey: config.apiKey.trim() || undefined,
          };
        },
      }),
    [],
  );

  const runtime = useChatRuntime({
    transport,
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
    onError: (error) => {
      setRequestError(
        error instanceof Error && error.message
          ? error.message
          : "Check the selected vendor, model, base URL, and API key.",
      );
    },
  });

  useEffect(() => {
    try {
      const storedConfigs = parseStoredProviderConfigs(
        window.localStorage.getItem(CHAT_PROVIDER_CONFIGS_STORAGE_KEY),
      );
      const storedSelection = parseStoredActiveSelection(
        window.localStorage.getItem(CHAT_ACTIVE_SELECTION_STORAGE_KEY),
      );

      if (!storedConfigs) {
        return;
      }

      const firstConfig = storedConfigs[0];

      if (!firstConfig) {
        return;
      }

      setProviderConfigs(storedConfigs);

      const selectedConfig = storedSelection
        ? storedConfigs.find((config) => config.id === storedSelection.configId)
        : undefined;
      const nextActiveConfig = selectedConfig ?? firstConfig;
      const nextModels = normalizeModels(
        nextActiveConfig.models,
        nextActiveConfig.provider,
      );
      const nextSelectedModel =
        storedSelection && nextModels.includes(storedSelection.model)
          ? storedSelection.model
          : nextModels[0];

      setActiveConfigId(nextActiveConfig.id);
      setEditingConfigId(nextActiveConfig.id);
      setSelectedModel(
        nextSelectedModel ?? getDefaultModel(nextActiveConfig.provider),
      );
    } catch {
      window.localStorage.removeItem(CHAT_PROVIDER_CONFIGS_STORAGE_KEY);
      window.localStorage.removeItem(CHAT_ACTIVE_SELECTION_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(
      CHAT_PROVIDER_CONFIGS_STORAGE_KEY,
      JSON.stringify(providerConfigs),
    );
  }, [providerConfigs]);

  useEffect(() => {
    if (!activeConfig) {
      return;
    }

    window.localStorage.setItem(
      CHAT_ACTIVE_SELECTION_STORAGE_KEY,
      JSON.stringify({
        configId: activeConfig.id,
        model: selectedModel,
      } satisfies ActiveSelection),
    );
  }, [activeConfig, selectedModel]);

  useEffect(() => {
    if (!activeConfig) {
      return;
    }

    const nextModels = normalizeModels(
      activeConfig.models,
      activeConfig.provider,
    );

    if (!nextModels.includes(selectedModel)) {
      setSelectedModel(nextModels[0] ?? getDefaultModel(activeConfig.provider));
    }
  }, [activeConfig, selectedModel]);

  useEffect(() => {
    const firstConfig = providerConfigs[0];

    if (!firstConfig) {
      return;
    }

    if (!providerConfigs.some((config) => config.id === activeConfigId)) {
      setActiveConfigId(firstConfig.id);
    }

    if (!providerConfigs.some((config) => config.id === editingConfigId)) {
      setEditingConfigId(firstConfig.id);
    }
  }, [activeConfigId, editingConfigId, providerConfigs]);

  useEffect(() => {
    clearRequestError();
  }, [activeConfigId, clearRequestError, selectedModel]);

  return (
    <>
      <ChatSettingsDialog
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
        providerConfigs={providerConfigs}
        editingConfigId={editingConfigId}
        setEditingConfigId={setEditingConfigId}
        updateProviderConfig={updateProviderConfig}
        handleProviderTypeChange={handleProviderTypeChange}
        handleAddProviderConfig={handleAddProviderConfig}
        handleRemoveProviderConfig={handleRemoveProviderConfig}
        handleTestConfig={handleTestConfig}
        testingConfigId={testingConfigId}
        testFeedback={testFeedback}
        setTestFeedback={setTestFeedback}
      />

      <AssistantRuntimeProvider runtime={runtime}>
        <ChatRuntimeLayout
          activeConfigId={activeConfig?.id ?? activeConfigId}
          clearRequestError={clearRequestError}
          disabled={!hasActiveApiKey}
          errorMessage={requestError}
          onOpenSettings={() => setIsSettingsOpen(true)}
          providerConfigs={providerConfigs}
          selectedModel={selectedModel}
          setActiveConfigId={setActiveConfigId}
          setSelectedModel={setSelectedModel}
        />
      </AssistantRuntimeProvider>
    </>
  );
}
