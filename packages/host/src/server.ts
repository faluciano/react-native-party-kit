import { useEffect, useState } from 'react';
import StaticServer from 'react-native-static-server';
import RNFS from 'react-native-fs';
import { getBestIpAddress } from './network';

interface PartyKitHostConfig {
  port?: number;
  devMode?: boolean;
  devServerUrl?: string; // e.g. "http://localhost:5173"
}

export const useStaticServer = (config: PartyKitHostConfig) => {
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let server: StaticServer | null = null;

    const startServer = async () => {
      // In Dev Mode, we don't start the static server.
      // We just resolve the IP so the host knows where it is.
      if (config.devMode && config.devServerUrl) {
        const ip = await getBestIpAddress();
        if (ip) {
          // In dev mode, the URL is the laptop's dev server, 
          // but we might need the TV's IP for the WebSocket connection later.
          setUrl(config.devServerUrl); 
        } else {
          setError(new Error('Could not detect TV IP address'));
        }
        return;
      }

      // Production Mode: Serve assets from bundle
      try {
        const path = `${RNFS.MainBundlePath}/www`;
        const port = config.port || 8080;
        
        server = new StaticServer(port, path, { localOnly: false });
        const serverUrl = await server.start();
        
        // We prefer the actual IP over "localhost" returned by some libs
        const ip = await getBestIpAddress();
        if (ip) {
            setUrl(`http://${ip}:${port}`);
        } else {
            setUrl(serverUrl);
        }
        
      } catch (e) {
        setError(e as Error);
      }
    };

    startServer();

    return () => {
      if (server) {
        server.stop();
      }
    };
  }, [config.port, config.devMode, config.devServerUrl]);

  return { url, error };
};
