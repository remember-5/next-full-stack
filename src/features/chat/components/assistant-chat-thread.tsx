"use client";

import type { EnrichedPartState } from "@assistant-ui/core/react";
import {
  ComposerPrimitive,
  MessagePrimitive,
  ThreadPrimitive,
  useAui,
  useAuiState,
} from "@assistant-ui/react";
import { MarkdownTextPrimitive } from "@assistant-ui/react-markdown";
import remarkGfm from "remark-gfm";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AssistantChatThreadProps = {
  disabled: boolean;
  errorMessage?: string;
};

const starterPrompts = [
  "Summarize the latest dashboard activity for me.",
  "Draft a concise product update based on today's work.",
  "Review this setup and suggest the next engineering step.",
];

const markdownClassName = [
  "max-w-none break-words text-[15px] leading-7",
  "[&_p]:mb-4 [&_p:last-child]:mb-0",
  "[&_ul]:mb-4 [&_ul]:ml-5 [&_ul]:list-disc",
  "[&_ol]:mb-4 [&_ol]:ml-5 [&_ol]:list-decimal",
  "[&_li]:mb-1",
  "[&_a]:font-medium [&_a]:underline [&_a]:underline-offset-4",
  "[&_pre]:mt-4 [&_pre]:overflow-x-auto [&_pre]:rounded-2xl [&_pre]:border [&_pre]:p-4",
  "[&_code]:rounded [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-[0.9em]",
  "[&_pre_code]:bg-transparent [&_pre_code]:p-0",
].join(" ");

function MessagePart({
  isUser,
  part,
}: {
  isUser: boolean;
  part: EnrichedPartState;
}) {
  switch (part.type) {
    case "text":
      return (
        <MarkdownTextPrimitive
          className={cn(
            markdownClassName,
            isUser
              ? "[&_a]:text-foreground [&_code]:bg-background/70 [&_pre]:border-border/70 [&_pre]:bg-background/70"
              : "[&_a]:text-foreground [&_pre]:border-border/70 [&_pre]:bg-muted/35 [&_code]:bg-muted",
          )}
          remarkPlugins={[remarkGfm]}
        />
      );

    case "reasoning":
      return (
        <div className="bg-muted/35 text-muted-foreground border-border/60 rounded-2xl border px-3 py-2 text-xs leading-5 whitespace-pre-wrap">
          {part.text}
        </div>
      );

    case "source":
      return (
        <a
          href={part.url}
          target="_blank"
          rel="noreferrer"
          className={cn(
            "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
            isUser
              ? "border-border/70 bg-background/70 text-foreground hover:bg-background"
              : "border-border/60 bg-muted/40 text-foreground hover:bg-muted/60",
          )}
        >
          <Icons.externalLink className="size-3.5" />
          <span className="truncate">{part.title ?? part.url}</span>
        </a>
      );

    case "image":
      return (
        <a
          href={part.image}
          target="_blank"
          rel="noreferrer"
          className={cn(
            "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium transition-colors",
            isUser
              ? "border-border/70 bg-background/70 text-foreground hover:bg-background"
              : "border-border/60 bg-muted/40 hover:bg-muted/55",
          )}
        >
          <Icons.media className="size-4" />
          <span>{part.filename ?? "Open image"}</span>
        </a>
      );

    case "file":
      return (
        <div
          className={cn(
            "flex items-center gap-3 rounded-xl border px-3 py-2 text-xs",
            isUser
              ? "border-border/70 bg-background/70 text-foreground"
              : "border-border/60 bg-muted/35",
          )}
        >
          <Icons.page className="size-4 shrink-0" />
          <div className="min-w-0">
            <div className="truncate font-medium">
              {part.filename ?? "Attachment"}
            </div>
            <div className="opacity-70">{part.mimeType}</div>
          </div>
        </div>
      );

    case "tool-call":
      return (
        <div
          className={cn(
            "space-y-2 rounded-2xl border px-3 py-3 text-xs",
            isUser
              ? "border-border/70 bg-background/70 text-foreground"
              : "border-border/60 bg-muted/35 border-dashed",
          )}
        >
          <div className="font-medium">Tool · {part.toolName}</div>
          <pre className="overflow-x-auto whitespace-pre-wrap opacity-80">
            {part.result !== undefined
              ? JSON.stringify(part.result, null, 2)
              : part.argsText}
          </pre>
        </div>
      );

    case "data":
      return (
        <div
          className={cn(
            "space-y-2 rounded-2xl border px-3 py-3 text-xs",
            isUser
              ? "border-border/70 bg-background/70 text-foreground"
              : "border-border/60 bg-muted/35",
          )}
        >
          <div className="font-medium">Data · {part.name}</div>
          <pre className="overflow-x-auto whitespace-pre-wrap opacity-80">
            {JSON.stringify(part.data, null, 2)}
          </pre>
        </div>
      );

    default:
      return null;
  }
}

