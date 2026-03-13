import { describe, expect, it } from "vitest";

import { AVAILABLE_SKILLS } from "../presets/availableSkills";
import {
  createInheritedToolPolicy,
  getEffectiveEnabledToolIds,
  getEffectiveToolPolicy,
  TOOL_DEFINITIONS,
  deriveToolPolicyFromLegacy,
  getSkillIdSet,
  normalizeSkillAndToolSelection,
  normalizeToolPolicy,
  sanitizeAllowedTools,
  setToolProfile,
} from "../utils/toolSelection";

describe("toolSelection", () => {
  const knownSkillIds = getSkillIdSet(AVAILABLE_SKILLS);

  it("moves skill ids from allowed tools into skills", () => {
    expect(
      normalizeSkillAndToolSelection(
        ["github"],
        ["filesystem", "github", "weather", "filesystem"],
        knownSkillIds,
      ),
    ).toEqual({
      skills: ["github", "weather"],
      allowedTools: ["read", "write", "edit", "apply_patch"],
    });
  });

  it("keeps unknown non-skill tool ids in allowed tools", () => {
    expect(
      normalizeSkillAndToolSelection(
        [],
        ["exec", "read", "write"],
        knownSkillIds,
      ),
    ).toEqual({
      skills: [],
      allowedTools: ["exec", "read", "write"],
    });
  });

  it("strips skill ids when sanitizing allowed tools", () => {
    expect(
      sanitizeAllowedTools(["browser", "github", "network", "github"], knownSkillIds),
    ).toEqual(["browser", "web_search", "web_fetch"]);
  });

  it("keeps tool ids distinct from skill ids", () => {
    const overlap = TOOL_DEFINITIONS.filter((tool) => knownSkillIds.has(tool.id));
    expect(overlap).toEqual([]);
  });

  it("maps legacy all-tools mode to the full profile", () => {
    expect(deriveToolPolicyFromLegacy("all", [], [], knownSkillIds)).toEqual({
      profile: "full",
      allow: [],
      deny: [],
      elevatedEnabled: false,
      inherit: false,
    });
  });

  it("normalizes alias ids inside tool policies", () => {
    expect(
      normalizeToolPolicy({ profile: "minimal", allow: ["sessions_status", "bash", "apply-patch"], deny: [] }, knownSkillIds),
    ).toEqual({
      profile: "minimal",
      allow: ["session_status", "exec", "apply_patch"],
      deny: [],
      elevatedEnabled: false,
      inherit: false,
    });
  });

  it("resets overrides when changing the selected profile", () => {
    expect(
      setToolProfile({
        profile: "minimal",
        allow: ["read"],
        deny: ["session_status"],
        elevatedEnabled: true,
      }, "coding"),
    ).toEqual({
      profile: "coding",
      allow: [],
      deny: [],
      elevatedEnabled: true,
      inherit: false,
    });
  });

  it("matches the current OpenClaw coding tool profile", () => {
    const codingTools = getEffectiveEnabledToolIds({ profile: "coding", allow: [], deny: [] });

    expect(TOOL_DEFINITIONS.map((tool) => tool.id)).toContain("sessions_yield");
    expect(TOOL_DEFINITIONS.map((tool) => tool.id)).toContain("subagents");
    expect(TOOL_DEFINITIONS.map((tool) => tool.id)).not.toContain("bash");
    expect(codingTools.has("sessions_yield")).toBe(true);
    expect(codingTools.has("subagents")).toBe(true);
    expect(codingTools.has("cron")).toBe(true);
    expect(codingTools.has("browser")).toBe(false);
  });

  it("treats omitted top-level policies as OpenClaw full access", () => {
    expect(deriveToolPolicyFromLegacy("all", [], [], knownSkillIds)).toEqual({
      profile: "full",
      allow: [],
      deny: [],
      elevatedEnabled: false,
      inherit: false,
    });
  });

  it("resolves inherited agent policies from the parent baseline", () => {
    expect(getEffectiveToolPolicy(
      createInheritedToolPolicy(),
      { profile: "full", allow: [], deny: [], elevatedEnabled: false },
    )).toEqual({
      profile: "full",
      allow: [],
      deny: [],
      elevatedEnabled: false,
      inherit: false,
    });

    expect(getEffectiveToolPolicy(
      createInheritedToolPolicy(),
      { profile: "coding", allow: ["browser"], deny: [], elevatedEnabled: true },
    )).toEqual({
      profile: "coding",
      allow: ["browser"],
      deny: [],
      elevatedEnabled: true,
      inherit: false,
    });
  });
});
