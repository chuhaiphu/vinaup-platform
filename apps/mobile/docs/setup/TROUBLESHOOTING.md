# VinaUp Mobile — Troubleshooting

This guide covers the most common reasons a device cannot connect to the Expo Metro bundler wirelessly.

For USB-based setup (the most reliable fallback), see [SETUP.md](./SETUP.md).

---

## Quick Diagnostic Checklist

Run through this list before diving into individual sections:

- [ ] Computer and device are on the **same Wi-Fi network**
- [ ] Port `8081` is not blocked by a firewall
- [ ] No VPN is active on the computer
- [ ] `adb devices` shows the device (if using `adb` wireless)
- [ ] Metro was restarted (`Ctrl+C` then `npx expo start --dev-client` again)

---

## Issue 1 — Devices Are Not on the Same Network

**Symptom:** App times out or shows "Could not connect to development server."

**Cause:** Computer and device are on different networks, or the router has **AP Isolation** enabled (prevents devices on the same Wi-Fi from seeing each other — common on corporate/hotel/shared networks).

**Fix:**

1. Confirm both are on the same SSID (not 5 GHz vs 2.4 GHz split SSIDs).
2. If on a corporate or shared network, AP Isolation is likely on and cannot be changed. Use USB instead:

```bash
adb reverse tcp:8081 tcp:8081
npx expo start --dev-client --localhost
```

---

## Issue 2 — Firewall Blocking Port 8081

**Symptom:** Device scans QR but never loads; connection hangs.

**Diagnosis:**

```bash
# From the device's browser (or another machine on same network):
curl http://<COMPUTER_IP>:8081

# Or test port reachability from your terminal:
nc -zv <COMPUTER_IP> 8081
```

**Fix — macOS:**

```
System Settings → Network → Firewall → Firewall Options
→ Add "node" to the allow list, or temporarily turn off the firewall
```

**Fix — Allow the specific port (alternative):**

```bash
# Allow inbound connections on port 8081
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --add $(which node)
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --unblockapp $(which node)
```

---

## Issue 3 — Metro Bundler Binding to the Wrong IP

**Symptom:** QR code contains an unreachable IP (VPN subnet, Docker bridge, etc.).

**Cause:** When multiple network interfaces exist (VPN, Docker, virtual adapters), Expo may pick the wrong one.

**Fix — specify the IP explicitly:**

```bash
REACT_NATIVE_PACKAGER_HOSTNAME=<YOUR_LAN_IP> npx expo start --dev-client
```

Find your LAN IP:

```bash
# macOS / Linux
ipconfig getifaddr en0      # Wi-Fi
ipconfig getifaddr en1      # Ethernet (if applicable)

# or
ifconfig | grep "inet " | grep -v 127.0.0.1
```
---

## Issue 4 — adb Wireless Pairing/Connection Fails or Is Unstable

**Symptoms:**

- `adb pair <IP>:<PAIRING_PORT>` returns `error: protocol fault (couldn't read status message): Undefined error: 0`
- `adb devices` shows no device or shows `offline`
- Connection drops randomly after some time

**Cause:** The local `adb` server is in a stale state, or a previous pairing/connection session is still half-open. This commonly happens after the laptop sleeps, after switching Wi-Fi networks, or when multiple `adb` clients are running (e.g. Android Studio + terminal).

**Fix — kill everything, then redo from scratch:**

```bash
# 1. Disconnect all wireless adb sessions
adb disconnect

# 2. Kill the adb server completely
adb kill-server

# 3. (Optional but recommended) make sure no stray adb process remains
pkill -9 adb 2>/dev/null

# 4. Start a fresh server
adb start-server
```

**Then on the device:**

1. Open **Settings → Developer options → Wireless debugging**.
2. Toggle **Wireless debugging** off and back on (this forces the device to issue a new pairing port and PIN).
3. Tap **Pair device with pairing code** — note the new `IP:PAIRING_PORT` and PIN shown.

**Back on the computer:**

```bash
# Pair (only needed once per computer)
adb pair <IP>:<PAIRING_PORT>
# Enter the PIN when prompted

# After pairing succeeds, take the DEBUG_PORT from the "IP address & Port"
# field on the Wireless debugging screen
adb connect <IP>:<DEBUG_PORT>

# Verify
adb devices
```

