/**
 * MINESONIC: Sensor Health AI & Hardware Reliability Layer
 * Distinguishes genuine strata ground movement from hardware faults, drift, and noise.
 * Smart India Hackathon 2026 | Team Recursion Rebels
 */

import { validateRange, isOutlier, isSensorStuck } from '../utils/dataValidation.js';
import { rssiToSignalQuality, voltageToBatteryPercent, findNearbyNodes } from '../utils/sensorUtils.js';

export class SensorHealthService {
  constructor() {
    this.historyBuffer = new Map(); // nodeId -> { displacement: [], tilt: [], vibration: [], crack: [], strain: [] }
    this.bufferLimit = 20;
    this.calibrationRegistry = new Map();
  }

  /**
   * Push reading to history window
   */
  recordSample(nodeId, sensors) {
    if (!this.historyBuffer.has(nodeId)) {
      this.historyBuffer.set(nodeId, {
        displacement: [],
        tilt: [],
        vibration: [],
        crack: [],
        strain: []
      });
    }
    const buf = this.historyBuffer.get(nodeId);
    Object.keys(buf).forEach(key => {
      if (sensors[key] !== undefined && sensors[key] !== null) {
        buf[key].push(Number(sensors[key]));
        if (buf[key].length > this.bufferLimit) buf[key].shift();
      }
    });
  }

  /**
   * 1. Validate Sensor Data against physical range limits
   */
  validateSensorData(sensors) {
    const invalidChannels = [];
    const channels = ['displacement', 'tilt', 'vibration', 'crack', 'strain'];

    channels.forEach(ch => {
      if (!validateRange(sensors[ch], ch)) {
        invalidChannels.push(ch);
      }
    });

    return {
      isValid: invalidChannels.length === 0,
      invalidChannels
    };
  }

  /**
   * 2. Detect Missing Sensor Channels
   */
  detectMissingData(sensors) {
    const missing = [];
    const expected = ['displacement', 'tilt', 'vibration', 'crack', 'strain'];
    expected.forEach(k => {
      if (sensors[k] === undefined || sensors[k] === null || isNaN(sensors[k])) {
        missing.push(k);
      }
    });
    return {
      hasMissing: missing.length > 0,
      missingCount: missing.length,
      missingChannels: missing
    };
  }

  /**
   * 3. Detect Sensor Drift (monotonic creep without spatial agreement)
   */
  detectSensorDrift(nodeId, paramKey = 'tilt') {
    const buf = this.historyBuffer.get(nodeId);
    if (!buf || !buf[paramKey] || buf[paramKey].length < 8) {
      return { isDrifting: false, driftRate: 0 };
    }
    const arr = buf[paramKey];
    let monotonicIncreases = 0;
    for (let i = 1; i < arr.length; i++) {
      if (arr[i] >= arr[i - 1]) monotonicIncreases++;
    }
    const driftRatio = monotonicIncreases / (arr.length - 1);
    const delta = arr[arr.length - 1] - arr[0];
    const isDrifting = driftRatio > 0.85 && Math.abs(delta) > 0.5;

    return {
      isDrifting,
      driftRate: Number((delta / arr.length).toFixed(3)),
      confidence: Number((driftRatio * 100).toFixed(0))
    };
  }

  /**
   * 4. Detect Statistical Outliers
   */
  detectOutliers(nodeId, sensors) {
    const buf = this.historyBuffer.get(nodeId);
    const outliers = [];
    if (!buf) return { hasOutliers: false, outliers: [] };

    ['displacement', 'tilt', 'vibration', 'crack', 'strain'].forEach(ch => {
      if (sensors[ch] !== undefined && isOutlier(sensors[ch], buf[ch])) {
        outliers.push(ch);
      }
    });

    return {
      hasOutliers: outliers.length > 0,
      outliers
    };
  }

  /**
   * 5. Detect Stuck Sensor
   */
  detectStuckSensor(nodeId, paramKey = 'displacement') {
    const buf = this.historyBuffer.get(nodeId);
    if (!buf || !buf[paramKey]) return false;
    return isSensorStuck(buf[paramKey]);
  }

