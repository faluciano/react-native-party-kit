---
"@couch-kit/host": major
---

### Breaking: React Native 0.83 upgrade with Expo module migration

**New peer dependencies required:**

- `expo`
- `expo-file-system`
- `expo-network`

**Dependency changes:**

- `react-native-tcp-socket` moved from a bundled dependency to a peer dependency — consumers must install it directly
- Removed `react-native-fs` (replaced by `expo-file-system`)
- Removed `react-native-network-info` (replaced by `expo-network`)

**Compatibility:**

- Dev dependency `react-native` bumped from 0.72.6 to 0.83.2
- Now supports React Native New Architecture (Fabric / TurboModules)

**Migration:** Consumers must install the new peer dependencies:

```bash
npx expo install expo-file-system expo-network
bun add react-native-tcp-socket
```
