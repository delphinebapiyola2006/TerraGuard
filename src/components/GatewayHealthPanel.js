/**
 * MINESONIC: Gateway Health Monitoring Panel Component
 * Displays Central Surface Gateway GW-01 real-time CPU, RAM, Disk, Edge AI, and Packet Success.
 * Smart India Hackathon 2026 | Team Recursion Rebels
 */

import { gatewayHealthService } from '../services/gatewayHealthService.js';
import { createIcons, icons } from 'lucide';

export class GatewayHealthPanel {
  constructor(containerId) {
    this.container = typeof containerId === 'string' ? document.getElementById(containerId) : containerId;
  }

  render() {
    if (!this.container) return;
    const g = gatewayHealthService.getHealthData();

    this.container.innerHTML = `
      <div class="gateway-health-card sonic-glass-panel">
        <div class="panel-heading">
          <i data-lucide="server" class="icon-sm text-accent"></i>
          <h3>CENTRAL SURFACE GATEWAY HEALTH</h3>
          <span class="badge-status-level badge-green ml-auto">${g.gatewayId}: ${g.status}</span>
        </div>

        <div class="gateway-specs-sub mt-2">
          <span>${g.name} &bull; ${g.hardwareModel}</span>
        </div>

        <!-- 6 Diagnostic Meter Boxes -->
        <div class="gateway-metrics-grid mt-3">
          <div class="gw-stat-box">
            <span class="lbl">CPU Load</span>
            <div class="val-big text-accent">${g.cpuUsagePercent}%</div>
            <div class="progress-bar-wrap"><div class="progress-bar-fill" style="width:${g.cpuUsagePercent}%; background:var(--accent-cyan);"></div></div>
            <span class="sub mt-1">Quad Core ARM Cortex-A72</span>
          </div>

          <div class="gw-stat-box">
            <span class="lbl">Memory (RAM)</span>
            <div class="val-big text-purple">${g.memoryUsagePercent}%</div>
            <div class="progress-bar-wrap"><div class="progress-bar-fill" style="width:${g.memoryUsagePercent}%; background:#a855f7;"></div></div>
            <span class="sub mt-1">1.6 GB / 4.0 GB LPDDR4</span>
          </div>

          <div class="gw-stat-box">
            <span class="lbl">NVMe Storage</span>
            <div class="val-big text-success">${g.storageUsagePercent}%</div>
            <div class="progress-bar-wrap"><div class="progress-bar-fill" style="width:${g.storageUsagePercent}%; background:#10b981;"></div></div>
            <span class="sub mt-1">Local SQLite Telemetry Cache</span>
          </div>

          <div class="gw-stat-box">
            <span class="lbl">Packet Processing</span>
            <div class="val-big text-accent">${g.packetProcessingRate} <span class="unit-sm">pkts/s</span></div>
            <span class="sub mt-1">SX1302 Concentrator Engine</span>
          </div>

          <div class="gw-stat-box">
            <span class="lbl">Delivery Success</span>
            <div class="val-big text-success">${g.packetSuccessRate}%</div>
            <span class="sub mt-1">LoRa CRC Validated</span>
          </div>

          <div class="gw-stat-box">
            <span class="lbl">Thermal Temp</span>
            <div class="val-big ${g.temperatureDegC > 65 ? 'text-red' : 'text-accent'}">${g.temperatureDegC}°C</div>
            <span class="sub mt-1">Industrial Enclosure Fan Active</span>
          </div>
        </div>

        <!-- Gateway Subsystem Status Bar -->
        <div class="gateway-subsystem-strip mt-3">
          <div class="subsys-item"><span class="dot green"></span> Edge AI: <strong>${g.edgeAiStatus}</strong></div>
          <div class="subsys-item"><span class="dot green"></span> Uplink: <strong>${g.networkConnection}</strong></div>
          <div class="subsys-item"><span class="dot green"></span> Uptime: <strong>${Math.floor(g.uptimeHours)}h (${g.firmwareVersion})</strong></div>
        </div>
      </div>
    `;

    createIcons({ icons, nameAttr: 'data-lucide', root: this.container });
  }
}
