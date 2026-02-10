/**
 * Buffer management utilities for WebSocket per-client receive buffers.
 * Extracted into a standalone module so they can be tested without
 * react-native dependencies.
 */

import { Buffer } from "buffer";
import type { TcpSocketInstance } from "./declarations";

// Internal type for a TCP socket with our added management properties.
export interface ManagedSocket {
  socket: TcpSocketInstance;
  id: string;
  isHandshakeComplete: boolean;
  buffer: Buffer;
  /** Number of valid bytes currently in `buffer` (may be less than buffer.length). */
  bufferLength: number;
  lastPong: number;
}

/**
 * Append data to a managed socket's buffer, growing capacity geometrically
 * to avoid re-allocation on every TCP data event.
 */
export function appendToBuffer(managed: ManagedSocket, data: Buffer): void {
  const needed = managed.bufferLength + data.length;

  if (needed > managed.buffer.length) {
    // Grow by at least 2x or to fit the new data, whichever is larger
    const newCapacity = Math.max(managed.buffer.length * 2, needed);
    const grown = Buffer.alloc(newCapacity);
    managed.buffer.copy(grown, 0, 0, managed.bufferLength);
    managed.buffer = grown;
  }

  data.copy(managed.buffer, managed.bufferLength);
  managed.bufferLength = needed;
}

/**
 * Compact the buffer by discarding consumed bytes from the front.
 * If all data has been consumed, reset the length to 0 without re-allocating.
 */
export function compactBuffer(managed: ManagedSocket, consumed: number): void {
  const remaining = managed.bufferLength - consumed;
  if (remaining <= 0) {
    managed.bufferLength = 0;
    return;
  }
  // Shift remaining bytes to the front of the existing buffer
  managed.buffer.copy(managed.buffer, 0, consumed, managed.bufferLength);
  managed.bufferLength = remaining;
}
