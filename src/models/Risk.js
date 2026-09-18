/**
 * MINESONIC: Risk Assessment Model
 * Smart India Hackathon 2026 | Team Recursion Rebels
 */

export class Risk {
  constructor(data = {}) {
    this.score = Number(data.score ?? 0.18); // 0.0 to 1.0
    this.level = data.level || 'NORMAL'; // NORMAL, CAUTION, HIGH RISK, CRITICAL
    this.color = data.color || 'GREEN'; // GREEN, YELLOW, ORANGE, RED
    this.hexColor = data.hexColor || '#10b981';
    this.confidence = Number(data.confidence ?? 0.96); // 0.0 to 1.0
    this.uncertainty = Number(data.uncertainty ?? 0.04); // ± 4%
    this.trend = data.trend || 'STABLE'; // STABLE, INCREASING, RAPIDLY INCREASING, DECREASING
    this.affectedZone = data.affectedZone || 'All Zones Normal';
    this.affectedAreaSqm = Number(data.affectedAreaSqm ?? 0); // Estimated subsidence area in m²
    this.timeToFailureHours = data.timeToFailureHours ?? null; // e.g. 18.5 hours
    this.explanationSummary = data.explanationSummary || 'Ground behaviour is within safe geomechanical tolerances.';
    this.actionRequired = data.actionRequired || 'Continue routine 24/7 automated mesh monitoring.';
    
    // Multi-Evidence Fusion components
    this.sensorAgreement = Number(data.sensorAgreement ?? 0.2); // 0 to 1
    this.spatialAgreement = Number(data.spatialAgreement ?? 0.15); // 0 to 1
    this.temporalConsistency = Number(data.temporalConsistency ?? 0.95); // 0 to 1
    this.historicalSimilarity = Number(data.historicalSimilarity ?? 0.88); // 0 to 1
    
    // Hysteresis & Stability
    this.persistenceSeconds = Number(data.persistenceSeconds ?? 0);
    this.isStable = Boolean(data.isStable ?? true);
    this.stabilityStatus = data.stabilityStatus || 'LOCKED_STABLE'; // LOCKED_STABLE, PENDING_CONFIRMATION, ESCALATED

    this.timestamp = data.timestamp || new Date().toISOString();
  }

  static fromScore(score, overrides = {}) {
    let level = 'NORMAL';
    let color = 'GREEN';
    let hexColor = '#10b981';
    let action = 'Continue routine 24/7 automated monitoring.';

    if (score >= 0.75) {
      level = 'CRITICAL';
      color = 'RED';
      hexColor = '#ef4444';
      action = 'Immediate DGMS emergency evacuation protocol. Dispatch rescue and survey teams.';
    } else if (score >= 0.50) {
      level = 'HIGH RISK';
      color = 'ORANGE';
      hexColor = '#f97316';
      action = 'Engineering field inspection recommended. Establish perimeter barrier around zone.';
    } else if (score >= 0.25) {
      level = 'CAUTION';
      color = 'YELLOW';
      hexColor = '#f59e0b';
      action = 'Increase sensor mesh sampling rate to 10 Hz and notify surface safety engineer.';
    }

    return new Risk({
      score,
      level,
      color,
      hexColor,
      actionRequired: action,
      ...overrides
    });
  }
}
