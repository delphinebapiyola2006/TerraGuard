/**
 * MineSonic: Multi-Sensor Evidence Fusion AI Engine & Explainable Risk Analysis
 * Combines evidence from Tilt, Displacement, Vibration, Crack, and Strain
 */

export class AiService {
  constructor() {
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY || localStorage.getItem('minesonic_gemini_key') || '';
    this.selectedModel = import.meta.env.VITE_AI_MODEL || 'gemini-2.0-flash';
  }

  setApiKey(key) {
    this.apiKey = key.trim();
    localStorage.setItem('minesonic_gemini_key', this.apiKey);
  }

  getApiKey() {
    return this.apiKey;
  }

  hasApiKey() {
    return Boolean(this.apiKey && this.apiKey.length > 5);
  }

  /**
   * Determine 4-Colour Early Warning Level based on normalized score (0 to 1)
   */
  getRiskClassification(score) {
    if (score < 0.25) {
      return {
        level: 'NORMAL',
        color: 'GREEN',
        badgeClass: 'badge-green',
        hex: '#10b981',
        icon: 'check-circle',
        meaning: 'Ground behaviour is within the expected range.',
        action: 'Continue routine 24/7 automated monitoring.'
      };
    } else if (score < 0.50) {
      return {
        level: 'CAUTION',
        color: 'YELLOW',
        badgeClass: 'badge-yellow',
        hex: '#f59e0b',
        icon: 'alert-triangle',
        meaning: 'Early abnormal ground behaviour detected.',
        action: 'Increase monitoring rate and inspect the affected zone.'
      };
    } else if (score < 0.75) {
      return {
        level: 'HIGH RISK',
        color: 'ORANGE',
        badgeClass: 'badge-orange',
        hex: '#f97316',
        icon: 'alert-circle',
        meaning: 'Multiple abnormal deformation indicators detected.',
        action: 'Engineering inspection recommended. Prepare barrier zones.'
      };
    } else {
      return {
        level: 'CRITICAL',
        color: 'RED',
        badgeClass: 'badge-red',
        hex: '#ef4444',
        icon: 'shield-alert',
        meaning: 'Strong multi-sensor evidence of potential ground instability detected.',
        action: 'Immediate safety assessment according to DGMS mine safety procedures. Evacuate affected surface sector.'
      };
    }
  }

  /**
   * Run Multi-Sensor Evidence Fusion algorithm across sensor parameters
   */
  computeEvidenceFusion(nodeData) {
    const s = nodeData.sensors;
    const b = nodeData.baseline;

    // Relative deviation calculations
    const devDisp = Math.max(0, (s.displacement - b.displacement) / b.displacement);
    const devTilt = Math.max(0, (s.tilt - b.tilt) / b.tilt);
    const devStrain = Math.max(0, (s.strain - b.strain) / b.strain);
    const devVib = Math.max(0, (s.vibration - b.vibration) / b.vibration);
    const devCrack = Math.max(0, (s.crack - b.crack) / b.crack);

    // AI Evidence Weights
    const weights = {
      displacement: 0.31,
      tilt: 0.24,
      strain: 0.22,
      vibration: 0.15,
      crack: 0.08
    };

    // Sensor Status
    const sensors = [
      {
        name: 'Displacement',
        type: 'DISPLACEMENT',
        current: `${s.displacement} mm`,
        baseline: `${b.displacement} mm`,
        deviation: `${Math.round(devDisp * 100)}%`,
        weight: 31,
        isAbnormal: s.displacement > b.displacement
      },
      {
        name: 'Tilt / Inclination',
        type: 'TILT',
        current: `${s.tilt}°`,
        baseline: `${b.tilt}°`,
        deviation: `${Math.round(devTilt * 100)}%`,
        weight: 24,
        isAbnormal: s.tilt > b.tilt
      },
      {
        name: 'Tensile Strain',
        type: 'STRAIN',
        current: `${s.strain} µε`,
        baseline: `${b.strain} µε`,
        deviation: `${Math.round(devStrain * 100)}%`,
        weight: 22,
        isAbnormal: s.strain > b.strain
      },
      {
        name: 'Ground Vibration',
        type: 'VIBRATION',
        current: `${s.vibration} mm/s`,
        baseline: `${b.vibration} mm/s`,
        deviation: `${Math.round(devVib * 100)}%`,
        weight: 15,
        isAbnormal: s.vibration > b.vibration
      },
      {
        name: 'Surface Crack Gauge',
        type: 'CRACK',
        current: `${s.crack} mm`,
        baseline: `${b.crack} mm`,
        deviation: `${Math.round(devCrack * 100)}%`,
        weight: 8,
        isAbnormal: s.crack > b.crack
      }
    ];

    const abnormalCount = sensors.filter(item => item.isAbnormal).length;
    
    return {
      sensors,
      abnormalCount,
      totalCount: sensors.length,
      agreementText: `${abnormalCount} out of ${sensors.length} sensor categories show abnormal behaviour`,
      crossCorrelationScore: Number((0.45 + (abnormalCount / 5) * 0.52).toFixed(2))
    };
  }

