# Clawnetes Auth and Model Catalog Refresh

## Goal
- Fix advanced configuration auth prompts for all referenced remote providers.
- Add OAuth entry points for supported model providers through OpenClaw.
- Defer OAuth browser launches until the end of setup, after OpenClaw is installed/configured.
- Refresh provider model catalogs and defaults from `openclaw models list --all --json`.

## Progress
- [x] Inspect current React/Tauri auth and model catalog flow.
- [x] Refactor shared provider auth state and advanced auth UI.
- [x] Add OpenClaw-backed OAuth login/status commands and preserve OAuth profile fields.
- [x] Defer OAuth execution to the final setup step after installation.
- [x] Refresh model catalogs/defaults/preset references from OpenClaw output.
- [x] Add and update tests.
- [x] Run `npm test`.
- [x] Run `npm run tauri dev`.
- [x] Commit and push after successful validation.

## Notes
- Delegate provider OAuth to `openclaw models auth login`; do not implement provider-specific browser OAuth in Clawnetes.
- Keep local providers (`ollama`, `lmstudio`, `local`) exempt from remote auth requirements.
- Warn on missing provider auth but do not block wizard progression.