> **Note:** `PAIRING_PORT` (used by `adb pair`) and `DEBUG_PORT` (used by `adb connect`) are **two different ports** — easy to mix up. Read them carefully from the Wireless debugging screen on the device.

**If it still fails:**

- Make sure the computer and device are on the **same Wi-Fi** (see Issue 1).
- Turn off any VPN on the computer (VPNs can route adb traffic incorrectly).
- Fall back to USB-initiated wireless: connect via USB first, then run `adb tcpip 5555`, unplug USB, and `adb connect <IP>:5555`. This path skips the pairing step entirely.

---

## Issue 5 — Dev Client App Cannot Find the Server (QR Scan Fails)

**Symptom:** QR scan completes but nothing loads, or the app shows a connection error.

**Fix — Enter the URL manually:**

1. Open the dev client app.
2. Tap **"Enter URL manually"**.
3. Type: `http://<COMPUTER_LAN_IP>:8081`

Or, if the app is already on a screen, open the **Dev Menu** (shake the device, or press `Cmd+D` on simulator) → **Change bundle location** → enter the URL.

---

## Issue 6 — iOS Device Not Visible in Xcode

**Symptom:** Xcode's Devices window does not list the iPhone, or it shows as "disconnected."

**Steps:**

1. Open Xcode → **Window → Devices and Simulators**.
2. Plug in the device via USB first, then check **"Connect via network"**.
3. If the device still does not appear, re-trust the computer:

```
iPhone → Settings → General → VPN & Device Management → Trust <Computer Name>
```

4. Restart Xcode if needed.

---

## Issue 7 — `ECONNREFUSED` or `Network request failed` in the App

**Symptom:** App loads but API calls fail immediately.

**Cause:** The app is pointing to `https://apiup.vinaup.com` (production) or an unreachable local address.

**Fix — update `.env`:**

```env
# For local API via USB port forwarding
EXPO_PUBLIC_API_URL=http://localhost:8000

# For Android emulator
EXPO_PUBLIC_API_URL=http://10.0.2.2:8000
```

Then restart Metro (`Ctrl+C` and `npx expo start --dev-client`) to pick up the new value.

---

## Fallback — USB Is Always the Most Reliable Option

If wireless debugging continues to fail, USB is the most stable approach and bypasses all network-related issues.

**Android:**

```bash
adb reverse tcp:8081 tcp:8081
npx expo start --dev-client --localhost
```

**iOS:**

```bash
npx expo run:ios --device
```

Full instructions: [SETUP.md — Section 5: Running the Development Server](./SETUP.md)

---

## Issue 7 — Post SDK 57 upgrade notes (RN 0.86 / Hermes V1)

Context for the SDK 55 → 57 upgrade. Two behaviours changed in the platform that are worth knowing when debugging:

### 7a. Multipart image upload uses `expo/fetch` by default

Since SDK 56, `expo/fetch` is the default `globalThis.fetch`. Our upload path (`src/apis/upload/upload-apis.ts`) posts `FormData` with the React Native file shape `{ uri, name, type }`.

- **Symptom:** image upload fails / server receives an empty or malformed file after the upgrade.
- **Fix / fallback:** force the classic React Native fetch by setting `EXPO_PUBLIC_USE_RN_FETCH=1` (env / `.env`), then rebuild. Verify upload end-to-end before shipping.

### 7b. Reanimated + Hermes V1 memory (+25–30%) — Bundle Mode workaround

Importing `react-native-reanimated` under Hermes V1 can raise memory usage ~25–30% (known regression; a Hermes fix is expected). The workaround is **Worklets Bundle Mode**, intentionally **deferred** from the SDK upgrade to keep the migration isolated. To enable it later:

1. `babel.config.js` → `['react-native-worklets/plugin', { bundleMode: true, strictGlobal: true }]`
2. Add `metro.config.js` wrapping the config with `getBundleModeMetroConfig()` from `react-native-worklets/bundleMode`.
3. Clear cache: `npx expo start --clear`. Apply the Worklets Metro SHA-1 / Fast-Refresh patches if you hit those errors.

Docs: [Worklets Bundle Mode](https://docs.swmansion.com/react-native-worklets/docs/bundleMode/setup)
