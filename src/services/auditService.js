/**
 * TERRA GUARD - X: Comprehensive Audit Log System
 * Tracks WHO, WHAT, WHEN, WHERE, and WHY for statutory geotechnical safety compliance.
 * Smart India Hackathon 2026 | Terra Guard - X
 */

export class AuditService {
  constructor() {
    this.logs = [
      {
        id: 'AUD-001',
        timestamp: '20:45:21',
        isoDate: new Date(Date.now() - 30 * 60000).toISOString(),
        user: 'System AI Engine',
        role: 'AUTONOMOUS_AI',
        actionType: 'ALERT_GENERATED',
        action: 'Critical Red Alert (87%) Triggered',
        zone: 'Survey Sector A17',
        alertId: 'ALT-26025-A17',
        reason: '5/5 sensor categories exceeded failure baseline (Disp 12.4mm, Crack 5.8mm)',
        severity: 'CRITICAL'
      },
      {
        id: 'AUD-002',
        timestamp: '20:46:10',
        isoDate: new Date(Date.now() - 29 * 60000).toISOString(),
        user: 'Er. S. Sengupta',
        role: 'SAFETY_OFFICER',
        actionType: 'ALERT_ACKNOWLEDGED',
        action: 'Acknowledged Critical Threat for Sector A17',
        zone: 'Survey Sector A17',
        alertId: 'ALT-26025-A17',
        reason: 'Operator verified live multi-sensor telemetry agreement and 3D digital twin sinkage',
        severity: 'HIGH'
      },
      {
        id: 'AUD-003',
        timestamp: '20:48:30',
        isoDate: new Date(Date.now() - 27 * 60000).toISOString(),
        user: 'Dr. A. K. Banerjee',
        role: 'PROJECT_DIRECTOR',
        actionType: 'FIELD_DISPATCH',
        action: 'Quick-Response Geotechnical Team Alpha Dispatched',
        zone: 'Survey Sector A17 Perimeter',
        alertId: 'ALT-26025-A17',
        reason: 'Physical inspection of tension crack at northern perimeter access road',
        severity: 'CRITICAL'
      },
      {
        id: 'AUD-004',
        timestamp: '20:50:15',
        isoDate: new Date(Date.now() - 25 * 60000).toISOString(),
        user: 'System IoT Controller',
        role: 'AUTONOMOUS_AI',
        actionType: 'PHYSICAL_BEACON_DISPATCH',
        action: 'Dispatched RED LED Beacon & Audible Siren Command to ESP32',
        zone: 'Surface Sector A17',
        alertId: 'ALT-26025-A17',
        reason: 'Autonomous Emergency Geotechnical Safety Protocol Level 4 execution',
        severity: 'CRITICAL'
      },
      {
        id: 'AUD-005',
        timestamp: '20:52:00',
        isoDate: new Date(Date.now() - 23 * 60000).toISOString(),
        user: 'System Administrator',
        role: 'ADMINISTRATOR',
        actionType: 'THRESHOLD_CHANGE',
        action: 'Updated LoRa Mesh Broadcast Interval to 10 Hz',
        zone: 'Central Gateway GW-01',
        alertId: null,
        reason: 'High-frequency subsidence monitoring activated during active strata deformation',
        severity: 'NORMAL'
      }
    ];

    this.listeners = [];
  }

  logEvent(eventData) {
    const entry = {
      id: `AUD-${String(this.logs.length + 1).padStart(3, '0')}`,
      timestamp: new Date().toLocaleTimeString(),
      isoDate: new Date().toISOString(),
      user: eventData.user || 'Safety Officer On-Duty',
      role: eventData.role || 'SAFETY_OFFICER',
      actionType: eventData.actionType || 'OPERATOR_ACTION',
      action: eventData.action || 'Performed system update',
      zone: eventData.zone || 'Panel A17',
      alertId: eventData.alertId || null,
      reason: eventData.reason || 'Manual user interaction in command centre',
      severity: eventData.severity || 'NORMAL'
    };

    this.logs.unshift(entry);
    if (this.logs.length > 100) this.logs.pop();
    this.notify();
    return entry;
  }

  getLogs(filters = {}) {
    return this.logs.filter(log => {
      const matchUser = !filters.user || filters.user === 'ALL' || log.user.toLowerCase().includes(filters.user.toLowerCase());
      const matchType = !filters.actionType || filters.actionType === 'ALL' || log.actionType === filters.actionType;
      const matchZone = !filters.zone || filters.zone === 'ALL' || log.zone.toLowerCase().includes(filters.zone.toLowerCase());
      const matchQuery = !filters.query || log.action.toLowerCase().includes(filters.query.toLowerCase()) || log.reason.toLowerCase().includes(filters.query.toLowerCase());
      return matchUser && matchType && matchZone && matchQuery;
    });
  }

  exportCsv() {
    const headers = ['Audit ID', 'Timestamp', 'User', 'Role', 'Action Type', 'Action', 'Zone', 'Alert ID', 'Reason', 'Severity'];
    const rows = this.logs.map(l => [
      l.id, l.timestamp, `"${l.user}"`, l.role, l.actionType, `"${l.action}"`, `"${l.zone}"`, l.alertId || 'N/A', `"${l.reason}"`, l.severity
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TerraGuardX_Audit_Log_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  exportJson() {
    const blob = new Blob([JSON.stringify(this.logs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TerraGuardX_Audit_Log_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  subscribe(callback) {
    this.listeners.push(callback);
    callback(this.logs);
    return () => {
      this.listeners = this.listeners.filter(fn => fn !== callback);
    };
  }

  notify() {
    this.listeners.forEach(fn => {
      try { fn(this.logs); } catch (e) { console.error('AuditService error:', e); }
    });
  }
}

export const auditService = new AuditService();
