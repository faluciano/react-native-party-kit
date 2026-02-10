---
"@couch-kit/cli": minor
---

### Added: Asset manifest generation in `bundle` command

The `bundle` command now generates a `www-manifest.json` file listing all bundled assets. This manifest enables the new `useExtractAssets()` hook in `@couch-kit/host` to extract assets on Android without `react-native-fs`.

- `www-manifest.json` is automatically written to the output directory
- New `--manifest <path>` flag to also write the manifest to app source for TypeScript imports
