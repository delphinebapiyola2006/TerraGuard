/**
 * MINESONIC: Data Quality Pipeline Panel Component
 * Displays real-time 8-stage data cleansing, rejection rates, and pipeline health.
 * Smart India Hackathon 2026 | Team Recursion Rebels
 */

import { dataQualityService } from '../services/dataQualityService.js';
import { createIcons, icons } from 'lucide';

export class DataQualityPanel {
  constructor(containerId) {
    this.container = typeof containerId === 'string' ? document.getElementById(containerId) : containerId;
  }

  render() {
    if (!this.container) return;
    const m = dataQualityService.getPipelineMetrics();

    this.container.innerHTML = `
      <div class="data-quality-panel sonic-glass-panel">
        <div class="panel-heading">
          <i data-lucide="filter" class="icon-sm text-purple"></i>
          <h3>REAL-TIME DATA QUALITY PIPELINE</h3>
          <span class="badge-status-level badge-purple ml-auto">98.4% QUALITY</span>
        </div>

        <!-- 5 Key Metric Cards -->
        <div class="quality-counters-grid mt-3">
          <div class="q-stat-card">
            <span class="q-lbl">Overall Data Quality</span>
            <div class="q-val text-success">${m.overallDataQuality}%</div>
            <span class="q-sub">Clean Records Ratio</span>
          </div>

          <div class="q-stat-card">
            <span class="q-lbl">Valid Records</span>
            <div class="q-val text-accent">${m.validRecords.toLocaleString()}</div>
            <span class="q-sub">Passed All Stages</span>
          </div>

          <div class="q-stat-card">
            <span class="q-lbl">Missing Data</span>
            <div class="q-val text-yellow">${m.missingDataRecords}</div>
            <span class="q-sub">Imputed / Flagged</span>
          </div>

          <div class="q-stat-card">
            <span class="q-lbl">Noisy Data</span>
            <div class="q-val text-orange">${m.noisyDataRecords}</div>
            <span class="q-sub">Filtered via EMA</span>
          </div>

          <div class="q-stat-card">
            <span class="q-lbl">Rejected Data</span>
            <div class="q-val text-red">${m.rejectedRecords}</div>
            <span class="q-sub">Out-of-Bounds</span>
          </div>
        </div>

        <!-- Pipeline Architecture Flow Diagram -->
        <div class="pipeline-stages-flow mt-3">
          ${m.stages.map((stage, idx) => `
            <div class="flow-stage-box">
              <div class="stage-step-num">${idx + 1}</div>
              <div class="stage-info">
                <div class="stage-name">${stage.name}</div>
                <div class="stage-meta">
                  <span class="stage-status ${stage.status === 'PASSING' || stage.status === 'READY' ? 'text-success' : 'text-yellow'}">● ${stage.status}</span>
                  <span class="stage-lat">${stage.latency}</span>
                </div>
              </div>
            </div>
            ${idx < m.stages.length - 1 ? '<div class="flow-arrow">&rarr;</div>' : ''}
          `).join('')}
        </div>
      </div>
    `;

    createIcons({ icons, nameAttr: 'data-lucide', root: this.container });
  }
}
