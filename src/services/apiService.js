/**
 * MineSonic: REST & WebSocket Mock API Service
 * Standardized communication layer for Edge Gateways & Cloud AI Engine
 */

export class ApiService {
  constructor() {
    this.wsConnected = true;
    this.listeners = new Map();
    this.mockLatencyMs = 60;
  }

  /**
   * Mock REST: Fetch live sensor telemetry for all nodes or a specific zone
   */
  async getLiveSensorTelemetry(zoneId = null) {
    await this._simulateLatency();
    return {
      timestamp: new Date().toISOString(),
      gateway_id: 'GW-TERRAGUARDX-01',
      zone_id: zoneId || 'ALL',
      sampling_rate_hz: 10,
      protocol: 'LoRaWAN 868MHz Mesh',
      packet_success_rate: 98.7,
      active_nodes: 128,
      total_nodes: 132
    };
  }

  /**
   * Mock REST: Fetch AI Risk Evaluation for a given zone (e.g. Panel A17)
   */
  async getAiRiskAnalysis(zoneId = 'A17') {
    await this._simulateLatency();
    return {
      zone_id: zoneId,
      colliery: 'Raniganj Coalfield - Longwall Panel A17',
      risk_score: 0.87,
      risk_level: 'CRITICAL',
      color_code: 'RED',
      confidence: 0.94,
      trend: 'INCREASING',
      timestamp: new Date().toISOString(),
      sensor_contributions: [
        { sensor: 'DISPLACEMENT', contribution: 31, status: 'ABNORMAL', value: '12.4 mm', baseline: '4.2 mm' },
        { sensor: 'TILT', contribution: 24, status: 'ABNORMAL', value: '4.8°', baseline: '2.5°' },
        { sensor: 'STRAIN', contribution: 22, status: 'ABNORMAL', value: '840 µε', baseline: '210 µε' },
        { sensor: 'VIBRATION', contribution: 15, status: 'ABNORMAL', value: '6.2 mm/s', baseline: '1.1 mm/s' },
        { sensor: 'CRACK', contribution: 8, status: 'ABNORMAL', value: '5.8 mm', baseline: '0.5 mm' }
      ],
      evidence_agreement: {
        total_sensor_categories: 5,
        abnormal_sensor_categories: 5,
        agreement_level: 'HIGH (5/5 sensors confirm anomaly)',
        cross_correlation_score: 0.91
      },
      prediction: {
        current_displacement_mm: 12.4,
        t_plus_6h_mm: 17.8,
        t_plus_12h_mm: 23.1,
        t_plus_24h_mm: 31.6,
        t_plus_48h_mm: 42.5,
        confidence_interval_95: '± 2.1 mm'
      },
      causal_chain: [
        '1. Ground displacement increased above baseline in Survey Sector A17.',
        '2. Tilt measurements show continuous unilateral increase beyond 4.5° threshold.',
        '3. Micro-vibration sensors registered anomalous high-frequency strata fracturing signals.',
        '4. Surface crack gauge TGX-024 detected aperture expansion to 5.8 mm.',
        '5. Multiple wireless mesh nodes cross-correlated the continuous deformation vector.'
      ],
      ai_interpretation:
        'The multi-sensor evidence fusion algorithm detects accelerated strata delamination and progressive void collapse in Sector A17. Surface tensile stress has exceeded safe limits.',
      recommended_action:
        'Immediate field verification and safety assessment recommended. Halt heavy machinery near Sector A17 surface access road. Execute Emergency Geotechnical Safety Protocol.'
    };
  }

  /**
   * Mock REST: Fetch all sensor inventory with status
   */
  async getSensorsList() {
    await this._simulateLatency();
    return window.mockSensorFleet || [];
  }

  /**
   * Mock WebSocket: Subscribe to live real-time telemetry stream
   */
  subscribeTelemetry(callback) {
    if (!this.listeners.has('telemetry')) {
      this.listeners.set('telemetry', []);
    }
    this.listeners.get('telemetry').push(callback);
    return () => {
      const subs = this.listeners.get('telemetry') || [];
      this.listeners.set('telemetry', subs.filter(fn => fn !== callback));
    };
  }

  /**
   * Mock WebSocket broadcast event
   */
  broadcastTelemetry(payload) {
    const subs = this.listeners.get('telemetry') || [];
    subs.forEach(fn => {
      try {
        fn(payload);
      } catch (err) {
        console.error('Error in telemetry listener:', err);
      }
    });
  }

  _simulateLatency() {
    return new Promise(resolve => setTimeout(resolve, this.mockLatencyMs));
  }
}

export const apiService = new ApiService();
