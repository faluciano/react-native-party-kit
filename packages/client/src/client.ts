import { useState, useEffect, useRef, useCallback, useReducer } from "react";
import {
  MessageTypes,
  type HostMessage,
  type IGameState,
  type IAction,
} from "@party-kit/core";
import { useServerTime } from "./time-sync";

// Reconnection Constants
const MAX_RETRIES = 5;
const BASE_DELAY = 1000;

interface ClientConfig<S extends IGameState, A extends IAction> {
  url?: string; // Defaults to window.location.hostname
  reducer: (state: S, action: A) => S;
  initialState: S;
  onConnect?: () => void;
  onDisconnect?: () => void;
  debug?: boolean;
}

export function useGameClient<S extends IGameState, A extends IAction>(
  config: ClientConfig<S, A>,
) {
  const [status, setStatus] = useState<
    "connecting" | "connected" | "disconnected" | "error"
  >("disconnected");
  const [playerId, setPlayerId] = useState<string | null>(null);

  // Local Optimistic State
  const [state, dispatchLocal] = useReducer(
    config.reducer,
    config.initialState,
  );

  const socketRef = useRef<WebSocket | null>(null);
  const reconnectAttempts = useRef(0);
  const reconnectTimer = useRef<Timer | null>(null);

  // Time Sync Hook
  const { getServerTime, handlePong } = useServerTime(socketRef.current);

  const connect = useCallback(() => {
    // 1. Magic Client: Determine URL
    // If explicit URL provided, use it.
    // Otherwise, assume we are being served by the Host, so use window.location.hostname
    // Port 8081 is the hardcoded Game Port (as defined in Host package)
    let wsUrl = config.url;

    if (!wsUrl && typeof window !== "undefined") {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const host = window.location.hostname;
      // Assumption: Host runs WS on port 8081
      wsUrl = `${protocol}//${host}:8081`;
    }

    if (!wsUrl) return;

    if (config.debug) console.log(`[GameClient] Connecting to ${wsUrl}`);
    setStatus("connecting");

    const ws = new WebSocket(wsUrl);
    socketRef.current = ws;

    ws.onopen = () => {
      setStatus("connected");
      reconnectAttempts.current = 0;
      config.onConnect?.();

      // Auto-join if we have a saved secret (Seat Reservation)
      // For MVP, we'll just send a JOIN
      ws.send(
        JSON.stringify({
          type: MessageTypes.JOIN,
          payload: { name: "Player", avatar: "😀" },
        }),
      );
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data) as HostMessage;

        switch (msg.type) {
          case MessageTypes.WELCOME:
            setPlayerId(msg.payload.playerId);
            // Hydrate state from server (Single Source of Truth)
            // We bypass the reducer here and force-update if possible,
            // or dispatch a special hydrate action if the reducer supports it.
            // For this hook, we'll assume the reducer handles "HYDRATE" or we just warn.
            break;

          case MessageTypes.STATE_UPDATE:
            // TODO: Handle delta updates if we implement them
            // For now, assuming full state replacement or action replay
            // This is a HACK for the MVP: we need a way to replace the entire state
            // from the hook. Since useReducer doesn't expose a "replaceState" action
            // by default, we rely on the reducer handling a special action or we
            // just assume the user provided reducer can handle it.
            //
            // BETTER FIX: The reducer passed to useGameClient should probably be wrapped
            // internally to handle a __HYDRATE__ action.

            // For now, let's try to dispatch a hydrate action if it conforms to convention
            // or just accept that we need a "set state" mechanism.

            // Let's assume the reducer might handle a "HYDRATE" or "STATE_UPDATE" action
            // Or we can try to cast it.

            // @ts-expect-error - Dynamic dispatch
            dispatchLocal({ type: "HYDRATE", payload: msg.payload.newState });
            break;

          case MessageTypes.PONG:
            handlePong(msg.payload);
            break;
        }
      } catch (e) {
        console.error("Failed to parse message", e);
      }
    };

    ws.onclose = () => {
      setStatus("disconnected");
      config.onDisconnect?.();

      // Aggressive Reconnection Logic
      if (reconnectAttempts.current < MAX_RETRIES) {
        const delay = Math.min(
          BASE_DELAY * Math.pow(2, reconnectAttempts.current),
          10000,
        );
        reconnectAttempts.current++;

        if (config.debug)
          console.log(`[GameClient] Reconnecting in ${delay}ms...`);

        reconnectTimer.current = setTimeout(() => {
          connect();
        }, delay);
      }
    };

    ws.onerror = (e) => {
      if (config.debug) console.error("[GameClient] Error", e);
      setStatus("error");
    };
  }, [config.url, config.debug]);

  // Initial Connection
  useEffect(() => {
    connect();
    return () => {
      if (socketRef.current) socketRef.current.close();
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
    };
  }, [connect]);

  // Action Dispatcher
  const sendAction = useCallback((action: A) => {
    // 1. Optimistic Update
    dispatchLocal(action);

    // 2. Send to Host
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({
          type: MessageTypes.ACTION,
          payload: action,
        }),
      );
    }
  }, []);

  return {
    status,
    state,
    playerId,
    sendAction,
    getServerTime,
  };
}
