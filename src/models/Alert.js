/**
 * MINESONIC: Alert Lifecycle & Workflow Model
 * Smart India Hackathon 2026 | Team Recursion Rebels
 */

export class Alert {
  /**
   * Lifecycle States:
   * 1. NEW
   * 2. ACKNOWLEDGED
   * 3. UNDER_REVIEW
   * 4. FIELD_VERIFICATION
   * 5. ACTION_REQUIRED
   * 6. RESOLVED
   * 7. FALSE_POSITIVE
   */
  constructor(data = {}) {
    this.id = data.id || `ALT-${Date.now().toString(36).toUpperCase()}`;
    this.zone = data.zone || 'Panel A17';
    this.riskLevel = data.riskLevel || 'CRITICAL'; // NORMAL, CAUTION, HIGH_RISK, CRITICAL
    this.riskScore = Number(data.riskScore ?? 0.87);
    this.confidence = Number(data.confidence ?? 0.94);
    this.title = data.title || 'Multi-Sensor Subsidence Acceleration Alert';
    this.message = data.message || 'Multiple sensor channels exceeded critical thresholds in Longwall Panel A17.';
    this.state = data.state || 'NEW';
    this.createdAt = data.createdAt || new Date().toISOString();
    this.acknowledgedAt = data.acknowledgedAt || null;
    this.acknowledgedBy = data.acknowledgedBy || null;
    this.assignedOfficer = data.assignedOfficer || 'Er. S. Sengupta (Chief Safety Officer)';
    this.fieldTeamStatus = data.fieldTeamStatus || 'DISPATCH_READY'; // STANDBY, DISPATCHED, ON_SITE, COMPLETED
    this.verificationStatus = data.verificationStatus || 'PENDING'; // PENDING, IN_PROGRESS, CONFIRMED_HAZARD, REJECTED
    this.resolutionNotes = data.resolutionNotes || '';
    this.feedbackType = data.feedbackType || null; // TRUE_POSITIVE, SENSOR_FAULT, ENVIRONMENTAL_NOISE, FALSE_POSITIVE
    this.physicalLightStatus = data.physicalLightStatus || 'RED'; // GREEN, YELLOW, ORANGE, RED
    this.sirenActive = Boolean(data.sirenActive ?? true);

    // Timers
    this.acknowledgmentDueSeconds = data.acknowledgmentDueSeconds ?? 300; // 5 min SLA
    this.escalationDueSeconds = data.escalationDueSeconds ?? 900; // 15 min SLA
  }

  acknowledge(officerName = 'Operator On-Duty') {
    this.state = 'ACKNOWLEDGED';
    this.acknowledgedAt = new Date().toISOString();
    this.acknowledgedBy = officerName;
  }

  moveToReview() {
    this.state = 'UNDER_REVIEW';
  }

  dispatchFieldTeam(teamName = 'Alpha Geotechnical Quick-Response Unit') {
    this.state = 'FIELD_VERIFICATION';
    this.fieldTeamStatus = 'DISPATCHED';
    this.verificationStatus = 'IN_PROGRESS';
  }

  requireAction() {
    this.state = 'ACTION_REQUIRED';
  }

  resolve(notes = 'Field team completed ground stabilization and confirmed barrier clearance.') {
    this.state = 'RESOLVED';
    this.resolutionNotes = notes;
    this.fieldTeamStatus = 'COMPLETED';
    this.verificationStatus = 'CONFIRMED_HAZARD';
    this.sirenActive = false;
  }

  markFalsePositive(reason = 'Sensor recalibration required; no subsurface movement.') {
    this.state = 'FALSE_POSITIVE';
    this.feedbackType = 'FALSE_POSITIVE';
    this.resolutionNotes = reason;
    this.fieldTeamStatus = 'COMPLETED';
    this.verificationStatus = 'REJECTED';
    this.sirenActive = false;
  }
}
