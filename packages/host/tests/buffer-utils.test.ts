import { describe, expect, test } from "bun:test";
import { Buffer } from "buffer";
import { appendToBuffer, compactBuffer } from "../src/buffer-utils";
import type { ManagedSocket } from "../src/buffer-utils";
import type { TcpSocketInstance } from "../src/declarations";

/** Creates a ManagedSocket with only the buffer-related fields populated. */
function createManagedSocket(capacity: number): ManagedSocket {
  return {
    socket: {} as TcpSocketInstance,
    id: "test",
    isHandshakeComplete: false,
    buffer: Buffer.alloc(capacity),
    bufferLength: 0,
    lastPong: 0,
  };
}

describe("appendToBuffer", () => {
  test("should append data to an empty buffer", () => {
    const managed = createManagedSocket(16);
    const data = Buffer.from("hello");

    appendToBuffer(managed, data);

    expect(managed.bufferLength).toBe(5);
    expect(managed.buffer.toString("utf8", 0, managed.bufferLength)).toBe(
      "hello",
    );
  });

  test("should append data to a buffer with existing content", () => {
    const managed = createManagedSocket(16);
    appendToBuffer(managed, Buffer.from("hello"));
    appendToBuffer(managed, Buffer.from(" world"));

    expect(managed.bufferLength).toBe(11);
    expect(managed.buffer.toString("utf8", 0, managed.bufferLength)).toBe(
      "hello world",
    );
  });

  test("should double capacity when buffer is too small", () => {
    const managed = createManagedSocket(4);
    const data = Buffer.from("hello world");

    appendToBuffer(managed, data);

    // Original capacity was 4, data is 11 bytes
    // Math.max(4 * 2, 11) = 11, so buffer should be at least 11
    expect(managed.buffer.length).toBeGreaterThanOrEqual(data.length);
    expect(managed.bufferLength).toBe(11);
    expect(managed.buffer.toString("utf8", 0, managed.bufferLength)).toBe(
      "hello world",
    );
  });

  test("should grow geometrically to at least double the previous size", () => {
    const managed = createManagedSocket(16);
    // Fill up most of the buffer
    appendToBuffer(managed, Buffer.alloc(14, 0x41)); // 14 bytes of 'A'

    // Now append 5 more bytes, forcing a grow
    appendToBuffer(managed, Buffer.alloc(5, 0x42)); // 5 bytes of 'B'

    // Math.max(16 * 2, 19) = 32
    expect(managed.buffer.length).toBe(32);
    expect(managed.bufferLength).toBe(19);
  });

  test("should handle Buffer data correctly", () => {
    const managed = createManagedSocket(16);
    const data = Buffer.from([0x01, 0x02, 0x03, 0xff]);

    appendToBuffer(managed, data);

    expect(managed.bufferLength).toBe(4);
    expect(managed.buffer[0]).toBe(0x01);
    expect(managed.buffer[1]).toBe(0x02);
    expect(managed.buffer[2]).toBe(0x03);
    expect(managed.buffer[3]).toBe(0xff);
  });

  test("should preserve existing data when growing buffer", () => {
    const managed = createManagedSocket(8);
    appendToBuffer(managed, Buffer.from("abcd"));
    appendToBuffer(managed, Buffer.from("efghijkl")); // forces growth

    expect(managed.bufferLength).toBe(12);
    expect(managed.buffer.toString("utf8", 0, managed.bufferLength)).toBe(
      "abcdefghijkl",
    );
  });
});

describe("compactBuffer", () => {
  test("should compact buffer by removing consumed bytes from the front", () => {
    const managed = createManagedSocket(16);
    appendToBuffer(managed, Buffer.from("hello world"));

    // Consume the first 6 bytes ("hello ")
    compactBuffer(managed, 6);

    expect(managed.bufferLength).toBe(5);
    expect(managed.buffer.toString("utf8", 0, managed.bufferLength)).toBe(
      "world",
    );
  });

  test("should reset length to 0 when entire buffer is consumed", () => {
    const managed = createManagedSocket(16);
    appendToBuffer(managed, Buffer.from("hello"));

    compactBuffer(managed, 5);

    expect(managed.bufferLength).toBe(0);
  });

  test("should reset length to 0 when consumed exceeds buffer length", () => {
    const managed = createManagedSocket(16);
    appendToBuffer(managed, Buffer.from("hi"));

    compactBuffer(managed, 10);

    expect(managed.bufferLength).toBe(0);
  });

  test("should be a no-op when offset is 0", () => {
    const managed = createManagedSocket(16);
    appendToBuffer(managed, Buffer.from("hello"));

    compactBuffer(managed, 0);

    expect(managed.bufferLength).toBe(5);
    expect(managed.buffer.toString("utf8", 0, managed.bufferLength)).toBe(
      "hello",
    );
  });

  test("should not change buffer capacity after compacting", () => {
    const managed = createManagedSocket(16);
    appendToBuffer(managed, Buffer.from("hello world"));
    const capacityBefore = managed.buffer.length;

    compactBuffer(managed, 6);

    expect(managed.buffer.length).toBe(capacityBefore);
  });
});