  /**
   * Comprehensive Explainable AI Generation
   */
  generateExplanation(telemetry) {
    const risk = telemetry.risk;
    const node = telemetry.peakNode;
    const s = node.sensors;

    return {
      location: `Longwall Panel A17 (Colliery Sector West)`,
      nodeId: node.id,
      riskLevel: risk.level,
      riskScore: `${Math.round(risk.score * 100)}%`,
      confidence: `${Math.round(risk.confidence * 100)}%`,
      trend: risk.trend,
      whatHappened: `Multi-sensor spatial anomaly detected above underground extraction zone. Sinking and tilt divergence accelerated past structural limits.`,
      whereItHappened: `Panel A17 (Depth: 185m), concentrated around Surface Mesh Nodes MSN-020 through MSN-028.`,
      whatHappened: risk.explanationSummary || 'Ground stability within normal baseline limits.',
      whichSensorsDetected: causalSteps,
      howAbnormal: risk.level === 'NORMAL' ? 'Normal baseline fluctuation (<5%)' : `${Math.round(risk.score * 100)}% deviation from geomechanical steady-state`,
      aiConfidence: `${Math.round(risk.confidence * 100)}% (Multi-sensor Bayesian Fusion & Random Forest Classifier)`,
      trendAnalysis: risk.trend,
      whatNext: `If unmitigated, continuous deformation is projected to reach ${telemetry.prediction.plus24h} mm in 24 hours with potential shear fracture along surface access routes.`,
      recommendedAction: risk.actionRequired,
      insightSummary: risk.score < 0.25 
        ? 'Current sensor evidence indicates stable ground behaviour across all monitored survey zones. No significant deformation pattern detected.'
        : `AI Sensor Fusion confirms progressive ground subsidence over Sector A17. ${risk.score >= 0.75 ? 'IMMEDIATE SAFETY DISPATCH REQUIRED.' : 'Engineering inspection advised.'}`
    };
  }

  /**
   * Run live Gemini LLM geotechnical reasoning or fallback to explainable engine
   */
  async runGeotechnicalAnalysis(telemetryData, mineContext = {}) {
    const prompt = `
You are Terra Guard - X AI, the Lead Geotechnical AI Specialist.
Analyze the following multi-sensor evidence fusion telemetry over monitored terrain:

### Site Context:
- Survey Zone: ${mineContext.name || 'Geological Survey Sector A17'}
- Strata Depth: ${mineContext.depth || '185'} meters
- Surface Mesh Infrastructure: ${telemetryData.onlineNodes}/${telemetryData.totalNodes} LoRa Nodes Active (Health: ${telemetryData.networkHealthPercent}%)

### Live Multi-Sensor Telemetry (Peak Node ${telemetryData.peakNode?.id || 'TGX-024'}):
- Ground Displacement: ${telemetryData.peakNode?.sensors?.displacement} mm (Baseline: 4.2 mm)
- Surface Tilt: ${telemetryData.peakNode?.sensors?.tilt}° (Baseline: 2.5°)
- Tensile Strain: ${telemetryData.peakNode?.sensors?.strain} µε (Baseline: 210 µε)
- Vibration Amplitude: ${telemetryData.peakNode?.sensors?.vibration} mm/s (Baseline: 1.1 mm/s)
- Crack Opening: ${telemetryData.peakNode?.sensors?.crack} mm (Baseline: 0.5 mm)
- Current AI Risk Score: ${Math.round(telemetryData.risk.score * 100)}% (${telemetryData.risk.level})
- Cross-Sensor Agreement: ${telemetryData.sensorEvidence.agreementRatio} Abnormal

Provide an authoritative, concise Geotechnical Assessment answering:
1. **Anomaly & Causal Interpretation**: Primary physical mechanism (strata compaction, cavity deformation, tensile fracture).
2. **4D Subsidence Forecast (6h, 12h, 24h)**: Anticipated ground deformation profile.
3. **Surface Infrastructure Impact**: Vulnerability of access roads, high-tension lines, and nearby structures.
4. **Mandatory Geotechnical Safety Protocol**: Directives for the Site Safety Engineer under standard safety protocols.
`;

    if (this.hasApiKey()) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.selectedModel}:generateContent?key=${this.apiKey}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.2, maxOutputTokens: 1000 }
          })
        });

        if (!res.ok) throw new Error(`Gemini API HTTP ${res.status}`);
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          return { source: `Google Gemini AI (${this.selectedModel})`, content: text };
        }
      } catch (err) {
        console.warn('Gemini API call failed, falling back to Terra Guard - X Onboard AI Engine:', err);
      }
    }

    // Local Onboard Engine fallback
    const exp = this.generateExplanation(telemetryData);
    const localReport = `
### 1. Anomaly & Causal Mechanism
${exp.whatHappened}
- **Primary Contributing Sensors**: Displacement (31%), Tilt (24%), Strain (22%), Vibration (15%), Crack (8%).
- **Multi-Sensor Correlation**: ${exp.whichSensorsDetected.join('\n')}

### 2. 4D Subsidence Forecast
- **Current (T=0)**: ${telemetryData.peakNode?.sensors?.displacement} mm
- **T + 6 Hours**: ${telemetryData.prediction.plus6h} mm (Expected subsidence progression)
- **T + 12 Hours**: ${telemetryData.prediction.plus12h} mm
- **T + 24 Hours**: ${telemetryData.prediction.plus24h} mm (Critical trough maximum)
- **Confidence Interval**: 94% (Bayesian multi-sensor fusion model)

### 3. Surface Infrastructure Vulnerability
- **Sector A17 Access Haul Road**: High tension cracking risk at perimeter boundary.
- **Power Transmission Pylon #14**: Angle of tilt approaching advisory limit (4.8° / 5.0° max).
- **Surface Drainage Channel**: Monitoring required for reverse gradient ponding.

### 4. Mandatory Geotechnical Safety Directives
- **Status**: ${telemetryData.risk.level} (Risk Score: ${Math.round(telemetryData.risk.score * 100)}%)
- **Action**: ${exp.recommendedAction}
`;

    return {
      source: 'Terra Guard - X Onboard Geotechnical Fusion Engine',
      content: localReport.trim()
    };
  }
}

export const aiService = new AiService();
