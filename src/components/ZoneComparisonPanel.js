/**
 * MINESONIC: Multi-Zone Risk Comparison Component
 * Compares active coal panels and allows 1-click focus switching across all visualizers.
 * Smart India Hackathon 2026 | Team Recursion Rebels
 */

import { createIcons, icons } from 'lucide';

export class ZoneComparisonPanel {
  constructor(containerId, onSelectZone) {
    this.container = typeof containerId === 'string' ? document.getElementById(containerId) : containerId;
    this.onSelectZone = onSelectZone;

    this.zones = [
      { id: 'A17', name: 'Longwall Panel A17', depth: '185m', status: 'CRITICAL', color: 'red', score: '87%', nodes: 45, peakDisp: '12.4 mm', peakTilt: '4.8°', activity: 'Active Working Seam' },
      { id: 'A12', name: 'Goaf Barrier Panel A12', depth: '210m', status: 'HIGH_RISK', color: 'orange', score: '65%', nodes: 35, peakDisp: '7.8 mm', peakTilt: '3.6°', activity: 'Compacted Goaf Perimeter' },
      { id: 'A08', name: 'Depillaring Sector Panel A08', depth: '160m', status: 'CAUTION', color: 'yellow', score: '42%', nodes: 30, peakDisp: '3.2 mm', peakTilt: '2.8°', activity: 'Extracted Pillar Extraction' },
      { id: 'B04', name: 'South Incline Panel B04', depth: '240m', status: 'NORMAL', color: 'green', score: '18%', nodes: 22, peakDisp: '1.5 mm', peakTilt: '0.8°', activity: 'Main Intake Airway' }
    ];

    this.selectedZoneId = 'A17';
  }

  render(activeZoneId = null) {
    if (!this.container) return;
    if (activeZoneId) this.selectedZoneId = activeZoneId;

    this.container.innerHTML = `
      <div class="zone-comparison-card sonic-glass-panel">
        <div class="panel-heading">
          <i data-lucide="layers" class="icon-sm text-accent"></i>
          <h3>MINE SECTOR &amp; PANEL RISK COMPARISON</h3>
          <span class="badge-status-level badge-purple ml-auto">4 MONITORED SECTORS</span>
        </div>

        <p class="zone-comp-sub mt-2">
          Click any mining sector to focus the 4D Digital Twin, GIS map, and telemetry fleet on that panel:
        </p>

        <!-- Zone Cards Grid -->
        <div class="zones-comparison-grid mt-3">
          ${this.zones.map(z => {
            const isSelected = z.id === this.selectedZoneId;
            return `
              <div class="zone-compare-card ${z.color} ${isSelected ? 'selected' : ''}" data-zone="${z.id}">
                <div class="z-card-header">
                  <div>
                    <span class="z-id-tag">PANEL ${z.id}</span>
                    <h4 class="z-name">${z.name}</h4>
                  </div>
                  <span class="badge-status-level badge-${z.color}">${z.status} (${z.score})</span>
                </div>

                <div class="z-meta-list mt-2">
                  <div class="z-meta-row"><span>Extraction Depth:</span> <strong>${z.depth}</strong></div>
                  <div class="z-meta-row"><span>Active Mesh Nodes:</span> <strong>${z.nodes} Nodes</strong></div>
                  <div class="z-meta-row"><span>Peak Displacement:</span> <strong class="text-${z.color}">${z.peakDisp}</strong></div>
                  <div class="z-meta-row"><span>Peak Incline Tilt:</span> <strong>${z.peakTilt}</strong></div>
                  <div class="z-meta-row"><span>Operational State:</span> <strong>${z.activity}</strong></div>
                </div>

                <div class="z-card-footer mt-3">
                  <button class="btn btn-xs ${isSelected ? 'btn-primary' : 'btn-outline'} btn-select-zone w-100" data-zone="${z.id}">
                    ${isSelected ? '● Currently Monitored' : 'Focus Sector &rarr;'}
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    this.container.querySelectorAll('[data-zone]').forEach(el => {
      el.addEventListener('click', (e) => {
        const zid = e.currentTarget.dataset.zone;
        this.selectedZoneId = zid;
        if (this.onSelectZone) this.onSelectZone(zid);
        this.render(zid);
      });
    });

    createIcons({ icons, nameAttr: 'data-lucide', root: this.container });
  }
}
