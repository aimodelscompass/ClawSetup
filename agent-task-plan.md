# Restore Channel-Aware Pairing Preservation on Reconfigure

## Summary
- Restore the earlier reconfigure behavior so unchanged Telegram and WhatsApp messaging setups do not trigger pairing again at the end of setup.
- Make pairing/link state channel-aware instead of using Telegram state as the global gate for all messaging flows.
- Cover both local and remote status checks and add regression tests for the channel-aware comparison logic and final pairing conditions.

## Implementation Changes
- Update `src/App.tsx` to compute preserve-state and final pairing prompts from the selected messaging channel plus channel-specific link status.
- Add backend helpers in `src-tauri/src/main.rs` to query messaging link state per channel, including WhatsApp linked-session detection.
- Add regression tests in Rust and TypeScript for channel-aware pairing preservation and messaging-setting comparisons.
- Validate with `npm test` and `npm run tauri dev`.
- Commit and push after validation succeeds.
