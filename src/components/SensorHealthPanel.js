/**
 * MINESONIC: Sensor Health & AI Reliability Panel Component
 * Separates sensor failures, low battery, and drift from genuine ground anomalies.
 * Smart India Hackathon 2026 | Team Recursion Rebels
 */

import { sensorHealthService } from '../services/sensorHealthService.js';
import { createIcons, icons } from 'lucide';

export class SensorHealthPanel {
  constructor(containerId) {
    this.container = typeof containerId === 'string' ? document.getElementById(containerId) : containerId;
    this.selectedNode = null;
  }

  render(telemetry, selectedNode = null) {
    if (!this.container) return;
    this.selectedNode = selectedNode || telemetry.peakNode;
    const health = sensorHealthService.calculateSensorHealthScore(this.selectedNode);
    const fleet = sensorHealthService.getFleetHealthSummary(window.mockSensorFleet || [this.selectedNode]);

    const isRealAnomaly = health.isRealGroundAnomaly;
    const badgeColor = health.overallHealthScore >= 80 ? 'text-success' : (health.overallHealthScore >= 50 ? 'text-yellow' : 'text-red');

    this.container.innerHTML = `
      <div class="sensor-health-card sonic-glass-panel">
        <div class="panel-heading">
          <i data-lucide="shield-check" class="icon-sm text-accent"></i>
          <h3>SENSOR HEALTH &amp; RELIABILITY AI</h3>
          <span class="badge-status-level ${health.overallHealthScore >= 80 ? 'badge-green' : 'badge-yellow'} ml-auto">
            ${health.faultDiagnosis}
          </span>
        </div>

        <!-- Node Health Diagnostics Row -->
        <div class="health-metrics-grid mt-3">
          <div class="health-metric-box">
            <span class="lbl">Overall Health</span>
            <div class="val-big ${badgeColor}">${health.overallHealthScore}%</div>
            <span class="sub">Composite AI Index</span>
          </div>

          <div class="health-metric-box">
            <span class="lbl">Battery Health</span>
            <div class="val-big text-accent">${health.batteryHealth}%</div>
            <span class="sub">${this.selectedNode.battery > 20 ? 'Nominal LiPo 3.9V' : 'Low Charge Warning'}</span>
          </div>

          <div class="health-metric-box">
            <span class="lbl">Signal (RSSI)</span>
            <div class="val-big text-accent">${health.signalHealth}%</div>
            <span class="sub">${this.selectedNode.rssi} dBm (LoRa Link)</span>
          </div>

          <div class="health-metric-box">
            <span class="lbl">Data Quality</span>
            <div class="val-big text-purple">${health.dataQuality}%</div>
            <span class="sub">Zero-Noise Pass</span>
          </div>

          <div class="health-metric-box">
            <span class="lbl">Calibration Status</span>
            <div class="val-big ${health.calibrationStatus === 'CALIBRATED' ? 'text-success' : 'text-yellow'}">
              ${health.calibrationStatus}
            </div>
            <span class="sub">Auto-Verified</span>
          </div>

          <div class="health-metric-box">
            <span class="lbl">Reliability Score</span>
            <div class="val-big text-accent">${health.reliabilityScore}%</div>
            <span class="sub">Bayesian Prior</span>
          </div>
        </div>

        <!-- Fault Root Cause Discrimination Box -->
        <div class="fault-discrimination-banner ${isRealAnomaly ? 'anomaly-ground' : 'anomaly-sensor'} mt-3">
          <div class="discr-icon">
            <i data-lucide="${isRealAnomaly ? 'alert-triangle' : 'check-circle-2'}" class="icon-md"></i>
          </div>
          <div class="discr-content">
            <div class="discr-title">
              AI DIAGNOSIS: <strong>${isRealAnomaly ? 'GENUINE STRATA GROUND ANOMALY DETECTED' : 'SENSOR HARDWARE NOMINAL & VALIDATED'}</strong>
            </div>
            <p class="discr-desc">
              ${isRealAnomaly 
                ? `Node ${this.selectedNode.id} exhibits real physical rock mass displacement (${this.selectedNode.sensors.displacement}mm). Multi-sensor correlation and nearby nodes rule out hardware drift, noise, and low-battery artifacts.`
                : `Hardware integrity verified across all 5 telemetry channels. No stuck sensor or communication degradation detected.`}
            </p>
          </div>
        </div>

        <!-- Fleet Health Overview Footer -->
        <div class="fleet-health-summary-strip mt-3">
          <div class="strip-item"><span>Fleet Avg Health:</span> <strong>${fleet.avgHealthScore}%</strong></div>
          <div class="strip-item"><span>Nominal Nodes:</span> <strong class="text-success">${fleet.nominalCount}</strong></div>
          <div class="strip-item"><span>Warning Nodes:</span> <strong class="text-yellow">${fleet.warningCount}</strong></div>
          <div class="strip-item"><span>Offline / Fault:</span> <strong class="text-red">${fleet.faultCount}</strong></div>
        </div>
      </div>
    `;

    createIcons({ icons, nameAttr: 'data-lucide', root: this.container });
  }
}
