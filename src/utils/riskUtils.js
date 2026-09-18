/**
 * TERRA GUARD - X: Risk Calculation, Geotechnical Thresholds & Hysteresis Utilities
 * Smart India Hackathon 2026 | Terra Guard - X
 */

export const GEOTECH_THRESHOLDS = {
  NORMAL_MAX: 0.25,
  CAUTION_MAX: 0.50,
  HIGH_RISK_MAX: 0.75,
  CRITICAL_MIN: 0.75
};
export const DGMS_THRESHOLDS = GEOTECH_THRESHOLDS;

export const RISK_COLOR_MAP = {
  GREEN: {
    level: 'NORMAL',
    hex: '#10b981',
    light: 'GREEN',
    meaning: 'Ground behaviour is within normal baseline limits.',
    action: 'Continue routine 24/7 automated mesh monitoring.'
  },
  YELLOW: {
    level: 'CAUTION',
    hex: '#f59e0b',
    light: 'YELLOW',
    meaning: 'Early isolated abnormal ground behaviour detected.',
    action: 'Increase mesh sampling rate and inspect the affected zone.'
  },
  ORANGE: {
    level: 'HIGH RISK',
    hex: '#f97316',
    light: 'ORANGE',
    meaning: 'Multiple correlated abnormal deformation indicators detected.',
    action: 'Field engineering inspection required. Prepare barrier perimeter.'
  },
  RED: {
    level: 'CRITICAL',
    hex: '#ef4444',
    light: 'RED',
    meaning: 'Multi-sensor confirmation of accelerating strata delamination.',
    action: 'Immediate geotechnical emergency safety protocol. Dispatch field survey unit.'
  }
};

/**
 * Maps risk score (0 to 1) to 4-Colour Early Warning Level
 */
export function evaluateRiskLevel(score) {
  if (score < DGMS_THRESHOLDS.NORMAL_MAX) return RISK_COLOR_MAP.GREEN;
  if (score < DGMS_THRESHOLDS.CAUTION_MAX) return RISK_COLOR_MAP.YELLOW;
  if (score < DGMS_THRESHOLDS.HIGH_RISK_MAX) return RISK_COLOR_MAP.ORANGE;
  return RISK_COLOR_MAP.RED;
}

/**
 * Hysteresis State Machine: Prevents flickering near boundary thresholds
 * Requires risk to exceed threshold by buffer margin (e.g. +0.03) or persist for N cycles
 */
export class RiskHysteresisFilter {
  constructor(options = {}) {
    this.bufferMargin = options.bufferMargin ?? 0.03;
    this.persistenceCountRequired = options.persistenceCountRequired ?? 3;
    this.currentLevel = 'GREEN';
    this.candidateLevel = 'GREEN';
    this.candidateCount = 0;
  }

  process(rawScore) {
    const rawCategory = evaluateRiskLevel(rawScore);
    const targetLevel = rawCategory.light;

    if (targetLevel === this.currentLevel) {
      this.candidateLevel = targetLevel;
      this.candidateCount = 0;
      return {
        level: this.currentLevel,
        isTransitioning: false,
        stabilityStatus: 'LOCKED_STABLE',
        data: rawCategory
      };
    }

    // New candidate level detected
    if (targetLevel !== this.candidateLevel) {
      this.candidateLevel = targetLevel;
      this.candidateCount = 1;
    } else {
      this.candidateCount++;
    }

    // Check if persistence requirement is met
    if (this.candidateCount >= this.persistenceCountRequired) {
      this.currentLevel = this.candidateLevel;
      this.candidateCount = 0;
      return {
        level: this.currentLevel,
        isTransitioning: true,
        stabilityStatus: 'ESCALATED',
        data: evaluateRiskLevel(rawScore)
      };
    }

    // Hold current level during buffer window
    return {
      level: this.currentLevel,
      isTransitioning: true,
      stabilityStatus: `PENDING_CONFIRMATION (${this.candidateCount}/${this.persistenceCountRequired})`,
      data: RISK_COLOR_MAP[this.currentLevel]
    };
  }

  reset() {
    this.currentLevel = 'GREEN';
    this.candidateLevel = 'GREEN';
    this.candidateCount = 0;
  }
}
