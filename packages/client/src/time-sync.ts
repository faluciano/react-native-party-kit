import { useState, useEffect, useRef, useCallback } from 'react';
import { MessageTypes, type ClientMessage, type HostMessage } from '@party-kit/core';

interface TimeSyncState {
  offset: number;  // Difference between server time and local time
  rtt: number;     // Round Trip Time
}

export function useServerTime(socket: WebSocket | null) {
  const [timeSync, setTimeSync] = useState<TimeSyncState>({ offset: 0, rtt: 0 });
  
  // Ref to track ping timestamps
  const pings = useRef<Map<string, number>>(new Map());

  // Function to get current server time
  const getServerTime = useCallback(() => {
    return Date.now() + timeSync.offset;
  }, [timeSync.offset]);

  // Handle PONG messages
  const handlePong = useCallback((payload: { id: string, origTimestamp: number, serverTime: number }) => {
    const now = Date.now();
    const sentTime = pings.current.get(payload.id);
    
    if (sentTime) {
      const rtt = now - sentTime;
      const latency = rtt / 2;
      
      // Calculate offset: ServerTime = ClientTime + Offset
      // Offset = ServerTime - ClientTime
      // We approximate ServerTime as payload.serverTime + latency
      const expectedServerTime = payload.serverTime + latency;
      const offset = expectedServerTime - now;

      // Simple smoothing could go here, but direct update is fine for MVP
      setTimeSync({ offset, rtt });
      pings.current.delete(payload.id);
    }
  }, []);

  // Periodic Sync
  useEffect(() => {
    if (!socket || socket.readyState !== WebSocket.OPEN) return;

    const sync = () => {
      const id = Math.random().toString(36).substring(7);
      const timestamp = Date.now();
      pings.current.set(id, timestamp);
      
      socket.send(JSON.stringify({
        type: MessageTypes.PING,
        payload: { id, timestamp }
      }));
    };

    // Initial sync
    sync();

    // Sync every 5 seconds
    const interval = setInterval(sync, 5000);
    return () => clearInterval(interval);
  }, [socket]);

  return { getServerTime, rtt: timeSync.rtt, handlePong };
}
