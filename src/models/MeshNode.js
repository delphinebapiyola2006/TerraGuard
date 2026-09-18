/**
 * MINESONIC: Wireless Mesh Node Model
 * Smart India Hackathon 2026 | Team Recursion Rebels
 */

import { Sensor } from './Sensor.js';

export class MeshNode {
  constructor(data = {}) {
    this.id = data.id || 'MSN-001';
    this.name = data.name || `Mesh Node ${this.id}`;
    this.zone = data.zone || 'A17';
    this.x = Number(data.x ?? 0);
    this.y = Number(data.y ?? 0);
    this.z = Number(data.z ?? 0);
    this.lat = Number(data.lat ?? 23.6845);
    this.lng = Number(data.lng ?? 86.9532);
    
    // LoRa Connectivity & Power
    this.battery = Number(data.battery ?? 92); // %
    this.batteryVoltage = Number((3.2 + (this.battery / 100) * 0.9).toFixed(2)); // Volts (3.2V to 4.1V)
    this.solarChargingRate = Number(data.solarChargingRate ?? (this.battery < 90 ? 45 : 5)); // mA
    this.rssi = Number(data.rssi ?? -72); // dBm
    this.snr = Number(data.snr ?? 8.5); // dB
    this.hops = Number(data.hops ?? 1);
    this.status = data.status || 'ONLINE'; // ONLINE, WARNING, OFFLINE
    this.lastCommunication = data.lastCommunication || 'Just Now';
    this.lastPacketTimestamp = Date.now();
    this.packetLossRate = Number(data.packetLossRate ?? 0.8); // %
    this.latencyMs = Number(data.latencyMs ?? 42); // ms

    // Sensor channels
    this.sensors = new Sensor({
      nodeId: this.id,
      zone: this.zone,
      ...(data.sensors || {})
    });

    this.baseline = data.baseline || {
      tilt: 2.5,
      displacement: 4.2,
      vibration: 1.1,
      crack: 0.5,
      strain: 210,
      temperature: 30.0
    };

    // Mesh Self-Healing & Topology Route
    this.parentGateway = data.parentGateway || 'GW-01';
    this.preferredNextHop = data.preferredNextHop || 'GW-01';
    this.alternativeHops = data.alternativeHops || ['MSN-012', 'MSN-030'];
    this.isRerouted = Boolean(data.isRerouted ?? false);
  }

  updateSensors(sensorValues = {}) {
    Object.assign(this.sensors, sensorValues);
  }

  isHealthy() {
    return this.status === 'ONLINE' && this.battery > 20 && this.rssi > -110;
  }
}
