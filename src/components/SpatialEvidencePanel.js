/**
 * MINESONIC: Spatial Evidence & Anomaly Cluster Visualization Component
 * Displays: SENSOR LOCATION + NEARBY VALUES + MINE PANEL + TIME = SPATIAL ANOMALY CLUSTER
 * Smart India Hackathon 2026 | Team Recursion Rebels
 */

import { createIcons, icons } from 'lucide';

export class SpatialEvidencePanel {
  constructor(containerId, onHighlightNodes) {
    this.container = typeof containerId === 'string' ? document.getElementById(containerId) : containerId;
    this.onHighlightNodes = onHighlightNodes;
  }

  render(telemetry) {
    if (!this.container) return;
    const r = telemetry.risk;
    const key = telemetry.peakNode;
    const sp = r.spatialEvidence || {
      affectedNodesCount: r.score >= 0.75 ? 5 : (r.score >= 0.3 ? 2 : 0),
      affectedNodes: ['MSN-020', 'MSN-022', 'MSN-024', 'MSN-026', 'MSN-028'],
      nearbyNodesCount: 8,
      spatialAgreementRatio: `${Math.round(r.spatialAgreement * 100)}%`,
      affectedAreaSqm: r.affectedAreaSqm || 245,
      affectedMineZone: `Panel ${key.zone}`
    };

    const isCritical = r.score >= 0.75;
    const clusterStrength = r.score >= 0.75 ? 'HIGH' : (r.score >= 0.3 ? 'MODERATE' : 'NORMAL');
    const moveDir = 'South-East (135° azimuth)';

    this.container.innerHTML = `
      <div class="spatial-evidence-card sonic-glass-panel">
        <div class="panel-heading">
          <i data-lucide="map-pin" class="icon-sm text-accent"></i>
          <h3>SPATIAL MULTI-SENSOR EVIDENCE &amp; HAZARD CLUSTERING</h3>
          <span class="badge-status-level ${isCritical ? 'badge-red' : 'badge-green'} ml-auto">
            ${clusterStrength} CLUSTER STRENGTH
          </span>
        </div>

        <!-- 5 Core Spatial Metric Cards -->
        <div class="spatial-stats-grid mt-3">
          <div class="spatial-stat-box">
            <span class="lbl">Affected Mine Zone</span>
            <div class="val text-accent font-display">Longwall ${sp.affectedMineZone}</div>
            <span class="sub">Extraction Seam #4 (185m Depth)</span>
          </div>

          <div class="spatial-stat-box">
            <span class="lbl">Affected Sensor Nodes</span>
            <div class="val text-red font-display">${sp.affectedNodesCount} Nodes</div>
            <span class="sub">${sp.affectedNodes.slice(0, 4).join(', ')}...</span>
          </div>

          <div class="spatial-stat-box">
            <span class="lbl">Nearby Confirming Nodes</span>
            <div class="val text-accent font-display">${isCritical ? '4 of 4' : '0 of 4'} Neighbors</div>
            <span class="sub">Radius: 85m buffer perimeter</span>
          </div>

          <div class="spatial-stat-box">
            <span class="lbl">Spatial Agreement</span>
            <div class="val text-purple font-display">${sp.spatialAgreementRatio}</div>
            <span class="sub">Vector angle cross-correlation</span>
          </div>

          <div class="spatial-stat-box">
            <span class="lbl">Estimated Affected Area</span>
            <div class="val text-yellow font-display">${sp.affectedAreaSqm} m²</div>
            <span class="sub">45° Geotechnical Angle of Draw</span>
          </div>

          <div class="spatial-stat-box">
            <span class="lbl">Deformation Vector</span>
            <div class="val text-accent font-display">${moveDir}</div>
            <span class="sub">Dip slope sliding vector</span>
          </div>
        </div>

        <!-- Spatial Cluster Formula Visual Banner -->
        <div class="spatial-cluster-formula-strip mt-3">
          <div class="f-pill"><i data-lucide="cpu" class="icon-xxs"></i> Sensor Location (TGX-024)</div>
          <span class="f-plus">+</span>
          <div class="f-pill"><i data-lucide="activity" class="icon-xxs"></i> Nearby Sensor Values (4.8° / 12.4mm)</div>
          <span class="f-plus">+</span>
          <div class="f-pill"><i data-lucide="layers" class="icon-xxs"></i> Sector Strata Geometry (A17)</div>
          <span class="f-plus">+</span>
          <div class="f-pill"><i data-lucide="clock" class="icon-xxs"></i> Time Progression</div>
          <span class="f-equal">=</span>
          <div class="f-result ${isCritical ? 'text-red' : 'text-success'}">
            <i data-lucide="shield-alert" class="icon-xxs"></i> SPATIAL ANOMALY CLUSTER CONFIRMED
          </div>
        </div>

        <!-- Cluster Node Chips Row -->
        <div class="cluster-nodes-chips-row mt-3">
          <span class="chips-label">Active Cluster Sensors:</span>
          ${sp.affectedNodes.map(nid => `
            <button class="node-chip-btn ${isCritical ? 'critical' : 'nominal'}" data-node="${nid}">
              <span class="dot ${isCritical ? 'red' : 'green'}"></span> ${nid}
            </button>
          `).join('')}
          <button class="btn btn-xs btn-outline ml-auto" id="btnSyncSpatialTwin">
            <i data-lucide="maximize-2" class="icon-xxs"></i> Highlight on 4D Digital Twin
          </button>
        </div>
      </div>
    `;

    this.container.querySelectorAll('.node-chip-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const nid = e.currentTarget.dataset.node;
        if (this.onHighlightNodes) this.onHighlightNodes(nid);
      });
    });

    this.container.querySelector('#btnSyncSpatialTwin')?.addEventListener('click', () => {
      window.mineSonicApp?.dashTwinViewer?.zoomToZone('A17');
    });

    createIcons({ icons, nameAttr: 'data-lucide', root: this.container });
  }
}
