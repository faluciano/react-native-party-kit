/**
 * Minimal type definition for the raw TCP socket provided by react-native-tcp-socket.
 * Covers only the API surface used by GameWebSocketServer.
 */

import type { Buffer } from "buffer";

export interface TcpSocketInstance {
  write(data: string | Buffer): void;
  destroy(): void;
  on(event: "data", callback: (data: Buffer | string) => void): this;
  on(event: "error", callback: (error: Error) => void): this;
  on(event: "close", callback: (hadError: boolean) => void): this;
  address():
    | { address: string; family: string; port: number }
    | Record<string, never>;
  readonly destroyed: boolean;
}

declare module "react-native-nitro-http-server" {
  export class StaticServer {
    start(port: number, path: string, host?: string): Promise<void>;
    stop(): void;
  }
}
