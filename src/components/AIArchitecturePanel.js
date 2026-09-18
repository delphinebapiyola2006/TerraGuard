/**
 * MINESONIC: End-to-End AI Architecture & Pipeline Visualizer Component
 * Displays the 14-stage geotechnical decision engine from wireless mesh to autonomous action.
 * Smart India Hackathon 2026 | Team Recursion Rebels
 */

import { createIcons, icons } from 'lucide';

export class AIArchitecturePanel {
  constructor(containerId) {
    this.container = typeof containerId === 'string' ? document.getElementById(containerId) : containerId;
  }

  render() {
    if (!this.container) return;

    const stages = [
      { num: '01', title: 'Raw Surface Mesh', desc: '132 Multi-Sensor Nodes (LoRa 868.1 MHz)', icon: 'radio', color: 'cyan' },
      { num: '02', title: 'Data Quality Engine', desc: 'Range Validation, Outlier Rejection, Kalman/EMA', icon: 'filter', color: 'purple' },
      { num: '03', title: 'Sensor Health AI', desc: 'Hardware fault discrimination (Drift / Low Batt / Stuck)', icon: 'shield-check', color: 'green' },
      { num: '04', title: 'Anomaly Detection', desc: 'Dynamic baseline threshold deviation check', icon: 'alert-triangle', color: 'yellow' },
      { num: '05', title: 'Feature Extraction', desc: 'FFT vibration spectrum & strain rate calculation', icon: 'cpu', color: 'blue' },
      { num: '06', title: 'Temporal Analysis', desc: 'Time-series monotonic rate-of-change consistency', icon: 'clock', color: 'cyan' },
      { num: '07', title: 'Spatial Analysis', desc: '85m cluster neighbor vector alignment & area estimate', icon: 'map-pin', color: 'orange' },
      { num: '08', title: 'Historical Matching', desc: 'Subsurface Geomechanical strata archive', icon: 'database', color: 'purple' },
      { num: '09', title: 'Evidence Fusion', desc: 'Multi-Evidence Bayesian weighting across 5 categories', icon: 'git-merge', color: 'purple' },
      { num: '10', title: 'Risk Engine', desc: 'Score (0-100%) + Confidence + Uncertainty + Hysteresis', icon: 'brain-circuit', color: 'red' },
      { num: '11', title: 'AI Prediction', desc: '48-Hour forward subsidence curve & Time-to-Failure', icon: 'trending-up', color: 'accent' },
      { num: '12', title: '4D Digital Twin', desc: '60 FPS Three.js subterranean strata sinkage model', icon: 'box', color: 'blue' },
      { num: '13', title: 'Explainable AI', desc: 'Human-readable causality chain & Safety SOP directives', icon: 'sparkles', color: 'yellow' },
      { num: '14', title: 'Early Warning', desc: 'ESP32 4-LED Beacon (🟢🟡🟠🔴) + Siren + SMS Router', icon: 'zap', color: 'red' }
    ];

    this.container.innerHTML = `
      <div class="ai-architecture-card sonic-glass-panel">
        <div class="panel-heading">
          <i data-lucide="network" class="icon-sm text-accent"></i>
          <h3>TERRA GUARD - X FULL AI ARCHITECTURE &amp; PIPELINE FLOW</h3>
          <span class="badge-status-level badge-purple ml-auto">14 CONNECTED STAGES</span>
        </div>

        <p class="pipeline-desc mt-2">
          End-to-end intelligent geotechnical safety architecture for real-time land subsidence and ground stability monitoring:
        </p>

        <!-- Interactive 14-Stage Visual Cards Grid -->
        <div class="ai-architecture-stages-grid mt-3">
          ${stages.map((st, i) => `
            <div class="ai-stage-card ${st.color}">
              <div class="ai-stage-top">
                <span class="ai-stage-num">${st.num}</span>
                <div class="ai-stage-icon"><i data-lucide="${st.icon}" class="icon-xs"></i></div>
              </div>
              <div class="ai-stage-title">${st.title}</div>
              <p class="ai-stage-desc">${st.desc}</p>
              ${i < stages.length - 1 ? '<div class="ai-stage-flow-indicator">&darr;</div>' : ''}
            </div>
          `).join('')}
        </div>
      </div>
    `;

    createIcons({ icons, nameAttr: 'data-lucide', root: this.container });
  }
}
