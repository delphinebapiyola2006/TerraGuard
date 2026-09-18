/**
 * MINESONIC: Detailed Risk Breakdown & Multi-Dimensional Analysis Panel
 * Displays individual sub-risk weights, alert hysteresis stability, and trend forecast.
 * Smart India Hackathon 2026 | Team Recursion Rebels
 */

import { createIcons, icons } from 'lucide';

export class RiskBreakdownPanel {
  constructor(containerId) {
    this.container = typeof containerId === 'string' ? document.getElementById(containerId) : containerId;
  }

  render(telemetry) {
    if (!this.container) return;
    const r = telemetry.risk;
    const s = telemetry.peakNode.sensors;
    const b = telemetry.peakNode.baseline;

    // Sub-risk scores (0 - 100%)
    const dispRisk = Math.min(100, Math.round(Math.max(0, (s.displacement - b.displacement) / b.displacement) * 60 + 10));
    const tiltRisk = Math.min(100, Math.round(Math.max(0, (s.tilt - b.tilt) / b.tilt) * 55 + 10));
    const strainRisk = Math.min(100, Math.round(Math.max(0, (s.strain - b.strain) / b.strain) * 45 + 10));
    const vibRisk = Math.min(100, Math.round(Math.max(0, (s.vibration - b.vibration) / b.vibration) * 40 + 10));
    const crackRisk = Math.min(100, Math.round(Math.max(0, (s.crack - b.crack) / b.crack) * 70 + 10));
    const spatialRisk = Math.round(r.spatialAgreement * 100);
    const temporalRisk = Math.round(r.temporalConsistency * 100);
    const histRisk = Math.round(r.historicalSimilarity * 100);

    const isCritical = r.score >= 0.75;

    this.container.innerHTML = `
      <div class="risk-breakdown-card sonic-glass-panel">
        <div class="panel-heading">
          <i data-lucide="pie-chart" class="icon-sm text-purple"></i>
          <h3>MULTI-DIMENSIONAL RISK BREAKDOWN &amp; HYSTERESIS</h3>
          <span class="badge-status-level ${isCritical ? 'badge-red' : 'badge-green'} ml-auto">
            ${r.level} (${Math.round(r.score * 100)}%)
          </span>
        </div>

        <!-- 8 Individual Sub-Risk Component Progress Bars -->
        <div class="sub-risks-grid mt-3">
          <div class="sub-risk-item">
            <div class="sub-risk-hdr"><span>Displacement Risk (31%)</span> <strong>${dispRisk}%</strong></div>
            <div class="sub-risk-bar"><div class="sub-risk-fill" style="width:${dispRisk}%; background:#38bdf8;"></div></div>
            <span class="sub-risk-val">${s.displacement} mm (Baseline: ${b.displacement} mm)</span>
          </div>

          <div class="sub-risk-item">
            <div class="sub-risk-hdr"><span>Tilt / Incline Risk (24%)</span> <strong>${tiltRisk}%</strong></div>
            <div class="sub-risk-bar"><div class="sub-risk-fill" style="width:${tiltRisk}%; background:#f59e0b;"></div></div>
            <span class="sub-risk-val">${s.tilt}° (Baseline: ${b.tilt}°)</span>
          </div>

          <div class="sub-risk-item">
            <div class="sub-risk-hdr"><span>Tensile Strain Risk (22%)</span> <strong>${strainRisk}%</strong></div>
            <div class="sub-risk-bar"><div class="sub-risk-fill" style="width:${strainRisk}%; background:#a855f7;"></div></div>
            <span class="sub-risk-val">${s.strain} µε (Baseline: ${b.strain} µε)</span>
          </div>

          <div class="sub-risk-item">
            <div class="sub-risk-hdr"><span>Vibration Anomaly (15%)</span> <strong>${vibRisk}%</strong></div>
            <div class="sub-risk-bar"><div class="sub-risk-fill" style="width:${vibRisk}%; background:#ef4444;"></div></div>
            <span class="sub-risk-val">${s.vibration} mm/s (Baseline: ${b.vibration} mm/s)</span>
          </div>

          <div class="sub-risk-item">
            <div class="sub-risk-hdr"><span>Surface Crack Risk (8%)</span> <strong>${crackRisk}%</strong></div>
            <div class="sub-risk-bar"><div class="sub-risk-fill" style="width:${crackRisk}%; background:#ec4899;"></div></div>
            <span class="sub-risk-val">${s.crack} mm (Baseline: ${b.crack} mm)</span>
          </div>

          <div class="sub-risk-item">
            <div class="sub-risk-hdr"><span>Spatial Agreement</span> <strong>${spatialRisk}%</strong></div>
            <div class="sub-risk-bar"><div class="sub-risk-fill" style="width:${spatialRisk}%; background:#10b981;"></div></div>
            <span class="sub-risk-val">Cluster Alignment Index</span>
          </div>

          <div class="sub-risk-item">
            <div class="sub-risk-hdr"><span>Temporal Rate Consistency</span> <strong>${temporalRisk}%</strong></div>
            <div class="sub-risk-bar"><div class="sub-risk-fill" style="width:${temporalRisk}%; background:#00f2fe;"></div></div>
            <span class="sub-risk-val">Continuous monotonic creep</span>
          </div>

          <div class="sub-risk-item">
            <div class="sub-risk-hdr"><span>Historical Pattern Match</span> <strong>${histRisk}%</strong></div>
            <div class="sub-risk-bar"><div class="sub-risk-fill" style="width:${histRisk}%; background:#818cf8;"></div></div>
            <span class="sub-risk-val">Raniganj Seam #4 Archives</span>
          </div>
        </div>

        <!-- Alert Hysteresis & Stability Visibility Panel -->
        <div class="hysteresis-visibility-banner mt-4">
          <div class="hys-col">
            <span class="lbl">CURRENT FUSED RISK:</span>
            <strong class="val ${isCritical ? 'text-red' : 'text-success'}">${Math.round(r.score * 100)}%</strong>
          </div>
          <div class="hys-col">
            <span class="lbl">ACTIVE ALERT COLOUR:</span>
            <strong class="val text-${r.color.toLowerCase()}">${r.color}</strong>
          </div>
          <div class="hys-col">
            <span class="lbl">PERSISTENCE WINDOW:</span>
            <strong class="val text-accent">${isCritical ? '14m 20s' : '02m 14s'} / 03m Required</strong>
          </div>
          <div class="hys-col">
            <span class="lbl">EVIDENCE AGREEMENT:</span>
            <strong class="val text-purple">${telemetry.sensorEvidence.agreementRatio}</strong>
          </div>
          <div class="hys-col">
            <span class="lbl">HYSTERESIS STABILITY:</span>
            <strong class="val text-success">● ${r.stabilityStatus || 'LOCKED_STABLE'}</strong>
          </div>
        </div>
      </div>
    `;

    createIcons({ icons, nameAttr: 'data-lucide', root: this.container });
  }
}
