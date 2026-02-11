---
"@couch-kit/core": minor
"@couch-kit/client": minor
---

Add compiled build output — packages now ship JS bundles in `dist/` and TypeScript declarations in `lib/` instead of raw `.ts` source. This ensures compatibility with bundlers that don't transpile `node_modules`.
