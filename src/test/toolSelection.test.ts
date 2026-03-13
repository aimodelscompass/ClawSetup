import { describe, expect, it } from "vitest";

import { AVAILABLE_SKILLS } from "../presets/availableSkills";
import {
  CORE_TOOL_OPTIONS,
  getSkillIdSet,
  normalizeSkillAndToolSelection,
  sanitizeAllowedTools,
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
      allowedTools: ["filesystem"],
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
    ).toEqual(["browser", "network"]);
  });

  it("keeps core tool ids distinct from skill ids", () => {
    const overlap = CORE_TOOL_OPTIONS.filter((tool) => knownSkillIds.has(tool.id));
    expect(overlap).toEqual([]);
  });
});
