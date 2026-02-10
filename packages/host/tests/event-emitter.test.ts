import { describe, expect, mock, test } from "bun:test";
import { EventEmitter } from "../src/event-emitter";

type TestEvents = {
  message: [data: string];
  error: [error: Error];
  count: [n: number, label: string];
  empty: [];
};

describe("EventEmitter", () => {
  describe("on", () => {
    test("should register and invoke a listener on emit", () => {
      const emitter = new EventEmitter<TestEvents>();
      const listener = mock(() => {});

      emitter.on("message", listener);
      emitter.emit("message", "hello");

      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith("hello");
    });

    test("should pass multiple arguments to listener", () => {
      const emitter = new EventEmitter<TestEvents>();
      const listener = mock(() => {});

      emitter.on("count", listener);
      emitter.emit("count", 42, "total");

      expect(listener).toHaveBeenCalledWith(42, "total");
    });

    test("should call multiple listeners in registration order", () => {
      const emitter = new EventEmitter<TestEvents>();
      const callOrder: number[] = [];

      emitter.on("message", () => callOrder.push(1));
      emitter.on("message", () => callOrder.push(2));
      emitter.on("message", () => callOrder.push(3));

      emitter.emit("message", "test");

      expect(callOrder).toEqual([1, 2, 3]);
    });

    test("should return the emitter instance for chaining", () => {
      const emitter = new EventEmitter<TestEvents>();
      const result = emitter.on("message", () => {});

      expect(result).toBe(emitter);
    });

    test("should invoke listener on every emit", () => {
      const emitter = new EventEmitter<TestEvents>();
      const listener = mock(() => {});

      emitter.on("empty", listener);
      emitter.emit("empty");
      emitter.emit("empty");
      emitter.emit("empty");

      expect(listener).toHaveBeenCalledTimes(3);
    });
  });

  describe("once", () => {
    test("should invoke listener only once then auto-remove", () => {
      const emitter = new EventEmitter<TestEvents>();
      const listener = mock(() => {});

      emitter.once("message", listener);
      emitter.emit("message", "first");
      emitter.emit("message", "second");

      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith("first");
    });

    test("should decrement listener count after once fires", () => {
      const emitter = new EventEmitter<TestEvents>();

      emitter.once("message", () => {});
      expect(emitter.listenerCount("message")).toBe(1);

      emitter.emit("message", "trigger");
      expect(emitter.listenerCount("message")).toBe(0);
    });
  });

  describe("off", () => {
    test("should remove a specific listener", () => {
      const emitter = new EventEmitter<TestEvents>();
      const listener = mock(() => {});

      emitter.on("message", listener);
      emitter.off("message", listener);
      emitter.emit("message", "ignored");

      expect(listener).not.toHaveBeenCalled();
    });

    test("should be a no-op when removing an unregistered listener", () => {
      const emitter = new EventEmitter<TestEvents>();
      const unregistered = mock(() => {});

      // Should not throw
      emitter.off("message", unregistered);
      expect(emitter.listenerCount("message")).toBe(0);
    });

    test("should only remove the specified listener, leaving others intact", () => {
      const emitter = new EventEmitter<TestEvents>();
      const listenerA = mock(() => {});
      const listenerB = mock(() => {});

      emitter.on("message", listenerA);
      emitter.on("message", listenerB);
      emitter.off("message", listenerA);
      emitter.emit("message", "test");

      expect(listenerA).not.toHaveBeenCalled();
      expect(listenerB).toHaveBeenCalledTimes(1);
    });

    test("should return the emitter instance for chaining", () => {
      const emitter = new EventEmitter<TestEvents>();
      const result = emitter.off("message", () => {});

      expect(result).toBe(emitter);
    });
  });

  describe("emit", () => {
    test("should return true when listeners exist for the event", () => {
      const emitter = new EventEmitter<TestEvents>();
      emitter.on("message", () => {});

      expect(emitter.emit("message", "test")).toBe(true);
    });

    test("should return false when no listeners exist for the event", () => {
      const emitter = new EventEmitter<TestEvents>();

      expect(emitter.emit("message", "test")).toBe(false);
    });

    test("should catch errors in listeners without throwing", () => {
      const emitter = new EventEmitter<TestEvents>();
      const errorSpy = mock(() => {});
      const originalConsoleError = console.error;
      console.error = errorSpy;

      const failingListener = () => {
        throw new Error("listener broke");
      };
      const successListener = mock(() => {});

      emitter.on("message", failingListener);
      emitter.on("message", successListener);

      // Should not throw
      emitter.emit("message", "test");

      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(successListener).toHaveBeenCalledTimes(1);

      console.error = originalConsoleError;
    });

    test("should handle events with no arguments", () => {
      const emitter = new EventEmitter<TestEvents>();
      const listener = mock(() => {});

      emitter.on("empty", listener);
      emitter.emit("empty");

      expect(listener).toHaveBeenCalledTimes(1);
    });

    test("should be safe to add listeners during emit", () => {
      const emitter = new EventEmitter<TestEvents>();
      const laterListener = mock(() => {});

      emitter.on("message", () => {
        emitter.on("message", laterListener);
      });

      // laterListener should NOT be called during the current emit
      emitter.emit("message", "first");
      expect(laterListener).not.toHaveBeenCalled();

      // But it should be called on the next emit
      emitter.emit("message", "second");
      expect(laterListener).toHaveBeenCalledTimes(1);
    });

    test("should be safe to remove listeners during emit", () => {
      const emitter = new EventEmitter<TestEvents>();
      const listenerB = mock(() => {});

      emitter.on("message", () => {
        emitter.off("message", listenerB);
      });
      emitter.on("message", listenerB);

      // listenerB should still be called because emit iterates over a copy
      emitter.emit("message", "test");
      expect(listenerB).toHaveBeenCalledTimes(1);
    });
  });

  describe("removeAllListeners", () => {
    test("should remove all listeners for a specific event", () => {
      const emitter = new EventEmitter<TestEvents>();

      emitter.on("message", () => {});
      emitter.on("message", () => {});
      emitter.on("error", () => {});

      emitter.removeAllListeners("message");

      expect(emitter.listenerCount("message")).toBe(0);
      expect(emitter.listenerCount("error")).toBe(1);
    });

    test("should remove all listeners for all events when called without args", () => {
      const emitter = new EventEmitter<TestEvents>();

      emitter.on("message", () => {});
      emitter.on("error", () => {});
      emitter.on("count", () => {});

      emitter.removeAllListeners();

      expect(emitter.listenerCount("message")).toBe(0);
      expect(emitter.listenerCount("error")).toBe(0);
      expect(emitter.listenerCount("count")).toBe(0);
    });

    test("should return the emitter instance for chaining", () => {
      const emitter = new EventEmitter<TestEvents>();
      const result = emitter.removeAllListeners();

      expect(result).toBe(emitter);
    });
  });

  describe("listenerCount", () => {
    test("should return the correct count for registered listeners", () => {
      const emitter = new EventEmitter<TestEvents>();

      emitter.on("message", () => {});
      emitter.on("message", () => {});

      expect(emitter.listenerCount("message")).toBe(2);
    });

    test("should return 0 for events with no registered listeners", () => {
      const emitter = new EventEmitter<TestEvents>();

      expect(emitter.listenerCount("message")).toBe(0);
    });

    test("should reflect changes after on, off, and once", () => {
      const emitter = new EventEmitter<TestEvents>();
      const listener = () => {};

      emitter.on("message", listener);
      expect(emitter.listenerCount("message")).toBe(1);

      emitter.once("message", () => {});
      expect(emitter.listenerCount("message")).toBe(2);

      emitter.off("message", listener);
      expect(emitter.listenerCount("message")).toBe(1);
    });
  });
});
