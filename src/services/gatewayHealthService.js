/**
 * TERRA GUARD - X: Gateway Health Monitoring Service
 * Tracks Central Surface LoRaWAN Gateway (GW-01) CPU, Memory, Disk, Edge AI, and Packet Throughput.
 * Smart India Hackathon 2026 | Terra Guard - X
 */

export class GatewayHealthService {
  constructor() {
    this.gatewayData = {
      gatewayId: 'GW-01',
      name: 'Regional Surface Primary Gateway #1',
      status: 'ONLINE', // ONLINE, DEGRADED, OFFLINE
      ipAddress: '192.168.10.1',
      hardwareModel: 'Raspberry Pi Compute Module 4 + SX1302 8-Channel LoRa Concentrator',
      firmwareVersion: 'v2.4.8-LTS (Geotech-Certified)',
      cpuUsagePercent: 24.5,
      memoryUsagePercent: 41.2,
      storageUsagePercent: 32.8,
      temperatureDegC: 43.5,
      networkConnection: 'LoRaWAN 868.1 MHz ISM + Dual 4G/LTE Uplink Failover',
      internetStatus: 'CONNECTED (LTE Uplink Primary)',
      localDatabaseStatus: 'OPERATIONAL (SQLite / IndexedDB WAL Mode)',
      edgeAiStatus: 'ONBOARD AI INFERENCE ACTIVE (Latency 4.2ms)',
      uptimeHours: 342.5,
      lastSyncTime: new Date().toLocaleTimeString(),
      connectedNodesCount: 128,
      totalNodesCount: 132,
      packetProcessingRate: 148, // packets/sec
      packetSuccessRate: 98.7, // %
      rssiAverage: -72.4, // dBm
      snrAverage: 9.2 // dB
    };

    this.listeners = [];
    this.startTelemetryJitter();
  }

  startTelemetryJitter() {
    setInterval(() => {
      // Realistic micro-fluctuations in CPU, processing rate, temperature
      this.gatewayData.cpuUsagePercent = Number((22 + Math.random() * 6).toFixed(1));
      this.gatewayData.memoryUsagePercent = Number((40 + Math.random() * 2.5).toFixed(1));
      this.gatewayData.packetProcessingRate = Math.floor(140 + Math.random() * 20);
      this.gatewayData.temperatureDegC = Number((42 + Math.random() * 3).toFixed(1));
      this.notify();
    }, 3000);
  }

  getHealthData() {
    return { ...this.gatewayData };
  }

  subscribe(callback) {
    this.listeners.push(callback);
    callback(this.getHealthData());
    return () => {
      this.listeners = this.listeners.filter(fn => fn !== callback);
    };
  }

  notify() {
    const data = this.getHealthData();
    this.listeners.forEach(fn => {
      try { fn(data); } catch (e) { console.error('GatewayHealthService error:', e); }
    });
  }
}

export const gatewayHealthService = new GatewayHealthService();
