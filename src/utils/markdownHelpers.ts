/**
 * Update a specific field in an IDENTITY.md style markdown document.
 * Matches patterns like: - **Name:** value
 */
export function updateIdentityField(content: string, key: "Name" | "Vibe" | "Emoji", value: string): string {
  if (!content) return content;
  const regex = new RegExp(`(- \\*\\*${key}:\\*\\* )(.*)`, "g");
  return content.replace(regex, `$1${value}`);
}

/**
 * Update the "Serve [Name]." line in SOUL.md content.
 */
export function updateSoulMission(content: string, name: string): string {
  if (!content) return content;
  const regex = /(Serve )(.*?)(\.?)$/gm;
  if (regex.test(content)) {
    return content.replace(regex, `$1${name}.`);
  }
  return content;
}
