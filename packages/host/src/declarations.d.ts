declare module 'react-native-static-server' {
    export default class StaticServer {
        constructor(port: number, root?: string, opts?: { localOnly?: boolean; keepAlive?: boolean });
        start(): Promise<string>;
        stop(): void;
        isRunning(): boolean;
    }
}