function ChatMessage({ role }: { role: "assistant" | "system" | "user" }) {
  const isUser = role === "user";
  const isSystem = role === "system";

  return (
    <MessagePrimitive.Root
      className={cn(
        "flex w-full",
        isSystem
          ? "justify-center py-3"
          : isUser
            ? "justify-end py-1.5"
            : "justify-start py-2.5",
      )}
    >
      {isSystem ? (
        <div className="text-muted-foreground max-w-2xl text-center text-sm">
          <MessagePrimitive.Parts>
            {({ part }) => <MessagePart isUser={false} part={part} />}
          </MessagePrimitive.Parts>
        </div>
      ) : isUser ? (
        <div className="flex w-full max-w-[min(82%,52rem)] flex-col items-end">
          <div className="bg-muted/68 border-border/50 w-full rounded-[24px] border px-5 py-4 shadow-sm">
            <div className="space-y-3">
              <MessagePrimitive.Parts>
                {({ part }) => <MessagePart isUser part={part} />}
              </MessagePrimitive.Parts>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex w-full max-w-[52rem] items-start gap-3.5">
          <div className="bg-muted/38 text-foreground/90 mt-1 flex size-7 shrink-0 items-center justify-center rounded-full">
            <Icons.sparkles className="size-3.5" />
          </div>
          <div className="text-foreground min-w-0 flex-1 px-0.5 pt-0.5">
            <div className="space-y-3">
              <MessagePrimitive.Parts>
                {({ part }) => <MessagePart isUser={false} part={part} />}
              </MessagePrimitive.Parts>
            </div>
          </div>
        </div>
      )}
    </MessagePrimitive.Root>
  );
}

function EmptyState({ disabled }: { disabled: boolean }) {
  const isEmpty = useAuiState((state) => state.thread.messages.length === 0);

  if (!isEmpty || disabled) {
    return null;
  }

  return (
    <div className="mx-auto flex min-h-[36vh] w-full max-w-3xl flex-col items-center justify-center gap-6 px-6 py-8 text-center">
      <div className="bg-muted/42 text-foreground border-border/50 rounded-full border p-3 shadow-sm">
        <Icons.sparkles className="size-5" />
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-[-0.03em] sm:text-3xl">
          How can I help?
        </h2>
        <p className="text-muted-foreground max-w-lg text-sm leading-6 sm:text-[15px]">
          Choose a model above, then start with a prompt or ask anything about
          your work.
        </p>
      </div>

      <div className="grid w-full max-w-3xl gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {starterPrompts.map((prompt) => (
          <ThreadPrimitive.Suggestion
            key={prompt}
            prompt={prompt}
            send
            className="border-border/60 bg-background/80 hover:bg-muted/55 inline-flex min-h-16 items-start gap-2 rounded-2xl border px-4 py-3 text-left text-sm shadow-sm transition-colors"
          >
            <Icons.sparkles className="text-muted-foreground mt-0.5 size-4 shrink-0" />
            <span className="line-clamp-2">{prompt}</span>
          </ThreadPrimitive.Suggestion>
        ))}
      </div>
    </div>
  );
}

function Composer({ disabled, errorMessage }: AssistantChatThreadProps) {
  const api = useAui();
  const isBusy = useAuiState((state) => state.thread.isRunning);
  const helperText = disabled
    ? "Add an API key from the top-right settings to start chatting."
    : "Shift+Enter for a new line.";

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-3">
      <ComposerPrimitive.Root className="border-border/60 bg-background/96 focus-within:border-foreground/12 flex flex-col gap-3 rounded-[32px] border p-3.5 shadow-[0_1px_0_rgba(255,255,255,0.04),0_28px_80px_-36px_rgba(0,0,0,0.78)] backdrop-blur-xl transition-colors">
        <ComposerPrimitive.Input
          placeholder={
            disabled
              ? "Open the top-right settings to add an API key..."
              : "Ask anything..."
          }
          submitMode="enter"
          disabled={disabled || isBusy}
          className="text-foreground placeholder:text-muted-foreground max-h-56 min-h-[64px] w-full resize-none border-0 bg-transparent px-1.5 text-[15px] leading-7 outline-none"
        />

        <div className="border-border/40 flex flex-col gap-3 border-t px-1 pt-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-muted-foreground text-[11px]">{helperText}</div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {isBusy ? (
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="border-border/55 bg-background/80 hover:bg-muted size-10 rounded-full"
                onClick={() => api.thread().cancelRun()}
              >
                <Icons.close className="size-4" />
                <span className="sr-only">Stop</span>
              </Button>
            ) : null}

            <ComposerPrimitive.Send
              disabled={disabled}
              className="bg-foreground text-background hover:bg-foreground/92 inline-flex size-10 items-center justify-center rounded-full shadow-sm transition-colors disabled:pointer-events-none disabled:opacity-50"
            >
              <Icons.send className="size-4" />
              <span className="sr-only">Send message</span>
            </ComposerPrimitive.Send>
          </div>
        </div>
      </ComposerPrimitive.Root>

      {errorMessage ? (
        <div className="text-destructive px-2 text-sm">
          Request failed: {errorMessage}
        </div>
      ) : null}
    </div>
  );
}

export default function AssistantChatThread({
  disabled,
  errorMessage,
}: AssistantChatThreadProps) {
  return (
    <ThreadPrimitive.Root className="from-muted/8 via-background to-background flex min-h-0 flex-1 flex-col bg-gradient-to-b">
      <ThreadPrimitive.Viewport className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5 md:px-10 md:py-8">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-4">
          <EmptyState disabled={disabled} />

          <ThreadPrimitive.Messages>
            {({ message }) => <ChatMessage role={message.role} />}
          </ThreadPrimitive.Messages>
        </div>
      </ThreadPrimitive.Viewport>

      <div className="from-background via-background/96 bg-gradient-to-t to-transparent px-4 pt-8 pb-6 md:px-6">
        <Composer disabled={disabled} errorMessage={errorMessage} />
      </div>
    </ThreadPrimitive.Root>
  );
}
