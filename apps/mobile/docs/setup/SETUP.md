# VinaUp Mobile — Setup Guide  

This project uses **Expo Development Build** (`expo-dev-client`). Expo Go is **not supported** because the app includes native modules (custom plugins, datetimepicker, etc.) that require a custom native binary.

> **SDK:** Expo **SDK 57** (React Native **0.86**, React **19.2**). Navigation is 100% **Expo Router** (file-based). Icons use **`@react-native-vector-icons/*`** scoped packages (each family registered as a config plugin in `app.json`) — the old `@expo/vector-icons` package was removed in the SDK 57 migration.

---

## Prerequisites

| Tool | Version | Notes |
|---|---|---|
| Node.js | >= 20.19.4 | RN 0.85+ drops older Node; use [nvm](https://github.com/nvm-sh/nvm) |
| npm | >= 10 | Bundled with Node 20 |
| Expo CLI | latest | `npm install -g expo-cli` or use `npx expo` |
| EAS CLI | latest | `npm install -g eas-cli` |
| Android Studio | latest | Required for Android builds & ADB |
| Xcode | >= 26.4 | macOS only, required by Expo SDK 57 (iOS deploy target 16.4) |
| ADB | bundled | Comes with Android Studio |

---

## 1. Clone & Install

```bash
git clone <repo-url>
npm install
```

---

## 2. Environment Variables

Edit the `.env` file in the project root:

```bash
cp .env .env.backup  # optional: keep a backup
```

| Variable | Description |
|---|---|
| `EXPO_PUBLIC_API_URL` | Backend API base URL |
| `EXPO_PUBLIC_PLATFORM` | Runtime environment (`development` / `production`) |

> **Note:** All `EXPO_PUBLIC_*` variables are inlined at build time. Do not store sensitive credentials here.

**For USB / local API development**, point the URL to your local machine:

```env
# Android emulator (host machine is aliased to 10.0.2.2)
EXPO_PUBLIC_API_URL=http://10.0.2.2:8000

# USB with port forwarding (see Section 5 — USB Android)
EXPO_PUBLIC_API_URL=http://localhost:8000
```

---

## 3. Why Development Build (Not Expo Go)

Expo Go is a generic sandbox app with a fixed set of native modules. This project requires a custom binary because it uses:

- `@react-native-community/datetimepicker`
- `expo-haptics`, `expo-print`, `expo-sharing`
- React Compiler (`reactCompiler: true` in `app.json`)

`expo-dev-client` is already installed. You only need to build the dev client **once** — or whenever native dependencies or `app.json` plugins change.

---

## 4. Build the Development Client (One-Time)

### Option A — EAS Build (Recommended)

Builds in the cloud. No local Android Studio or Xcode setup required.

```bash
# Log in to your Expo account
eas login

# Android — produces a .apk, install it on your device
eas build --profile development --platform android

# iOS — produces a .ipa, install via Xcode or TestFlight Internal
eas build --profile development --platform ios
```

### Option B — Local Build

Requires a working Android Studio (Android) or Xcode (iOS) setup.

```bash
# Builds and installs on the connected device / emulator
npx expo run:android

# Builds and installs on the connected device / simulator
npx expo run:ios
```

---

## 5. Running the Development Server

Once the dev client app is installed on your device, start the Metro bundler.

### Standard — Wi-Fi LAN

```bash
npx expo start --dev-client
```

Scan the QR code from the dev client app. Computer and device **must be on the same Wi-Fi network**.

---

### USB (Type-C) — Android

Use this when Wi-Fi is unavailable, restricted, or unstable.

**Step 1 — Enable USB Debugging on the device**

```
Settings → About Phone → tap "Build number" 7 times
Settings → Developer Options → USB Debugging → ON
```

**Step 2 — Connect and verify**

```bash
# Plug in the USB cable, then:
adb devices
# Expected output: <serial>  device
```

**Step 3 — Forward Metro port**

```bash
adb reverse tcp:8081 tcp:8081
```

**Step 4 — Start server bound to localhost**

```bash
npx expo start --dev-client --localhost
```

**Step 5 — Connect from the app**

Open the dev client app → tap **"Enter URL manually"** → enter:

```
http://localhost:8081
```

---

### USB (Type-C / Lightning) — iOS *(macOS only)*

**If building fresh:**

```bash
npx expo run:ios --device
# Expo detects the connected device, builds, and launches automatically
```

**If the dev client app is already installed:**

```bash
npx expo start --dev-client --localhost
```

Then in the app: open Dev Menu (shake device or press `Cmd+D`) → **Change bundle location** → `http://localhost:8081`

---

### Wireless Debugging — Android

#### Android 11+ Wireless Debugging (no cable required)

```bash
# On device:
# Settings → Developer Options → Wireless Debugging → ON
# Tap "Pair device with pairing code" — note the IP, pair port, and 6-digit code

adb pair <IP>:<PAIR_PORT>
# Enter the pairing code when prompted

# Then connect using the separate debug port shown on the Wireless Debugging screen
adb connect <IP>:<DEBUG_PORT>

# Verify
adb devices

# Start the server
npx expo start --dev-client
```

---

### Wireless Debugging — iOS

1. In Xcode: **Window → Devices and Simulators** → select your iPhone → check **"Connect via network"**
2. Computer and iPhone must be on the same Wi-Fi network
3. Start the server:

```bash
npx expo start --dev-client
```

---

## 6. Recommended npm Scripts

Add these to `package.json` for convenience:

```json
"scripts": {
  "start": "expo start",
  "start:dev": "expo start --dev-client",
  "start:usb": "expo start --dev-client --localhost",
  "android": "expo run:android",
  "android:device": "expo run:android --device",
  "ios": "expo run:ios",
  "ios:device": "expo run:ios --device"
}
```
---

## See Also

- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) — Cannot connect via wireless debugging
- [Expo Development Builds](https://docs.expo.dev/develop/development-builds/introduction/)
- [EAS Build](https://docs.expo.dev/build/introduction/)
- [Expo CLI Reference](https://docs.expo.dev/more/expo-cli/)
