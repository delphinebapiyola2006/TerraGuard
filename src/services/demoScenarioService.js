/**
 * TERRA GUARD - X: Smart India Hackathon Demo Scenario Controller Service
 * Coordinates the 5-Step Presentation Flow & Explainable Demonstration Context
 * Smart India Hackathon 2026 | Terra Guard - X
 */

import { meshSimulation } from './meshSimulation.js';
import { notificationService } from './notificationService.js';

export class DemoScenarioService {
  constructor() {
    this.steps = [
      {
        step: 1,
        title: 'Step 1: Baseline Normal Operation',
        shortLabel: '🟢 Normal (18%)',
        level: 'NORMAL',
        color: 'GREEN',
        score: 0.18,
        light: 'GREEN',
        siren: false,
        whatIsHappening: 'The monitored terrain is operating under standard geomechanical equilibrium. All strata layers exhibit steady-state elastic behavior.',
        whatSensorsChanged: 'Sensors report nominal baselines: Tilt ~0.8°, Displacement ~1.5mm, Vibration ~0.7mm/s, Strain ~140µε, Crack ~0.2mm.',
        whatAiIsDoing: 'Multi-Sensor Evidence Fusion confirms 0 out of 5 sensor anomalies. Bayesian confidence score is 96% in normal safety state.',
        whyRiskIsIncreasing: 'Risk is at resting minimum baseline (18%). No localized shear strain or subsurface void compaction detected.',
        recommendedAction: 'Continue routine 24/7 autonomous wireless mesh telemetry streaming.'
      },
      {
        step: 2,
        title: 'Step 2: Early Tilt Anomaly Detected',
        shortLabel: '🟡 Tilt Anomaly (32%)',
        level: 'CAUTION',
        color: 'YELLOW',
        score: 0.32,
        light: 'YELLOW',
        siren: false,
        whatIsHappening: 'Differential subsurface strata sag initiated in Sector A17 due to void formation in underlying strata layers.',
        whatSensorsChanged: 'Tilt Inclinometer rose from 0.8° to 3.2° (exceeding 2.5° baseline). Strain increased to 310µε.',
        whatAiIsDoing: 'AI flags an isolated anomaly. Sensor Health AI verifies hardware validity (Link Quality: 95%, Battery: 88%, No drift/stuck detected).',
        whyRiskIsIncreasing: 'Risk elevated to 32% (CAUTION) due to unilateral slope divergence across cluster TGX-020 to TGX-026.',
        recommendedAction: 'Increase LoRa mesh transmission frequency to 10 Hz and notify surface safety engineer.'
      },
      {
        step: 3,
        title: 'Step 3: Multi-Sensor Anomaly Emergence',
        shortLabel: '🟠 Sensor Fusion (65%)',
        level: 'HIGH RISK',
        color: 'ORANGE',
        score: 0.65,
        light: 'ORANGE',
        siren: false,
        whatIsHappening: 'Strata delamination spreading upward from subsurface void toward the upper barrier bed.',
        whatSensorsChanged: 'Ground displacement climbed to 7.8mm (+86%), micro-vibration surged to 3.9mm/s, strain reached 580µε.',
        whatAiIsDoing: 'Evidence Fusion registers 3 out of 5 abnormal sensor categories. Spatial agreement confirms 7 nearby nodes exhibiting identical vectors.',
        whyRiskIsIncreasing: 'Risk score elevated to 65% (HIGH RISK) because multiple independent physical modalities corroborate ground failure.',
        recommendedAction: 'Dispatch field engineering inspection team and establish a safety barrier around Sector A17 perimeter.'
      },
      {
        step: 4,
        title: 'Step 4: Critical Crack Growth & Fusion Agreement',
        shortLabel: '🔴 Critical Crack (87%)',
        level: 'CRITICAL',
        color: 'RED',
        score: 0.87,
        light: 'RED',
        siren: true,
        whatIsHappening: 'Main ground collapse is imminent. Tensile fractures have propagated through the upper siltstone layer to the surface.',
        whatSensorsChanged: 'Surface crack aperture opened dramatically to 5.8mm (+1060%). Displacement surged to 12.4mm, Vibration to 6.2mm/s.',
        whatAiIsDoing: 'AI confirms 5 out of 5 sensor categories in full agreement. Spatial confidence reaches 94%. Strata deformation forecast generated.',
        whyRiskIsIncreasing: 'Risk hits 87% (CRITICAL) as displacement rate crosses the catastrophic failure threshold (>0.8 mm/hr).',
        recommendedAction: 'Execute mandatory geotechnical safety evacuation protocol. Halt surface haulage traffic and prepare emergency response teams.'
      },
      {
        step: 5,
        title: 'Step 5: Automated Alert Dispatch & Digital Twin Action',
        shortLabel: '🚨 AI Dispatch & Action',
        level: 'CRITICAL',
        color: 'RED',
        score: 0.87,
        light: 'RED',
        siren: true,
        whatIsHappening: 'Autonomous safety systems activated. 4D Digital Twin highlights localized subsidence trough and safe evacuation corridors.',
        whatSensorsChanged: 'Peak deformation localized at Node TGX-024 (Lat 23.6845, Lng 86.9532) above Sector A17 deformation zone.',
        whatAiIsDoing: 'Automated dispatch sent to ESP32 physical alert beacons, Safety Audit PDF generated, siren activated on ground surface.',
        whyRiskIsIncreasing: 'Risk remains locked at Critical (87%) under alert hysteresis until field verification team completes stabilization.',
        recommendedAction: 'Verify personnel evacuation count, review 48-hour forward subsidence profile, and log emergency audit entry.'
      }
    ];

    this.currentStepIndex = 0;
    this.isPlaying = false;
    this.autoPlayTimer = null;
    this.listeners = [];
  }

  getCurrentStep() {
    return this.steps[this.currentStepIndex];
  }

  setStep(stepNumber) {
    const idx = Math.max(0, Math.min(this.steps.length - 1, stepNumber - 1));
    this.currentStepIndex = idx;
    const current = this.steps[this.currentStepIndex];

    // Trigger simulation and physical beacon update
    meshSimulation.setStep(stepNumber);
    notificationService.dispatchPhysicalAlert('A17', current.level, current.light, current.siren);

    this.notify();
    return current;
  }

  nextStep() {
    let nextIdx = (this.currentStepIndex + 1) % this.steps.length;
    return this.setStep(nextIdx + 1);
  }

  prevStep() {
    let prevIdx = (this.currentStepIndex - 1 + this.steps.length) % this.steps.length;
    return this.setStep(prevIdx + 1);
  }

  reset() {
    return this.setStep(1);
  }

  toggleAutoPlay(intervalMs = 8000) {
    this.isPlaying = !this.isPlaying;
    if (this.isPlaying) {
      if (this.autoPlayTimer) clearInterval(this.autoPlayTimer);
      this.autoPlayTimer = setInterval(() => {
        this.nextStep();
      }, intervalMs);
    } else {
      if (this.autoPlayTimer) clearInterval(this.autoPlayTimer);
      this.autoPlayTimer = null;
    }
    this.notify();
    return this.isPlaying;
  }

  subscribe(callback) {
    this.listeners.push(callback);
    callback(this.getCurrentStep(), this.isPlaying);
    return () => {
      this.listeners = this.listeners.filter(fn => fn !== callback);
    };
  }

  notify() {
    const cur = this.getCurrentStep();
    this.listeners.forEach(fn => {
      try {
        fn(cur, this.isPlaying);
      } catch (e) {
        console.error('DemoScenarioService notify error:', e);
      }
    });
  }
}

export const demoScenarioService = new DemoScenarioService();
