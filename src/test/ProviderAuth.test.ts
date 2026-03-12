import { describe, expect, it } from "vitest";

import { buildDeferredOAuthQueue, buildReferencedProviders, createDefaultProviderAuth, getProviderAuthOptions, isOAuthMethod, normalizeProviderAuths } from "../utils/providerAuth";

describe("providerAuth utilities", () => {
  it("builds a deduplicated set of referenced remote providers", () => {
    expect(buildReferencedProviders({
      primaryModel: "anthropic/claude-opus-4-6",
      fallbackModels: ["openai/gpt-5.4", "google/gemini-3.1-pro-preview", "openai/gpt-5.4"],
      agentConfigs: [
        { model: "lmstudio/local-model", fallbackModels: [] },
        { model: "xai/grok-4.1-fast", fallbackModels: ["local/custom"] },
      ],
    })).toEqual(["anthropic", "google", "openai", "xai"]);
  });

  it("normalizes auth state for the active provider", () => {
    const auths = normalizeProviderAuths({}, "openai", "sk-test", "token");
    expect(auths.openai.token).toBe("sk-test");
    expect(auths.openai.auth_method).toBe("token");
  });

  it("includes OAuth options for supported providers", () => {
    const openaiOptions = getProviderAuthOptions("openai").map(option => option.value);
    expect(openaiOptions).toContain("openai-codex");
  });

  it("marks non-token auth methods as OAuth", () => {
    expect(isOAuthMethod("openai-codex")).toBe(true);
    expect(isOAuthMethod("token")).toBe(false);
  });

  it("creates a default provider auth record", () => {
    expect(createDefaultProviderAuth("anthropic")).toEqual({
      auth_method: "token",
      token: "",
      profile_key: null,
      profile: null,
      oauth_provider_id: "anthropic",
    });
  });

  it("builds a deferred OAuth queue for providers and OAuth skills", () => {
    const queue = buildDeferredOAuthQueue({
      referencedProviders: ["anthropic"],
      providerAuths: {
        anthropic: {
          auth_method: "claude-cli",
          token: "",
          profile_key: null,
          profile: null,
          oauth_provider_id: "anthropic",
        },
      },
      selectedSkills: ["gemini"],
      availableSkills: [
        {
          id: "gemini",
          name: "Gemini CLI",
          desc: "Gemini CLI",
          requiresAuth: true,
          authMode: "oauth",
          oauthBaseProvider: "google",
          oauthMethod: "google-gemini-cli",
          oauthProviderId: "google-gemini-cli",
        },
      ],
    });

    expect(queue).toEqual([
      expect.objectContaining({ id: "provider:anthropic", targetProvider: "anthropic", authMethod: "claude-cli" }),
      expect.objectContaining({ id: "skill:gemini", targetProvider: "google", authMethod: "google-gemini-cli" }),
    ]);
  });
});
