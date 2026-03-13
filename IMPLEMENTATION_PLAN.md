# Remove Skill Duplication From Allowed Tools

## Goal
- Ensure skills are configured only in the Skills selectors and do not reappear under Allowed Tools.
- Prevent skill IDs from being saved into `allowed_tools`.
- Migrate existing configs that incorrectly stored skill IDs in `allowed_tools` by enabling those skills automatically.

## Progress
- [x] Inspect the wizard UI, config load flow, and payload construction paths.
- [x] Confirm the duplication source in both single-agent and multi-agent flows.
- [x] Add shared normalization helpers for tool/skill migration and sanitization.
- [x] Update the Allowed Tools UI to show only real tools.
- [x] Apply migration/sanitization during config load, comparison, and save.
- [x] Add tests for migration, sanitization, and tool-only UI options.
- [x] Run `npm test`.
- [x] Run `npm run tauri dev`.
- [ ] Commit and push after validation succeeds.

## Notes
- Existing unrelated worktree changes must be preserved.
- Known skill IDs found inside `allowed_tools` should move into `skills`.
- Unknown non-skill tool IDs should remain untouched.
