# Tool Policy Parity Plan

## Objective
- Align Clawnetes tool policies with the actual OpenClaw tool model and effective defaults.
- Preserve inherited/default agent tool state when loading and saving existing OpenClaw configs.
- Ensure Clawnetes and the OpenClaw Web UI show the same enabled tools for the same agent.

## Implementation Outline
- Update the frontend tool catalog and profile definitions to match the current OpenClaw tool list.
- Add explicit inherited/default handling for per-agent tool policies in Clawnetes.
- Fix App load/save/comparison logic so omitted tool config resolves correctly and round-trips without false rewrites.
- Add regression tests for tool profile resolution and inherited agent tool state.
- Run `npm test`.
- Run `npm run tauri dev`.
- Commit and push after validation succeeds.
