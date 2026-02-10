import * as Network from "expo-network";

/**
 * Smart IP Discovery
 * Prioritizes interfaces that are likely to be the main network (WiFi/Ethernet)
 * over internal/virtual interfaces.
 */
export async function getBestIpAddress(): Promise<string | null> {
  try {
    const ip = await Network.getIpAddressAsync();

    if (ip && ip !== "0.0.0.0" && ip !== "127.0.0.1") {
      return ip;
    }

    return null;
  } catch (error) {
    console.warn("[CouchKit] Failed to get IP address:", error);
    return null;
  }
}
