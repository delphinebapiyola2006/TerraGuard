/**
 * MINESONIC: Audit Log & Statutory Compliance History Component
 * Tracks WHO, WHAT, WHEN, WHERE, and WHY with full filtering and 1-click CSV/JSON export.
 * Smart India Hackathon 2026 | Team Recursion Rebels
 */

import { auditService } from '../services/auditService.js';
import { createIcons, icons } from 'lucide';

export class AuditLogPanel {
  constructor(containerId) {
    this.container = typeof containerId === 'string' ? document.getElementById(containerId) : containerId;
    this.currentFilters = { user: 'ALL', actionType: 'ALL', zone: 'ALL', query: '' };
  }

  render() {
    if (!this.container) return;
    const logs = auditService.getLogs(this.currentFilters);

    this.container.innerHTML = `
      <div class="audit-log-card sonic-glass-panel">
        <div class="panel-heading">
          <i data-lucide="clipboard-list" class="icon-sm text-accent"></i>
          <h3>STATUTORY AUDIT LOG &amp; OPERATOR ACTION TRAIL</h3>
          <div class="audit-action-btns ml-auto" style="display:flex; gap:6px;">
            <button class="btn btn-xs btn-outline" id="btnExportAuditCsv"><i data-lucide="file-spreadsheet" class="icon-xxs"></i> Export CSV</button>
            <button class="btn btn-xs btn-outline" id="btnExportAuditJson"><i data-lucide="code" class="icon-xxs"></i> Export JSON</button>
          </div>
        </div>

        <!-- Filter Bar -->
        <div class="audit-filters-bar mt-3">
          <input type="text" class="sonic-input flex-1" id="auditSearchInput" placeholder="Search actions, users or reasons..." value="${this.currentFilters.query}">
          <select class="sonic-select" id="auditFilterType">
            <option value="ALL">All Action Types</option>
            <option value="ALERT_GENERATED" ${this.currentFilters.actionType === 'ALERT_GENERATED' ? 'selected' : ''}>Alert Generated</option>
            <option value="ALERT_ACKNOWLEDGED" ${this.currentFilters.actionType === 'ALERT_ACKNOWLEDGED' ? 'selected' : ''}>Alert Acknowledged</option>
            <option value="FIELD_DISPATCH" ${this.currentFilters.actionType === 'FIELD_DISPATCH' ? 'selected' : ''}>Field Dispatch</option>
            <option value="PHYSICAL_BEACON_DISPATCH" ${this.currentFilters.actionType === 'PHYSICAL_BEACON_DISPATCH' ? 'selected' : ''}>Physical Beacon</option>
            <option value="THRESHOLD_CHANGE" ${this.currentFilters.actionType === 'THRESHOLD_CHANGE' ? 'selected' : ''}>Threshold Change</option>
          </select>
          <select class="sonic-select" id="auditFilterZone">
            <option value="ALL">All Zones</option>
            <option value="Panel A17">Panel A17</option>
            <option value="Panel A12">Panel A12</option>
            <option value="Gateway GW-01">Gateway GW-01</option>
          </select>
        </div>

        <!-- Audit Table -->
        <div class="table-responsive mt-3">
          <table class="sonic-table audit-table">
            <thead>
              <tr>
                <th>Time (When)</th>
                <th>User (Who)</th>
                <th>Action (What)</th>
                <th>Zone (Where)</th>
                <th>Causal Reason (Why)</th>
                <th>Severity</th>
              </tr>
            </thead>
            <tbody>
              ${logs.map(l => {
                const isCrit = l.severity === 'CRITICAL';
                return `
                  <tr>
                    <td class="font-mono text-accent">${l.timestamp}</td>
                    <td><strong>${l.user}</strong> <span class="role-sub">${l.role}</span></td>
                    <td class="font-semibold">${l.action}</td>
                    <td><span class="badge-status-level badge-purple">${l.zone}</span></td>
                    <td class="reason-cell">${l.reason}</td>
                    <td><span class="badge-status-level ${isCrit ? 'badge-red' : (l.severity === 'HIGH' ? 'badge-orange' : 'badge-green')}">${l.severity}</span></td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    // Attach listeners
    this.container.querySelector('#auditSearchInput')?.addEventListener('input', (e) => {
      this.currentFilters.query = e.target.value;
      this.render();
    });
    this.container.querySelector('#auditFilterType')?.addEventListener('change', (e) => {
      this.currentFilters.actionType = e.target.value;
      this.render();
    });
    this.container.querySelector('#auditFilterZone')?.addEventListener('change', (e) => {
      this.currentFilters.zone = e.target.value;
      this.render();
    });
    this.container.querySelector('#btnExportAuditCsv')?.addEventListener('click', () => auditService.exportCsv());
    this.container.querySelector('#btnExportAuditJson')?.addEventListener('click', () => auditService.exportJson());

    createIcons({ icons, nameAttr: 'data-lucide', root: this.container });
  }
}
