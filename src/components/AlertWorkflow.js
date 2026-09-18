/**
 * MINESONIC: Alert Escalation & Incident Workflow Component
 * Lifecycle: NEW -> ACKNOWLEDGED -> UNDER_REVIEW -> FIELD_VERIFICATION -> ACTION_REQUIRED -> RESOLVED / FALSE_POSITIVE
 * Smart India Hackathon 2026 | Team Recursion Rebels
 */

import { Alert } from '../models/Alert.js';
import { createIcons, icons } from 'lucide';

export class AlertWorkflow {
  constructor(containerId) {
    this.container = typeof containerId === 'string' ? document.getElementById(containerId) : containerId;
    
    // Default active alerts list
    this.alerts = [
      new Alert({
        id: 'ALT-26025-A17',
        zone: 'Panel A17 (Longwall Face)',
        riskLevel: 'CRITICAL',
        riskScore: 0.87,
        confidence: 0.94,
        title: 'Critical Strata Delamination & Rapid Sinking',
        message: '5 independent sensor channels confirm 12.4mm displacement and 5.8mm crack opening.',
        state: 'FIELD_VERIFICATION',
        assignedOfficer: 'Er. S. Sengupta (Chief Safety Officer)',
        fieldTeamStatus: 'DISPATCHED',
        verificationStatus: 'IN_PROGRESS',
        acknowledgmentDueSeconds: 0,
        escalationDueSeconds: 420
      }),
      new Alert({
        id: 'ALT-26024-A12',
        zone: 'Goaf Barrier Panel A12',
        riskLevel: 'HIGH_RISK',
        riskScore: 0.65,
        confidence: 0.89,
        title: 'Micro-Seismic Vibration Anomaly',
        message: 'Elevated vibration frequency spectrum (3.9 mm/s) above abandoned barrier.',
        state: 'ACKNOWLEDGED',
        assignedOfficer: 'R. K. Verma (Geotechnical Tech)',
        fieldTeamStatus: 'STANDBY',
        verificationStatus: 'PENDING',
        acknowledgmentDueSeconds: 0,
        escalationDueSeconds: 780
      })
    ];
  }

  render() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="alert-workflow-container sonic-glass-panel">
        <div class="panel-heading">
          <i data-lucide="git-pull-request" class="icon-sm text-accent"></i>
          <h3>MINE SAFETY INCIDENT WORKFLOW &amp; ESCALATION</h3>
          <span class="badge-status-level badge-red ml-auto">${this.alerts.length} ACTIVE INCIDENTS</span>
        </div>

        <!-- Workflow Pipeline Stage Visualizer -->
        <div class="workflow-stages-strip mt-3">
          <div class="wf-stage done"><span class="wf-dot">✓</span> New Alert</div>
          <div class="wf-arrow">&rarr;</div>
          <div class="wf-stage done"><span class="wf-dot">✓</span> Operator Acknowledgment</div>
          <div class="wf-arrow">&rarr;</div>
          <div class="wf-stage active"><span class="wf-dot">●</span> Field Verification</div>
          <div class="wf-arrow">&rarr;</div>
          <div class="wf-stage"><span class="wf-dot">○</span> Engineering Review</div>
          <div class="wf-arrow">&rarr;</div>
          <div class="wf-stage"><span class="wf-dot">○</span> Action Taken &amp; Resolved</div>
        </div>

        <!-- Interactive Alert Cards Grid -->
        <div class="alerts-workflow-cards-grid mt-4">
          ${this.alerts.map(alt => {
            const isRed = alt.riskScore >= 0.75;
            return `
              <div class="alert-workflow-card ${isRed ? 'critical-border' : 'orange-border'}">
                <div class="wf-card-header">
                  <div>
                    <span class="wf-alt-id">${alt.id}</span>
                    <h4 class="wf-alt-zone">${alt.zone}</h4>
                  </div>
                  <span class="badge-status-level ${isRed ? 'badge-red' : 'badge-orange'}">${alt.riskLevel} (${Math.round(alt.riskScore * 100)}%)</span>
                </div>

                <p class="wf-alt-msg mt-2">${alt.message}</p>

                <!-- SLA & Meta Timers -->
                <div class="wf-meta-grid mt-3">
                  <div class="wf-meta-item">
                    <span class="wf-meta-lbl">Assigned Officer:</span>
                    <strong class="wf-meta-val">${alt.assignedOfficer}</strong>
                  </div>
                  <div class="wf-meta-item">
                    <span class="wf-meta-lbl">Field Team:</span>
                    <strong class="wf-meta-val text-accent">${alt.fieldTeamStatus}</strong>
                  </div>
                  <div class="wf-meta-item">
                    <span class="wf-meta-lbl">Verification Status:</span>
                    <strong class="wf-meta-val ${alt.verificationStatus === 'IN_PROGRESS' ? 'text-yellow' : 'text-success'}">${alt.verificationStatus}</strong>
                  </div>
                  <div class="wf-meta-item">
                    <span class="wf-meta-lbl">Escalation Timer:</span>
                    <strong class="wf-meta-val text-red"><i data-lucide="clock" class="icon-xxs"></i> 07:00 Remaining</strong>
                  </div>
                </div>

                <!-- Workflow Action Buttons -->
                <div class="wf-action-buttons-row mt-3">
                  <button class="btn btn-xs btn-outline btn-wf-action" data-id="${alt.id}" data-act="ACK">
                    <i data-lucide="check" class="icon-xxs"></i> Acknowledge
                  </button>
                  <button class="btn btn-xs btn-outline btn-wf-action" data-id="${alt.id}" data-act="DISPATCH">
                    <i data-lucide="send" class="icon-xxs"></i> Dispatch Team
                  </button>
                  <button class="btn btn-xs btn-primary btn-wf-action" data-id="${alt.id}" data-act="RESOLVE">
                    <i data-lucide="shield-check" class="icon-xxs"></i> Mark Resolved
                  </button>
                  <button class="btn btn-xs btn-outline text-yellow btn-wf-action" data-id="${alt.id}" data-act="FALSE_POS">
                    <i data-lucide="help-circle" class="icon-xxs"></i> Flag False Positive
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    // Handle interactive workflow clicks
    this.container.querySelectorAll('.btn-wf-action').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.id;
        const act = e.currentTarget.dataset.act;
        const targetAlert = this.alerts.find(a => a.id === id);
        if (!targetAlert) return;

        if (act === 'ACK') targetAlert.acknowledge();
        else if (act === 'DISPATCH') targetAlert.dispatchFieldTeam();
        else if (act === 'RESOLVE') targetAlert.resolve();
        else if (act === 'FALSE_POS') targetAlert.markFalsePositive();

        this.render();
      });
    });

    createIcons({ icons, nameAttr: 'data-lucide', root: this.container });
  }
}
