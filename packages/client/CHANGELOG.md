# @party-kit/client

## 0.2.0

### Minor Changes

- 38bc20e: Change default WebSocket port convention from HTTP+1 to HTTP+2 to avoid conflicts with Metro bundler (which uses port 8081). Add configurable `wsPort` option to client config. Both host and client now derive WS port as `httpPort + 2` by default (e.g., HTTP 8080 -> WS 8082).

## 0.1.0

### Minor Changes

- - **Session Recovery:** Added support for session recovery. The client now stores a secret and sends it on join. The host tracks these secrets and restores the session (mapping the new socket to the old session).
  - **Automatic Hydration:** The client now automatically handles the `HYDRATE` action. Users no longer need to implement this in their reducer.
  - **Large Message Support:** The Host WebSocket implementation now supports messages larger than 64KB (64-bit frame lengths).

### Patch Changes

- Updated dependencies
  - @party-kit/core@0.1.0

## 0.0.4

### Patch Changes

- Fix dependency resolution for @party-kit/core

## 0.0.3

### Patch Changes

- Fix dependency mismatch: update dependencies to point to published @party-kit/core@0.0.2

## 0.0.2

### Patch Changes

- Initial public release. Removed example apps, refactored logging, and prepared strictly typed packages for usage.
- Updated dependencies
  - @party-kit/core@0.0.2
