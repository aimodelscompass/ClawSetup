# Provider Auth Cleanup Plan

## Objective
- Simplify provider auth selection UI.
- Remove unsupported Google Vertex and deprecated browser auth options.
- Preserve Anthropic API key and pasted setup-token flows.

## Implementation Outline
- Update frontend provider auth option catalog and provider/model mappings.
- Refactor `App.tsx` to render inline provider auth controls without the boxed wrapper or generic auth-method dropdown.
- Remove Vertex AI from provider/model datasets.
- Update Rust auth normalization and deprecated-provider handling.
- Add/update TypeScript and Rust tests.
- Run `npm test` and `npm run tauri dev`.
- Commit and push once checks pass.
