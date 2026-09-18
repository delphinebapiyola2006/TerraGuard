# Hardware Engineering & Low-Cost Bill of Materials (BOM)
## GeoShield-3D: Wireless Surface Mesh Mine Subsidence Node
**SIH 2026 Problem Statement ID: 26025 | Ministry of Coal / Coal India Limited**

---

### 1. Bill of Materials (BOM) — Total Cost per Node: < ₹1,800 ($21.50 USD)

| # | Component | Model / Specs | Unit Price (INR) | Supplier / Source |
|---|---|---|---|---|
| 1 | **Microcontroller** | ESP32-WROOM-32D Dual Core 240MHz (Wi-Fi/BLE/Deep Sleep) | ₹280 | Robu.in / Quartz |
| 2 | **LoRa Radio** | Semtech SX1276 868MHz (100mW, 15km range) | ₹420 | Ebyte / Robu |
| 3 | **Tilt & Motion** | MPU-6050 6-DOF IMU (Accelerometer + Gyro) | ₹140 | Standard OEM |
| 4 | **Crack Gauge** | 20mm Linear Conductive Extensometer Ribbon | ₹190 | Indigenous Sensor Lab |
| 5 | **Vibration Sensor** | Piezo-Electric Ceramic Vibration Sensor Disc | ₹65 | Standard OEM |
| 6 | **Solar Energy** | 6V 2W Monocrystalline Solar Panel (110x60mm) | ₹180 | Indian Solar Labs |
| 7 | **Battery** | 3.2V 3000mAh 18650 LiFePO4 (2000+ cycles) | ₹220 | Lithium Power Tech |
| 8 | **Solar Charge IC**| CN3791 MPPT Solar Charge Controller Module | ₹95 | Standard OEM |
| 9 | **Enclosure** | IP68 UV-Resistant ABS Housing + Ground Anchor Stake | ₹160 | Industrial Plastics |
| 10| **Passives & PCB**| Custom 2-layer FR4 PCB + Antennas + Connectors | ₹50 | JLCPCB / Indian Fab |
| **TOTAL** | | | **₹1,800 (~$21.50)** | **Made in India** |

---

### 2. Complete ESP32 Hardware Pinout & Wiring Table

```
+-------------------------------------------------------------+
| ESP32 GPIO Pin | Connected Component | Protocol / Function   |
+----------------+---------------------+-----------------------+
| GPIO 5 (SCK)   | SX1276 SCK          | SPI Clock             |
| GPIO 19 (MISO) | SX1276 MISO         | SPI Master-In         |
| GPIO 27 (MOSI) | SX1276 MOSI         | SPI Master-Out        |
| GPIO 18 (SS)   | SX1276 NSS (CS)     | SPI Chip Select       |
| GPIO 14 (RST)  | SX1276 NRESET       | Hardware Reset        |
| GPIO 26 (DIO0) | SX1276 DIO0         | Packet Interrupt      |
| GPIO 21 (SDA)  | MPU-6050 SDA        | I2C Data              |
| GPIO 22 (SCL)  | MPU-6050 SCL        | I2C Clock             |
| GPIO 34 (ADC)  | Crack Gauge Output  | 12-Bit Analog Input   |
| GPIO 35 (ADC)  | Piezo Vibration Out | 12-Bit Analog Input   |
| GPIO 32 (ADC)  | Battery Divider R1  | Battery Health ADC    |
| GPIO 2 (LED)   | TX Status Beacon    | Visual LED Indicator  |
| 3V3 / GND      | Power Rails         | Regulated 3.3V System |
+-------------------------------------------------------------+
```

---

### 3. Power Budget & 5+ Year Field Autonomy Analysis

- **Active Transmission Mode (LoRa TX @ 20dBm, 100ms):** ~120 mA
- **Relay / Listen Mode (LoRa RX, 900ms):** ~12 mA
- **Deep Sleep Mode (Night-time adaptive duty cycling):** ~15 µA
- **Average Active Power Consumption:** ~18 mA @ 3.3V = **59.4 mW**
- **Daily Energy Consumption:** $59.4\text{ mW} \times 24\text{ hours} = 1.42\text{ Wh/day}$
- **Solar Generation (India average 4.5 Peak Sun Hours):** $2.0\text{ W} \times 4.5\text{ h} \times 0.75\text{ (efficiency)} = 6.75\text{ Wh/day}$
- **Net Energy Surplus:** $+5.33\text{ Wh/day}$ (Battery remains 100% full, operating even during 7 consecutive cloudy monsoon days).

---

### 4. Mechanical Mounting & Ground Anchorage in Coalfields

Each node is housed in an **IP68 weatherproof ABS shell** attached to a **1.2-meter stainless steel helical screw ground anchor**. The anchor penetrates the loose weathered topsoil down to competent strata, ensuring the inclinometer measures true ground subsidence rather than surface soil erosion.
