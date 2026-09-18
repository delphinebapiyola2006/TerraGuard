/*
 * GeoShield-3D: Low-Cost Smart Sensor Node Firmware (ESP32 + LoRa Mesh)
 * Smart India Hackathon 2026 - Problem Statement 26025
 * Ministry of Coal / Coal India Limited (CIL)
 * 
 * Hardware:
 * - ESP32 NodeMCU (Dual Core 240MHz, Ultra-Low-Power Co-processor)
 * - Semtech SX1276 LoRa Transceiver (868 MHz ISM Band)
 * - MPU-6050 6-DOF IMU (Accelerometer + Gyroscope for dynamic tilt)
 * - Resistive Linear Displacement / Surface Crack Aperture Sensor
 * - Piezo-electric Acoustic Emission Vibration Sensor
 * - 6V 2W Solar Panel + TP4056 + 3.7V LiFePO4 Battery with ADC Voltage Divider
 */

#include <SPI.h>
#include <LoRa.h>
#include <Wire.h>
#include <MPU6050.h>

// SPI LoRa Pin Configuration for ESP32
#define LORA_SCK   5
#define LORA_MISO  19
#define LORA_MOSI  27
#define LORA_SS    18
#define LORA_RST   14
#define LORA_DIO0  26
#define LORA_BAND  868E6 // 868 MHz India License-Free ISM Band

// Analog & Sensor Pins
#define CRACK_SENSOR_PIN   34 // ADC1_CH6 (Linear Extensometer)
#define VIBRATION_PIN      35 // ADC1_CH7 (Piezo-electric Sensor)
#define BATTERY_ADC_PIN    32 // Voltage Divider for LiFePO4 Monitoring
#define STATUS_LED_PIN      2 // Built-in Blue LED for Packet Pulse

// Node Identity Configuration
#define NODE_ID            0x05 // Node #N-05
#define GATEWAY_ID         0x12 // Gateway #N-12
#define MAX_HOPS           4

MPU6050 mpu;

// Struct for LoRa Mesh Data Packet (Packed binary payload for maximum RF range)
struct __attribute__((packed)) MeshPacket {
  uint8_t  sourceId;
  uint8_t  targetId;
  uint8_t  hopCount;
  float    pitchDegrees;
  float    rollDegrees;
  float    vibrationPpv;
  float    crackApertureMm;
  float    batteryVoltage;
  uint32_t messageSequence;
  uint16_t checksum;
};

uint32_t packetSeqCounter = 0;

// Simple Fletcher16 Checksum
uint16_t calculateChecksum(const uint8_t* data, size_t length) {
  uint16_t sum1 = 0;
  uint16_t sum2 = 0;
  for (size_t i = 0; i < length; ++i) {
    sum1 = (sum1 + data[i]) % 255;
    sum2 = (sum2 + sum1) % 255;
  }
  return (sum2 << 8) | sum1;
}

void setup() {
  Serial.begin(115200);
  pinMode(STATUS_LED_PIN, OUTPUT);
  digitalWrite(STATUS_LED_PIN, HIGH);

  Wire.begin();
  
  // 1. Initialize MPU6050 Inclinometer
  Serial.println("[GeoShield] Initializing MPU6050 6-DOF Sensor...");
  mpu.initialize();
  if (mpu.testConnection()) {
    Serial.println("[GeoShield] MPU6050 Connection SUCCESSFUL.");
  } else {
    Serial.println("[GeoShield] WARNING: MPU6050 Connection FAILED.");
  }

  // 2. Initialize Semtech SX1276 LoRa
  Serial.println("[GeoShield] Initializing SX1276 LoRa Mesh Radio...");
  SPI.begin(LORA_SCK, LORA_MISO, LORA_MOSI, LORA_SS);
  LoRa.setPins(LORA_SS, LORA_RST, LORA_DIO0);

  if (!LoRa.begin(LORA_BAND)) {
    Serial.println("[GeoShield] CRITICAL ERROR: LoRa transceiver failed to start!");
    while (1) {
      digitalWrite(STATUS_LED_PIN, !digitalRead(STATUS_LED_PIN));
      delay(200);
    }
  }

  // 3. Configure LoRa RF Modulation Parameters for High Link Budget
  LoRa.setTxPower(20);             // 20 dBm (100 mW) Maximum Output Power
  LoRa.setSpreadingFactor(10);     // SF10 for robust penetration through foliage & coal spoil
  LoRa.setSignalBandwidth(125E3);  // 125 kHz Standard Bandwidth
  LoRa.setCodingRate4(5);          // 4/5 Error Correction
  LoRa.enableCrc();

  Serial.println("[GeoShield] LoRa Mesh Radio Online @ 868 MHz.");
  digitalWrite(STATUS_LED_PIN, LOW);
}

