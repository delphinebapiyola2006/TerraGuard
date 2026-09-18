/**
 * MINESONIC: Sensor Data & Maintenance Model
 * Smart India Hackathon 2026 | Team Recursion Rebels
 */

export class Sensor {
  constructor(data = {}) {
    this.id = data.id || 'SENSOR-001';
    this.nodeId = data.nodeId || 'MSN-001';
    this.type = data.type || 'MULTI_MODAL'; // DISPLACEMENT, TILT, VIBRATION, CRACK, STRAIN, TEMPERATURE
    this.zone = data.zone || 'A17';
    
    // Live sensor values
    this.displacement = Number(data.displacement ?? 1.2); // mm
    this.tilt = Number(data.tilt ?? 0.8); // degrees
    this.vibration = Number(data.vibration ?? 0.6); // mm/s
    this.crack = Number(data.crack ?? 0.1); // mm
    this.strain = Number(data.strain ?? 120); // micro-strain (µε)
    this.temperature = Number(data.temperature ?? 26.5); // °C

    // Baseline thresholds
    this.baseline = {
      displacement: Number(data.baseline?.displacement ?? 4.2),
      tilt: Number(data.baseline?.tilt ?? 2.5),
      vibration: Number(data.baseline?.vibration ?? 1.1),
      crack: Number(data.baseline?.crack ?? 0.5),
      strain: Number(data.baseline?.strain ?? 210),
      temperature: Number(data.baseline?.temperature ?? 30.0)
    };

    // Health metrics
    this.overallHealthScore = Number(data.overallHealthScore ?? 98); // 0 - 100
    this.batteryHealth = Number(data.batteryHealth ?? 95); // 0 - 100
    this.signalHealth = Number(data.signalHealth ?? 92); // 0 - 100
    this.dataQuality = Number(data.dataQuality ?? 99); // 0 - 100
    this.calibrationStatus = data.calibrationStatus || 'CALIBRATED'; // CALIBRATED, DUE, EXPIRED, DRIFT_DETECTED
    this.reliabilityScore = Number(data.reliabilityScore ?? 96); // 0 - 100

    // Anomaly flags
    this.isAnomaly = Boolean(data.isAnomaly);
    this.isStuck = Boolean(data.isStuck);
    this.isDrifting = Boolean(data.isDrifting);
    this.isNoisy = Boolean(data.isNoisy);
    this.isMissing = Boolean(data.isMissing);

    // Maintenance Management Details
    this.lastMaintenanceDate = data.lastMaintenanceDate || '2026-08-15';
    this.nextMaintenanceDate = data.nextMaintenanceDate || '2026-11-15';
    this.maintenanceStatus = data.maintenanceStatus || 'HEALTHY'; // HEALTHY, MAINTENANCE DUE, MAINTENANCE OVERDUE, REPLACEMENT REQUIRED, UNDER MAINTENANCE
    this.maintenanceNotes = data.maintenanceNotes || 'Routine quarterly zero-point calibration and solar glass clean';
    this.replacementRequired = Boolean(data.replacementRequired ?? false);
    this.technicianAssigned = data.technicianAssigned || 'Er. B. Mukherjee (Instrumentation Lead)';

    // Calibration metadata
    this.calibrationOffset = data.calibrationOffset || { displacement: 0, tilt: 0, vibration: 0, crack: 0, strain: 0 };
    this.timestamp = data.timestamp || new Date().toISOString();
  }

  getDeviation(paramKey) {
    const val = this[paramKey];
    const base = this.baseline[paramKey];
    if (!base || base === 0) return 0;
    return (val - base) / base;
  }

  isParameterAbnormal(paramKey) {
    return this[paramKey] > this.baseline[paramKey];
  }
}
