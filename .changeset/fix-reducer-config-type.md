---
"@couch-kit/client": patch
"@couch-kit/host": patch
---

fix: simplify reducer config type to accept plain `(state, action) => state`

Both `ClientConfig.reducer` and `GameHostConfig.reducer` previously required
`(state: S, action: A | InternalAction<S>) => S`, forcing consumers to handle
internal actions even though the framework wraps the reducer with
`createGameReducer` internally. The config types now accept
`(state: S, action: A) => S`, matching how user reducers are actually written.

Also wraps the host provider's `useReducer` call with `createGameReducer` (the
client already did this) so internal actions are handled transparently.
