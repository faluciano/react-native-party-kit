---
"@party-kit/host": minor
"@party-kit/client": minor
---

Change default WebSocket port convention from HTTP+1 to HTTP+2 to avoid conflicts with Metro bundler (which uses port 8081). Add configurable `wsPort` option to client config. Both host and client now derive WS port as `httpPort + 2` by default (e.g., HTTP 8080 -> WS 8082).
