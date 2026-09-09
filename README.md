# AgriAI — AI-Powered Crop Yield Prediction & Farm Optimization

AgriAI is a comprehensive full-stack platform for smart farming combining soil analysis, crop recommendation, yield prediction, irrigation & fertilizer intelligence, disease detection, market data, risk assessment, and optimization.

---

## Getting Started

### 1. Backend (FastAPI)

```bash
cd agri-ai/backend
python -m venv .venv
# Windows: .venv\Scripts\activate | macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

- API docs: http://localhost:8000/docs
- Health check: http://localhost:8000/api/health

### 2. Web Application (React + Vite)

```bash
cd agri-ai/frontend
npm install
cp .env.example .env
npm run dev
```

Open http://localhost:5173 to access the web application.

### 3. Mobile Application (Expo React Native)

```bash
cd mobile
npm install
npx expo start
```

**Steps to run on physical Android or iOS device:**
1. Install **Expo Go** on your Android phone (Google Play Store) or iPhone (Apple App Store).
2. Connect your phone and computer to the **same Wi-Fi network**.
3. Run `npx expo start` in the `mobile` directory.
4. Scan the interactive **Expo QR code** generated in your terminal:
   - **Android**: Tap "Scan QR code" in the Expo Go app.
   - **iPhone**: Scan using the default Camera app and tap the "Open in Expo Go" banner.
5. The AgriAI mobile application should open directly on your phone!

**Connection problems? (e.g. firewalls or different networks):**
Run with the tunnel flag:
```bash
npx expo start --tunnel
```
