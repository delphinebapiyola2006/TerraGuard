# Terra Guard - X 🚀
## AI-Enabled Low-Cost Real-Time Mine Subsidence Monitoring, Prediction & Early Warning System

**Smart India Hackathon 2026**  
**Problem Statement ID:** 26025  
**Organization:** Ministry of Coal  
**Department:** Coal India Limited (CIL)  
**Category:** Hardware  
**Theme:** Smart Automation  

---

## 🌟 Unique Innovation Hook: "Wireless Surface Mesh Network with 3D Subsurface Digital Twin & AI Prediction"

Traditional mine subsidence monitoring in Indian underground coalfields relies on periodic total station surveys, leveling pegs, or post-facto satellite InSAR passes which have multi-day latency and cannot prevent sudden catastrophic ground failures.

**Terra Guard - X** introduces an indigenous, low-cost (< ₹1,800/node), real-time continuous monitoring platform consisting of:
1. **Wireless LoRa Surface Mesh Network (868 MHz ISM Band)** deployed over active underground coal panels (Raniganj, Jharia, Korba, Singrauli).
2. **GPU-Accelerated 3D Subsurface Geological Digital Twin (Three.js 60 FPS)** with 360-degree rotation, procedural strata layers, longwall goaf void, dynamic Knothe subsidence trough sinkage deformation, and interactive cross-section slicing.
3. **MineGeo-AI Geotechnical Engine (Google Gemini API & LSTM-Knothe Hybrid)**: Ingests multi-sensor tilt, displacement, vibration FFT, and crack aperture data to predict time-to-failure (TTF), dynamic basin progression, and automated DGMS statutory compliance directives.
4. **Geospatial GIS Hazard Mapping (Leaflet)** with iso-deformation contours, railway/settlement vulnerability analysis, and 45° statutory safety buffers.
5. **Multi-Tier Early Warning System**: Real-time web audio sirens, automated SMS/email alerts, and 1-click printable DGMS Form-VI Safety Compliance Audit reports.

---

## 🛠️ Architecture & Tech Stack

```
[ Surface Nodes N-01 .. N-12 ] (ESP32 + SX1276 LoRa + MPU6050 + Extensometer + Solar)
                │
         (868 MHz LoRa Mesh)
                ▼
      [ LoRa Gateway #N-12 ] (MQTT / 4G Uplink)
                │
                ▼
 ┌────────────────────────────────────────────────────────────────────────┐
 │                      GeoShield-3D Web Platform                         │
 │                                                                        │
 │  ┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────┐  │
 │  │ Three.js 3D Twin     │  │ Leaflet GIS Engine   │  │ Chart.js     │  │
 │  │ 60 FPS 360° Strata   │  │ Iso-Contours & Buffer│  │ Telemetry    │  │
 │  └──────────────────────┘  └──────────────────────┘  └──────────────┘  │
 │                                                                        │
 │  ┌──────────────────────────────────────────────────────────────────┐  │
 │  │ MineGeo-AI Engine (Gemini 1.5/2.0 API + Knothe ML Predictor)     │  │
 │  │ - Threat Classification (Safe / Advisory / Warning / Evacuation) │  │
 │  │ - Time-To-Failure (TTF) Forecast & DGMS SOP Generation           │  │
 │  └──────────────────────────────────────────────────────────────────┘  │
 └────────────────────────────────────────────────────────────────────────┘
```

---

## ⚡ Quick Start & Running Locally

### 1. Install Dependencies
```bash
npm install
```

### 2. Launch Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:5173`.

### 3. Using AI API Key (Google Gemini)
1. Click the **"Set AI API Key"** button on the top navigation bar.
2. Paste your **Google Gemini API Key** (`AIzaSy...`).
3. Select your model (e.g., `gemini-2.0-flash` or `gemini-1.5-flash`).
4. Click **"Save & Validate Key"**.
5. *Note: If no API key is provided, the platform automatically runs its built-in onboard Knothe-LSTM Geotechnical ML inference engine.*

---

## 🏆 Key SIH 2026 Evaluation Highlights
- **Hardware Low Cost:** Complete Bill of Materials (BOM) < ₹1,800 / node (Solar powered, 5+ years autonomy).
- **3D Digital Twin:** 360° rotation with zero lag, cross-section geological slicer, interactive node markers.
- **DGMS Compliance:** Automated compliance checking against Indian Coal Mines Regulations 2017 & DGMS Circular No. 2 of 1974.
- **Made in India:** Indigenous sensors and firmware for extreme coalfield conditions.
