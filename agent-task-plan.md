# Fix Telegram Pairing Panel Showing After Pairing

## Summary
- Make Telegram pairing visibility depend on one reliable linked-state check.
- Stop treating the instructional pairing text as an implicit success state.
- Make Telegram status detection resilient across newer and legacy OpenClaw config layouts.

## Implementation Changes
- Update `src-tauri/src/main.rs` so Telegram link checks use a fallback chain:
  1. `channels.telegram.accounts.default.dmPolicy`
  2. legacy top-level Telegram `dmPolicy`
  3. direct parsing of `~/.openclaw/openclaw.json` when CLI lookup fails
- Keep `telegram_pairing_status_from_dm_policy` as the single policy interpreter.
- Update `src/App.tsx` so the Telegram pairing card only renders when Telegram is actually unpaired.
- Remove the `READY` rendering derived from `pairingCode.includes("Ready")`.
- Add regression coverage in Rust and Vitest.
- Validate with `npm test` and `npm run tauri dev`.
- Commit and push after validation succeeds.
