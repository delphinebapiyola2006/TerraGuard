/**
 * MINESONIC: Risk Timeline & 4D Event Replay Component
 * Shows progression over time with interactive step jumping and digital twin synchronization.
 * Smart India Hackathon 2026 | Team Recursion Rebels
 */

import { demoScenarioService } from '../services/demoScenarioService.js';
import { createIcons, icons } from 'lucide';

export class RiskTimeline {
  constructor(containerId, onSelectStep) {
    this.container = typeof containerId === 'string' ? document.getElementById(containerId) : containerId;
    this.onSelectStep = onSelectStep;
    
    this.timelineEvents = [
      {
        step: 1,
        time: '18:00',
        level: 'NORMAL',
        color: 'GREEN',
        score: '18%',
        title: 'Baseline Normal Operation',
        desc: 'Steady-state telemetry streaming over 132 LoRa nodes. Displacement 1.5mm.',
        sensors: 'Disp 1.5mm &bull; Tilt 0.8° &bull; Vib 0.7mm/s'
      },
      {
        step: 2,
        time: '19:00',
        level: 'CAUTION',
        color: 'YELLOW',
        score: '32%',
        title: 'Early Tilt Inclinometer Surge',
        desc: 'Unilateral slope divergence detected in cluster MSN-020 to MSN-026 above Panel A17.',
        sensors: 'Tilt rose to 3.2° (+92%) &bull; Strain 310µε'
      },
      {
        step: 3,
        time: '20:00',
        level: 'HIGH RISK',
        color: 'ORANGE',
        score: '65%',
        title: 'Multi-Sensor Anomaly Emergence',
        desc: 'Ground sinking acceleration coupled with micro-seismic roof fracturing activity.',
        sensors: 'Disp 7.8mm &bull; Vib 3.9mm/s &bull; Strain 580µε'
      },
      {
        step: 4,
        time: '20:45',
        level: 'CRITICAL',
        color: 'RED',
        score: '87%',
        title: 'Critical Crack Growth & Multi-Sensor Agreement',
        desc: '5/5 sensor categories confirm acute strata delamination and imminent caving.',
        sensors: 'Crack 5.8mm (+1060%) &bull; Disp 12.4mm &bull; Vib 6.2mm/s'
      },
      {
        step: 5,
        time: '20:50',
        level: 'CRITICAL',
        color: 'RED',
        score: '87%',
        title: 'Autonomous Geotechnical Safety Dispatch',
        desc: 'Physical LED beacons trigger Red, sector sirens sound, and Safety Dossier PDF generated.',
        sensors: 'Hazard localized at TGX-024 (Sector A17)'
      }
    ];
  }

  render(currentStep = 1) {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="risk-timeline-card sonic-glass-panel">
        <div class="panel-heading">
          <i data-lucide="history" class="icon-sm text-accent"></i>
          <h3>RISK PROGRESSION TIMELINE &amp; 4D EVENT REPLAY</h3>
          <span class="badge-status-level badge-purple ml-auto">CLICK EVENT TO REPLAY</span>
        </div>

        <div class="timeline-horizontal-scroll mt-3">
          <div class="timeline-track">
            ${this.timelineEvents.map(ev => {
              const isActive = ev.step === currentStep;
              const dotColor = ev.color === 'GREEN' ? '#10b981' : (ev.color === 'YELLOW' ? '#f59e0b' : (ev.color === 'ORANGE' ? '#f97316' : '#ef4444'));
              return `
                <div class="timeline-node-card ${isActive ? 'active' : ''} ${ev.color.toLowerCase()}" data-step="${ev.step}">
                  <div class="t-node-header">
                    <span class="t-time"><i data-lucide="clock" class="icon-xxs"></i> ${ev.time}</span>
                    <span class="t-badge ${ev.color.toLowerCase()}">${ev.level} (${ev.score})</span>
                  </div>
                  <div class="t-node-body">
                    <div class="t-node-title">${ev.title}</div>
                    <p class="t-node-desc">${ev.desc}</p>
                    <div class="t-node-sensors">${ev.sensors}</div>
                  </div>
                  <div class="t-node-footer">
                    <button class="btn btn-xs ${isActive ? 'btn-primary' : 'btn-outline'} btn-replay-step" data-step="${ev.step}">
                      ${isActive ? '● Currently Active' : '▶ Replay State'}
                    </button>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `;

    // Attach click listeners to replay events
    this.container.querySelectorAll('[data-step]').forEach(el => {
      el.addEventListener('click', (e) => {
        const step = parseInt(e.currentTarget.dataset.step, 10);
        if (this.onSelectStep) {
          this.onSelectStep(step);
        } else {
          demoScenarioService.setStep(step);
        }
      });
    });

    createIcons({ icons, nameAttr: 'data-lucide', root: this.container });
  }
}
