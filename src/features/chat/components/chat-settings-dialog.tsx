"use client";

import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  getDefaultModel,
  providerLabelMap,
  type ChatProvider,
} from "@/features/chat/lib/chat-models";
import { cn } from "@/lib/utils";

type ProviderConfig = {
  id: string;
  name: string;
  provider: ChatProvider;
  baseUrl: string;
  apiKey: string;
  models: string[];
};

type TestFeedback = {
  type: "success" | "error";
  message: string;
};

type ChatSettingsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  providerConfigs: ProviderConfig[];
  editingConfigId: string;
  setEditingConfigId: (configId: string) => void;
  updateProviderConfig: (
    configId: string,
    updater: (config: ProviderConfig) => ProviderConfig,
  ) => void;
  handleProviderTypeChange: (configId: string, provider: ChatProvider) => void;
  handleAddProviderConfig: () => void;
  handleRemoveProviderConfig: (configId: string) => void;
  handleTestConfig: (config: ProviderConfig) => void;
  testingConfigId: string | null;
  testFeedback: TestFeedback | null;
  setTestFeedback: (feedback: TestFeedback | null) => void;
};

function normalizeModels(models: string[], provider: ChatProvider) {
  const nextModels = Array.from(
    new Set(models.map((model) => model.trim()).filter(Boolean)),
  );

  return nextModels.length > 0 ? nextModels : [getDefaultModel(provider)];
}

function parseModelsInput(value: string, provider: ChatProvider) {
  return normalizeModels(value.split(/\r?\n|,/), provider);
}

export default function ChatSettingsDialog({
  open,
  onOpenChange,
  providerConfigs,
  editingConfigId,
  setEditingConfigId,
  updateProviderConfig,
  handleProviderTypeChange,
  handleAddProviderConfig,
  handleRemoveProviderConfig,
  handleTestConfig,
  testingConfigId,
  testFeedback,
  setTestFeedback,
}: ChatSettingsDialogProps) {
  const editingConfig =
    providerConfigs.find((config) => config.id === editingConfigId) ??
    providerConfigs[0];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[min(1280px,calc(100vw-2rem))] max-w-[min(1280px,calc(100vw-2rem))] p-0 sm:w-[min(1280px,calc(100vw-2rem))] sm:max-w-[min(1280px,calc(100vw-2rem))]">
        <div className="grid min-h-[620px] md:grid-cols-[260px_minmax(0,1fr)]">
          <div className="border-border bg-muted/20 border-b p-4 md:border-r md:border-b-0">
            <div className="mb-4 flex items-center justify-between gap-2">
              <div>
                <div className="text-sm font-semibold">Providers</div>
                <div className="text-muted-foreground text-xs">
                  Local cache only
                </div>
              </div>
              <Button size="sm" onClick={handleAddProviderConfig}>
                <Icons.add className="size-4" />
                New
              </Button>
            </div>

            <div className="flex flex-col gap-2">
              {providerConfigs.map((config) => {
                const isSelected = config.id === editingConfigId;

                return (
                  <button
                    key={config.id}
                    type="button"
                    onClick={() => {
                      setEditingConfigId(config.id);
                      setTestFeedback(null);
                    }}
                    className={cn(
                      "hover:bg-background flex w-full flex-col items-start rounded-lg border px-3 py-3 text-left transition-colors",
                      isSelected
                        ? "bg-background border-primary/40"
                        : "border-transparent",
                    )}
                  >
                    <span className="truncate text-sm font-medium">
                      {config.name}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      {providerLabelMap[config.provider]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-8">
            <DialogHeader className="mb-6">
              <DialogTitle>Model settings</DialogTitle>
              <DialogDescription>
                Stored only in browser cache. Nothing is written to the
                database.
              </DialogDescription>
            </DialogHeader>

            {editingConfig ? (
              <div className="space-y-4">
                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Vendor name</div>
                    <Input
                      value={editingConfig.name}
                      onChange={(event) =>
                        updateProviderConfig(editingConfig.id, (config) => ({
                          ...config,
                          name: event.target.value,
                        }))
                      }
                      placeholder="My provider"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm font-medium">Model vendor</div>
                    <Select
                      value={editingConfig.provider}
                      onValueChange={(value) =>
                        handleProviderTypeChange(
                          editingConfig.id,
                          value as ChatProvider,
                        )
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose vendor" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="anthropic">Anthropic</SelectItem>
                        <SelectItem value="openai">OpenAI</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium">BASE_URL</div>
                  <Input
                    value={editingConfig.baseUrl}
                    onChange={(event) =>
                      updateProviderConfig(editingConfig.id, (config) => ({
                        ...config,
                        baseUrl: event.target.value,
                      }))
                    }
                    placeholder="https://your-proxy.example.com/v1"
                  />
                  <div className="text-muted-foreground text-xs">
                    Supports either the `/v1` prefix or a full
                    `/chat/completions` URL. Common OpenAI-compatible URL forms
                    are normalized automatically.
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium">API key</div>
                  <Input
                    type="password"
                    value={editingConfig.apiKey}
                    onChange={(event) =>
                      updateProviderConfig(editingConfig.id, (config) => ({
                        ...config,
                        apiKey: event.target.value,
                      }))
                    }
                    placeholder="sk-..."
                  />
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium">Models</div>
                  <Textarea
                    value={editingConfig.models.join("\n")}
                    onChange={(event) =>
                      updateProviderConfig(editingConfig.id, (config) => ({
                        ...config,
                        models: parseModelsInput(
                          event.target.value,
                          config.provider,
                        ),
                      }))
                    }
                    className="min-h-40 resize-none"
                    placeholder={[getDefaultModel(editingConfig.provider)].join(
                      "\n",
                    )}
                  />
                  <div className="text-muted-foreground text-xs">
                    One model per line. The top-left selector will use this
                    list.
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      isLoading={testingConfigId === editingConfig.id}
                      onClick={() => handleTestConfig(editingConfig)}
                    >
                      <Icons.check className="size-4" />
                      Test connection
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      disabled={providerConfigs.length <= 1}
                      onClick={() =>
                        handleRemoveProviderConfig(editingConfig.id)
                      }
                    >
                      <Icons.trash className="size-4" />
                      Remove
                    </Button>
                  </div>

                  <div className="text-muted-foreground text-xs">
                    API keys and endpoints stay in local browser storage only.
                  </div>
                </div>

                {testFeedback ? (
                  <div
                    className={cn(
                      "rounded-lg border px-3 py-2 text-sm",
                      testFeedback.type === "success"
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                        : "border-destructive/30 bg-destructive/10 text-destructive",
                    )}
                  >
                    {testFeedback.message}
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
