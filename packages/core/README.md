# @party-kit/core

Shared TypeScript definitions and protocol logic for the React Native Party Kit.

## Purpose

This package ensures that both the Host (TV) and Client (Phone) speak the exact same language. By sharing types, we get end-to-end type safety across your entire full-stack game.

## Installation

```bash
bun add @party-kit/core
```

## Key Exports

### `createGameReducer`

A helper to define type-safe reducers that can be shared between the Host and Client.

**Important:** This wrapper automatically handles the `HYDRATE` system action, which synchronizes the client's state with the host. You do not need to implement this yourself.

```typescript
import { createGameReducer } from "@party-kit/core";
import { GameState, GameAction } from "./types";

export const gameReducer = createGameReducer<GameState, GameAction>(
  (state, action) => {
    switch (action.type) {
      case "SCORE":
        return { ...state, score: state.score + 1 };
      default:
        return state;
    }
  },
);
```

### `IGameState` & `IAction`

Base interfaces that your game types should extend to ensure compatibility with the Party Kit engine.

```typescript
import { IGameState, IAction } from "@party-kit/core";

export interface MyState extends IGameState {
  score: number;
  round: number;
}

export interface MyAction extends IAction {
  type: "SCORE" | "NEXT_ROUND";
}
```

### Protocol types

Low-level message types and constants used by host/client:

- `ClientMessage`
- `HostMessage`
- `MessageTypes`

These are useful when debugging traffic or building a custom host/client.

### Protocol definitions

At the protocol level, the client sends messages like `JOIN`, `ACTION`, `PING`, and the host responds with messages like `WELCOME`, `STATE_UPDATE`, and `PONG`.
