/**
 * MINESONIC: Data Validation & Quality Pipeline Utilities
 * Smart India Hackathon 2026 | Team Recursion Rebels
 */

export const PHYSICAL_LIMITS = {
  displacement: { min: 0, max: 150, maxRateOfChange: 25 }, // mm, max mm/hr
  tilt: { min: 0, max: 45, maxRateOfChange: 10 }, // degrees
  vibration: { min: 0, max: 50, maxRateOfChange: 15 }, // mm/s
  crack: { min: 0, max: 50, maxRateOfChange: 10 }, // mm
  strain: { min: 0, max: 5000, maxRateOfChange: 1000 }, // µε
  temperature: { min: -10, max: 65, maxRateOfChange: 10 }, // °C
  battery: { min: 0, max: 100 },
  rssi: { min: -130, max: -20 }
};

/**
 * Validates whether raw sensor reading is within physically permissible limits
 */
export function validateRange(value, type) {
  const limits = PHYSICAL_LIMITS[type];
  if (!limits) return true;
  if (value === null || value === undefined || isNaN(value)) return false;
  return value >= limits.min && value <= limits.max;
}

/**
 * Detects missing or null fields in a telemetry packet
 */
export function detectMissingFields(payload, requiredFields = ['displacement', 'tilt', 'vibration', 'crack', 'strain']) {
  const missing = [];
  requiredFields.forEach(f => {
    if (payload[f] === undefined || payload[f] === null || isNaN(payload[f])) {
      missing.push(f);
    }
  });
  return {
    hasMissing: missing.length > 0,
    missingFields: missing
  };
}

/**
 * Moving Window Outlier Detection using modified Z-score or standard deviation bounds
 */
export function isOutlier(currentVal, historyArray, thresholdZ = 3.0) {
  if (!historyArray || historyArray.length < 5) return false;
  const mean = historyArray.reduce((a, b) => a + b, 0) / historyArray.length;
  const variance = historyArray.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / historyArray.length;
  const std = Math.sqrt(variance);
  if (std === 0) return false;
  const zScore = Math.abs(currentVal - mean) / std;
  return zScore > thresholdZ;
}

/**
 * Detect stuck sensor (variance ~ 0 across last N samples while active)
 */
export function isSensorStuck(historyArray, minSamples = 6, epsilon = 0.0001) {
  if (!historyArray || historyArray.length < minSamples) return false;
  const first = historyArray[0];
  return historyArray.every(val => Math.abs(val - first) < epsilon);
}

/**
 * Exponential Moving Average (EMA) Noise Filter
 */
export function applyEmaFilter(currentVal, previousSmoothed, alpha = 0.3) {
  if (previousSmoothed === null || previousSmoothed === undefined) return currentVal;
  return Number((alpha * currentVal + (1 - alpha) * previousSmoothed).toFixed(2));
}

/**
 * Normalizes parameter value between 0.0 and 1.0 against its safe baseline limit
 */
export function normalizeParameterScore(val, baseline, criticalMultiplier = 3.0) {
  if (val <= baseline) return 0.1;
  const excess = val - baseline;
  const maxSpan = baseline * (criticalMultiplier - 1.0);
  const normalized = 0.1 + (excess / maxSpan) * 0.9;
  return Math.min(1.0, Math.max(0.0, Number(normalized.toFixed(3))));
}