void loop() {
  // 1. Read MPU6050 Accelerometer for Tilt Calculation
  int16_t ax, ay, az, gx, gy, gz;
  mpu.getMotion6(&ax, &ay, &az, &gx, &gy, &gz);

  // Convert raw accelerometer vectors to Pitch and Roll in Degrees
  float pitch = atan2(-ax, sqrt((float)ay * ay + (float)az * az)) * (180.0 / PI);
  float roll  = atan2((float)ay, (float)az) * (180.0 / PI);

  // 2. Read Surface Crack Gauge (Linear Extensometer)
  int rawCrack = analogRead(CRACK_SENSOR_PIN);
  float crackAperture = ((float)rawCrack / 4095.0) * 20.0; // 0.0 - 20.0 mm aperture range

  // 3. Read Piezo-electric Vibration
  int rawVib = analogRead(VIBRATION_PIN);
  float vibrationPpv = ((float)rawVib / 4095.0) * 10.0; // Peak Particle Velocity (mm/s)

  // 4. Read LiFePO4 Battery Voltage
  int rawBat = analogRead(BATTERY_ADC_PIN);
  float batteryVolts = ((float)rawBat / 4095.0) * 3.3 * 2.0; // 2:1 Voltage Divider

  // 5. Construct Packet
  MeshPacket pkt;
  pkt.sourceId = NODE_ID;
  pkt.targetId = GATEWAY_ID;
  pkt.hopCount = 0;
  pkt.pitchDegrees = pitch;
  pkt.rollDegrees = roll;
  pkt.vibrationPpv = vibrationPpv;
  pkt.crackApertureMm = crackAperture;
  pkt.batteryVoltage = batteryVolts;
  pkt.messageSequence = ++packetSeqCounter;
  pkt.checksum = 0;
  pkt.checksum = calculateChecksum((uint8_t*)&pkt, sizeof(pkt) - sizeof(uint16_t));

  // 6. Broadcast packet over LoRa Mesh Network
  digitalWrite(STATUS_LED_PIN, HIGH);
  LoRa.beginPacket();
  LoRa.write((uint8_t*)&pkt, sizeof(pkt));
  LoRa.endPacket();
  digitalWrite(STATUS_LED_PIN, LOW);

  Serial.printf("[TX #%u] Tilt: (Pitch: %.2f°, Roll: %.2f°) | Crack: %.2f mm | Vib: %.2f mm/s | Bat: %.2f V\n",
                pkt.messageSequence, pitch, roll, crackAperture, vibrationPpv, batteryVolts);

  // Listen for incoming mesh packets to relay (Multi-Hop Ad-Hoc Routing)
  unsigned long listenStart = millis();
  while (millis() - listenStart < 950) {
    int packetSize = LoRa.parsePacket();
    if (packetSize == sizeof(MeshPacket)) {
      MeshPacket relayPkt;
      LoRa.readBytes((uint8_t*)&relayPkt, sizeof(relayPkt));
      
      // If packet is destined for gateway and hop count < MAX_HOPS, relay it
      if (relayPkt.targetId == GATEWAY_ID && relayPkt.sourceId != NODE_ID && relayPkt.hopCount < MAX_HOPS) {
        relayPkt.hopCount++;
        delay(10 + (NODE_ID * 5)); // Random backoff to prevent packet collision
        LoRa.beginPacket();
        LoRa.write((uint8_t*)&relayPkt, sizeof(relayPkt));
        LoRa.endPacket();
        Serial.printf("[RELAY] Forwarded packet from Node #0x%02X (Hop: %u)\n", relayPkt.sourceId, relayPkt.hopCount);
      }
    }
  }

  delay(50); // Loop cycle ~ 1.0 second
}
