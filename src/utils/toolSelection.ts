import type { SkillOption } from "../types";

export const CORE_TOOL_OPTIONS = [
  { id: "filesystem", name: "File System" },
  { id: "terminal", name: "Terminal" },
  { id: "browser", name: "Browser" },
  { id: "network", name: "Network" },
] as const;

function dedupe(values: string[]) {
  return [...new Set(values)];
}

export function getSkillIdSet(skills: SkillOption[]) {
  return new Set(skills.map((skill) => skill.id));
}

export function normalizeSkillAndToolSelection(
  skills: string[] | null | undefined,
  allowedTools: string[] | null | undefined,
  knownSkillIds: Set<string>,
) {
  const selectedSkills = skills ?? [];
  const toolIds = allowedTools ?? [];
  const migratedSkills = toolIds.filter((id) => knownSkillIds.has(id));

  return {
    skills: dedupe([...selectedSkills, ...migratedSkills]),
    allowedTools: dedupe(toolIds.filter((id) => !knownSkillIds.has(id))),
  };
}

export function sanitizeAllowedTools(
  allowedTools: string[] | null | undefined,
  knownSkillIds: Set<string>,
) {
  return normalizeSkillAndToolSelection([], allowedTools, knownSkillIds).allowedTools;
}