  /**
   * 6. Calculate Multi-Dimensional Sensor Health Score (0 - 100)
   */
  calculateSensorHealthScore(node) {
    this.recordSample(node.id, node.sensors);

    // Battery Health (0 - 100)
    const batteryHealth = Math.min(100, Math.max(0, node.battery));

    // Signal Health (0 - 100)
    const signalHealth = rssiToSignalQuality(node.rssi);

    // Data Validation
    const rangeCheck = this.validateSensorData(node.sensors);
    const missingCheck = this.detectMissingData(node.sensors);
    const outlierCheck = this.detectOutliers(node.id, node.sensors);
    const stuckCheck = this.detectStuckSensor(node.id, 'displacement');
    const driftCheck = this.detectSensorDrift(node.id, 'tilt');

    // Data Quality deductions
    let dataQuality = 100;
    if (!rangeCheck.isValid) dataQuality -= rangeCheck.invalidChannels.length * 20;
    if (missingCheck.hasMissing) dataQuality -= missingCheck.missingCount * 15;
    if (outlierCheck.hasOutliers) dataQuality -= 15;
    if (stuckCheck) dataQuality -= 25;
    if (driftCheck.isDrifting) dataQuality -= 20;
    dataQuality = Math.max(10, dataQuality);

    // Calibration Status
    let calibrationStatus = 'CALIBRATED';
    if (driftCheck.isDrifting) calibrationStatus = 'DRIFT_DETECTED';
    else if (node.battery < 20) calibrationStatus = 'LOW_POWER_RECAL';

    // Reliability Composite: Weighted sum of Quality, Battery, Signal
    const reliabilityScore = Math.round(dataQuality * 0.45 + batteryHealth * 0.30 + signalHealth * 0.25);
    const overallHealthScore = Math.round((dataQuality + batteryHealth + signalHealth + reliabilityScore) / 4);

    // Diagnose Root Cause
    let faultDiagnosis = 'NOMINAL';
    if (node.status === 'OFFLINE') faultDiagnosis = 'COMMUNICATION_FAILURE';
    else if (batteryHealth < 20) faultDiagnosis = 'LOW_BATTERY';
    else if (stuckCheck) faultDiagnosis = 'STUCK_SENSOR';
    else if (driftCheck.isDrifting) faultDiagnosis = 'SENSOR_DRIFT';
    else if (outlierCheck.hasOutliers) faultDiagnosis = 'NOISY_DATA';
    else if (missingCheck.hasMissing) faultDiagnosis = 'MISSING_DATA';
    else if (node.sensors.displacement > node.baseline.displacement * 1.5) faultDiagnosis = 'REAL_GROUND_ANOMALY';

    return {
      nodeId: node.id,
      overallHealthScore,
      batteryHealth,
      signalHealth,
      dataQuality,
      calibrationStatus,
      reliabilityScore,
      faultDiagnosis,
      isRealGroundAnomaly: faultDiagnosis === 'REAL_GROUND_ANOMALY',
      checks: {
        rangeCheck,
        missingCheck,
        outlierCheck,
        stuckCheck,
        driftCheck
      }
    };
  }

  /**
   * 7. Cross-Validate with Nearby Spatial Sensors
   */
  crossValidateNearbySensors(targetNode, allNodes, radiusMeters = 80) {
    const neighbors = findNearbyNodes(targetNode, allNodes, radiusMeters);
    if (neighbors.length === 0) {
      return {
        confirmedByNeighbors: false,
        neighborCount: 0,
        agreementRatio: 0,
        spatialConsistency: 'ISOLATED_NODE'
      };
    }

    const targetDev = targetNode.sensors.displacement > targetNode.baseline.displacement;
    let agreeingNeighbors = 0;

    neighbors.forEach(n => {
      const nDev = n.sensors.displacement > n.baseline.displacement;
      if (nDev === targetDev) agreeingNeighbors++;
    });

    const ratio = agreeingNeighbors / neighbors.length;
    return {
      confirmedByNeighbors: ratio >= 0.5,
      neighborCount: neighbors.length,
      agreeingCount: agreeingNeighbors,
      agreementRatio: Number(ratio.toFixed(2)),
      spatialConsistency: ratio >= 0.7 ? 'STRONG_SPATIAL_CLUSTER' : (ratio >= 0.4 ? 'MODERATE_CONFIRMATION' : 'SINGLE_NODE_OUTLIER')
    };
  }

  /**
   * Fleet-wide sensor health summary
   */
  getFleetHealthSummary(nodes) {
    let sumHealth = 0;
    let sumBatt = 0;
    let sumSignal = 0;
    let nominalCount = 0;
    let warningCount = 0;
    let faultCount = 0;

    nodes.forEach(node => {
      const h = this.calculateSensorHealthScore(node);
      sumHealth += h.overallHealthScore;
      sumBatt += h.batteryHealth;
      sumSignal += h.signalHealth;

      if (h.overallHealthScore >= 80) nominalCount++;
      else if (h.overallHealthScore >= 50) warningCount++;
      else faultCount++;
    });

    const n = Math.max(1, nodes.length);
    return {
      avgHealthScore: Math.round(sumHealth / n),
      avgBattery: Math.round(sumBatt / n),
      avgSignalQuality: Math.round(sumSignal / n),
      nominalCount,
      warningCount,
      faultCount,
      totalNodes: nodes.length
    };
  }
}

export const sensorHealthService = new SensorHealthService();
