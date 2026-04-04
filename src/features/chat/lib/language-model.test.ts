import { APICallError } from "ai";
import { describe, expect, it } from "vitest";

import {
  formatChatProviderErrorMessage,
  resolveChatBaseURL,
} from "@/features/chat/lib/language-model";

describe("resolveChatBaseURL", () => {
  it("adds /v1 for root-level OpenAI-compatible base URLs", () => {
    expect(resolveChatBaseURL("openai", "https://example.com")).toBe(
      "https://example.com/v1",
    );
  });

  it("strips a pasted chat completions endpoint back to the API prefix", () => {
    expect(
      resolveChatBaseURL(
        "openai",
        "https://example.com/custom/v1/chat/completions",
      ),
    ).toBe("https://example.com/custom/v1");
  });

  it("does not rewrite non-OpenAI providers", () => {
    expect(
      resolveChatBaseURL("anthropic", "https://example.com/v1/messages"),
    ).toBe("https://example.com/v1/messages");
  });
});

describe("formatChatProviderErrorMessage", () => {
  it("includes upstream response details for invalid JSON compatibility errors", () => {
    const error = new APICallError({
      message: "Invalid JSON response",
      url: "https://example.com/v1/chat/completions",
      requestBodyValues: {},
      statusCode: 404,
      responseBody:
        "<html><body>Cannot POST /v1/chat/completions</body></html>",
    });

    expect(
      formatChatProviderErrorMessage(error, "openai", "https://example.com"),
    ).toContain(
      "Invalid JSON response (HTTP 404): <html><body>Cannot POST /v1/chat/completions</body></html>",
    );
    expect(
      formatChatProviderErrorMessage(error, "openai", "https://example.com"),
    ).toContain("Verify BASE_URL is the API prefix");
  });
});
