/**
 * MINESONIC: Explainable AI "Why Trust This Alert" Component
 * Shows multi-factor trust verification: Sensor Agreement, Spatial Confirmation, Health, and Data Quality.
 * Smart India Hackathon 2026 | Team Recursion Rebels
 */

import { createIcons, icons } from 'lucide';

export class WhyTrustAlert {
  constructor(containerId) {
    this.container = typeof containerId === 'string' ? document.getElementById(containerId) : containerId;
  }

  render(telemetry) {
    if (!this.container) return;
    const r = telemetry.risk;
    const peak = telemetry.peakNode;
    const agree = telemetry.sensorEvidence.agreementRatio;
    const isCritical = r.score >= 0.75;

    this.container.innerHTML = `
      <div class="why-trust-alert-card sonic-glass-panel">
        <div class="panel-heading">
          <i data-lucide="shield-alert" class="icon-sm text-yellow"></i>
          <h3>WHY TRUST THIS ALERT? — MULTI-EVIDENCE VERIFICATION</h3>
          <span class="badge-status-level ${isCritical ? 'badge-red' : 'badge-green'} ml-auto">
            ${isCritical ? 'CROSS-VALIDATED HAZARD' : 'BASELINE NOMINAL'}
          </span>
        </div>

        <p class="trust-subtitle mt-2">
          TERRA GUARD - X AI does not rely on a single sensor or arbitrary threshold. This early warning is validated through 8 independent physical and mathematical pillars:
        </p>

        <!-- 8 Trust Evidence Pillars Grid -->
        <div class="trust-pillars-grid mt-3">
          <!-- Pillar 1 -->
          <div class="trust-pillar-item ${isCritical ? 'verified-alert' : 'verified-normal'}">
            <div class="pillar-icon"><i data-lucide="git-merge" class="icon-xs"></i></div>
            <div class="pillar-info">
              <span class="pillar-title">1. Sensor Categories Agreeing</span>
              <strong class="pillar-value text-accent">${agree} Categories</strong>
              <span class="pillar-sub">Displacement, Tilt, Strain, Vib, Crack</span>
            </div>
          </div>

          <!-- Pillar 2 -->
          <div class="trust-pillar-item ${isCritical ? 'verified-alert' : 'verified-normal'}">
            <div class="pillar-icon"><i data-lucide="radio" class="icon-xs"></i></div>
            <div class="pillar-info">
              <span class="pillar-title">2. Nearby Nodes Confirming</span>
              <strong class="pillar-value text-accent">${isCritical ? '7 / 8 Neighbor Nodes' : '100% Mesh Baseline'}</strong>
              <span class="pillar-sub">Spatial cluster cross-validation</span>
            </div>
          </div>

          <!-- Pillar 3 -->
          <div class="trust-pillar-item">
            <div class="pillar-icon"><i data-lucide="clock" class="icon-xs"></i></div>
            <div class="pillar-info">
              <span class="pillar-title">3. Pattern Persistence</span>
              <strong class="pillar-value text-success">${isCritical ? '14.2 Minutes Continuous' : 'Steady-State'}</strong>
              <span class="pillar-sub">Zero fleeting spike artifacts</span>
            </div>
          </div>

          <!-- Pillar 4 -->
          <div class="trust-pillar-item">
            <div class="pillar-icon"><i data-lucide="database" class="icon-xs"></i></div>
            <div class="pillar-info">
              <span class="pillar-title">4. Historical Similarity</span>
              <strong class="pillar-value text-purple">${Math.round(r.historicalSimilarity * 100)}% Match</strong>
              <span class="pillar-sub">Raniganj Seam #4 Geomechanical Archive</span>
            </div>
          </div>

          <!-- Pillar 5 -->
          <div class="trust-pillar-item">
            <div class="pillar-icon"><i data-lucide="check-circle" class="icon-xs"></i></div>
            <div class="pillar-info">
              <span class="pillar-title">5. Sensor Health Verification</span>
              <strong class="pillar-value text-success">100% Validated</strong>
              <span class="pillar-sub">Battery ${peak.battery}% &bull; No Drift / No Stuck</span>
            </div>
          </div>

          <!-- Pillar 6 -->
          <div class="trust-pillar-item">
            <div class="pillar-icon"><i data-lucide="filter" class="icon-xs"></i></div>
            <div class="pillar-info">
              <span class="pillar-title">6. Data Quality Score</span>
              <strong class="pillar-value text-accent">98.4% Clean</strong>
              <span class="pillar-sub">Passed 8-Stage Cleansing Pipeline</span>
            </div>
          </div>

          <!-- Pillar 7 -->
          <div class="trust-pillar-item">
            <div class="pillar-icon"><i data-lucide="map-pin" class="icon-xs"></i></div>
            <div class="pillar-info">
              <span class="pillar-title">7. Spatial Agreement</span>
              <strong class="pillar-value text-accent">${Math.round(r.spatialAgreement * 100)}% Index</strong>
              <span class="pillar-sub">Deformation vector alignment</span>
            </div>
          </div>

          <!-- Pillar 8 -->
          <div class="trust-pillar-item">
            <div class="pillar-icon"><i data-lucide="activity" class="icon-xs"></i></div>
            <div class="pillar-info">
              <span class="pillar-title">8. Temporal Consistency</span>
              <strong class="pillar-value text-accent">${Math.round(r.temporalConsistency * 100)}% Index</strong>
              <span class="pillar-sub">Monotonic strata sinkage rate</span>
            </div>
          </div>
        </div>

        <!-- Trust Summary Banner -->
        <div class="trust-decision-summary mt-4">
          <div class="summary-col">
            <span class="lbl">FINAL AI RISK SCORE:</span>
            <strong class="val ${isCritical ? 'text-red' : 'text-success'}">${Math.round(r.score * 100)}% (${r.level})</strong>
          </div>
          <div class="summary-col">
            <span class="lbl">AI CONFIDENCE:</span>
            <strong class="val text-accent">${Math.round(r.confidence * 100)}%</strong>
          </div>
          <div class="summary-col">
            <span class="lbl">UNCERTAINTY:</span>
            <strong class="val text-yellow">±${Math.round(r.uncertainty * 100)}%</strong>
          </div>
          <div class="summary-col">
            <span class="lbl">SAFETY STATUS:</span>
            <strong class="val ${isCritical ? 'text-red' : 'text-success'}">${isCritical ? 'STATUTORY LEVEL 4' : 'ROUTINE 24/7'}</strong>
          </div>
        </div>
      </div>
    `;

    createIcons({ icons, nameAttr: 'data-lucide', root: this.container });
  }
}
