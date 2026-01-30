import { NetworkInfo } from 'react-native-network-info';

/**
 * Smart IP Discovery
 * Prioritizes interfaces that are likely to be the main network (WiFi/Ethernet)
 * over internal/virtual interfaces.
 */
export async function getBestIpAddress(): Promise<string | null> {
  try {
    // 1. Try to get the standard IP address (usually WiFi)
    const ip = await NetworkInfo.getIPV4Address();
    
    if (ip && ip !== '0.0.0.0' && ip !== '127.0.0.1') {
      return ip;
    }
    
    // Fallback logic could go here (e.g., iterating interfaces if exposed by a native module)
    // For now, react-native-network-info is the standard abstraction.
    
    return null;
  } catch (error) {
    console.warn('[PartyKit] Failed to get IP address:', error);
    return null;
  }
}
