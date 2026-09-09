# AgriAI Mobile — Expo React Native Application

A dedicated mobile version of the **AgriAI** smart farming platform built using **Expo + React Native + TypeScript**.

It connects directly to the existing AgriAI FastAPI backend and SQLite / PostgreSQL database, providing dynamic farm management, village-level soil dataset intelligence, weather forecasts, crop suitability, yield prediction, irrigation advice, leaf disease vision AI, fertilizer planning, risk analysis, mandi market prices, and audit reports.

---

## Prerequisites

1. **Node.js** (v18 or newer)
2. **Expo Go** app installed on your smartphone:
   - **Android**: Install [Expo Go from Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
   - **iPhone (iOS)**: Install [Expo Go from Apple App Store](https://apps.apple.com/app/expo-go/id982107779)
3. Your computer and smartphone should be connected to the **same local Wi-Fi network**.

---

## Configuration (`.env`)

The mobile application uses the `EXPO_PUBLIC_API_URL` environment variable defined in `.env`:

```env
EXPO_PUBLIC_API_URL=http://YOUR_COMPUTER_IP:8000
```

> **Tip:** Replace `YOUR_COMPUTER_IP` with your computer's local Wi-Fi IPv4 address (for example, `172.16.129.170` or `192.168.1.50`). To find your IP:
> - **Windows**: Run `ipconfig` in Command Prompt or PowerShell and look for **IPv4 Address** under your active Wi-Fi adapter.
> - **macOS/Linux**: Run `ifconfig` or `ip addr show`.

---

## Quick Start (Running with Expo Go)

From the project root:

```bash
cd mobile
npm install
npx expo start
```

### Steps to Open the Mobile App:
1. Open terminal and run `npx expo start`.
2. Expo will start the Metro development server and display an interactive **QR code** directly in your terminal.
3. Open the **Expo Go** app on your phone:
   - **Android**: Tap **"Scan QR code"** in the Expo Go app and point your camera at the terminal QR code.
   - **iPhone**: Open the default **Camera app**, point it at the terminal QR code, and tap the **"Open in Expo Go"** banner.
4. The AgriAI mobile application will bundle and open immediately on your device!

---

## Connection Problems? Use Tunnel Mode

If your mobile device and computer cannot communicate over local Wi-Fi (e.g., due to router isolation, university/office firewall, or cellular data):

```bash
npx expo start --tunnel
```

This establishes an encrypted tunnel via Cloudflare/ngrok, allowing your phone running Expo Go to connect from anywhere without needing the same local network.

---

## Mobile Features

| Screen / Feature | Description |
|---|---|
| **Login / Register** | Secure JWT authentication with quick-fill demo farmer accounts |
| **Dashboard** | Dynamic selected farm, farm overview, AP vector map, weather overview, soil health score, expected yield, profitability, risk status, and quick action shortcuts |
| **Farm Management** | View registered farms, switch active farm, create new farms, manage fields |
| **Soil Analysis** | Full 15-attribute Andhra Pradesh village-level dataset records (N, P, K, pH, EC, Organic Carbon, S, Zn, Fe, Cu, Mn, B, Fertility Index, Soil Type, Plot-Specific Advisory) + interactive lab test analyzer |
| **Weather** | Real-time temperature, condition, high/low, humidity, wind, rainfall, and 7-day forecast |
| **Use Current Location** | GPS location resolution with permission prompt (`expo-location`), auto-matches nearest village soil records |
| **Crop Recommendation** | AI-ranked crops suited for local soil and regional climate |
| **Yield Prediction** | Predictive harvest yield (t/ha), total production (tonnes), confidence, and explainable feature bars |
| **Irrigation Advisory** | Moisture tracking and scheduled watering recommendations (mm) |
| **Disease Detection** | Leaf photo camera/gallery capture (`expo-image-picker`) with MobileNetV2 pathology diagnosis and treatment steps |
| **Fertilizer Advisory** | Precision NPK fertilizer balancing and agronomic guidance |
| **Risk Analysis** | Multi-factor risk audit (weather, soil, water, disease, market volatility) with mitigation steps |
| **Market Prices** | Live commodity prices across Indian mandis with price trends |
| **Reports** | Comprehensive downloadable agronomic farm audit generation |
| **Settings** | User profile editor, active backend IP connection info, and logout |

> **Privacy Notice**: Farm latitude and longitude coordinates are handled strictly internally for GIS projection, nearest-neighbor soil matching, and weather lookups. They are never rendered or displayed anywhere in the UI.
