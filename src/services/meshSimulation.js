/**
 * Terra Guard - X: Real-Time Wireless Surface Mesh Network Simulation
 * Models 132 smart multi-sensor nodes deployed across geotechnical survey sectors
 */

import { apiService } from './apiService.js';

export class MeshSimulation {
  constructor() {
    this.totalNodesCount = 132;
    this.nodes = [];
    this.gateway = {
      id: 'GW-01',
      name: 'Central Surface LoRaWAN Gateway',
      x: 0,
      y: 0,
      z: 0,
      lat: 23.6845,
      lng: 86.9532,
      status: 'ONLINE',
      frequency: '868.1 MHz',
      ip: '192.168.10.1',
      packetSuccessRate: 98.7,
      uptimeHours: 342
    };

    this.panels = [
      { id: 'A17', name: 'Survey Sector A17 (Active Fault Zone)', depth: 185, risk: 'NORMAL', riskScore: 0.18 },
      { id: 'A12', name: 'Buffer Sector A12', depth: 210, risk: 'NORMAL', riskScore: 0.12 },
      { id: 'A08', name: 'Cavity Monitoring Sector A08', depth: 160, risk: 'NORMAL', riskScore: 0.08 },
      { id: 'B04', name: 'South Slope Sector B04', depth: 240, risk: 'NORMAL', riskScore: 0.05 }
    ];

    // Scenario state: 1 to 5
    this.currentStep = 1;
    this.autoPlay = false;
    this.timer = null;
    this.subscribers = [];

    this.initNodes();
    this.startSimulation();
  }

  initNodes() {
    this.nodes = [];
    const zones = ['A17', 'A12', 'A08', 'B04'];

    // Generate 132 nodes distributed over terrain
    for (let i = 1; i <= this.totalNodesCount; i++) {
      const idNum = String(i).padStart(3, '0');
      const nodeId = `MSN-${idNum}`;
      
      // Distribute nodes across zones with heavy cluster in active Panel A17
      let zone = 'A17';
      if (i > 45 && i <= 80) zone = 'A12';
      else if (i > 80 && i <= 110) zone = 'A08';
      else if (i > 110) zone = 'B04';

      // Spatial placement (radial / grid mesh around gateway)
      const angle = (i * 137.5) * (Math.PI / 180);
      const radius = 25 + Math.sqrt(i) * 16 + (Math.random() * 8 - 4);
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = Math.sin(x * 0.02) * 2.5 + Math.cos(z * 0.02) * 2.0;

      // Realistic GPS offset around Raniganj Coalfield
      const lat = 23.6845 + (z * 0.00008);
      const lng = 86.9532 + (x * 0.00009);

      // Status: 128 Online, 3 Warning, 1 Offline
      let status = 'ONLINE';
      if (i === 132) status = 'OFFLINE';
      else if (i === 38 || i === 72 || i === 99) status = 'WARNING';

      const battery = status === 'OFFLINE' ? 0 : Math.max(15, Math.floor(98 - (i % 25) * 1.8 + (Math.random() * 6 - 3)));
      const rssi = status === 'OFFLINE' ? -120 : Math.floor(-58 - (radius * 0.25) + (Math.random() * 8 - 4));
      const hops = radius > 120 ? 3 : (radius > 60 ? 2 : 1);

      // Maintenance statuses: HEALTHY, MAINTENANCE DUE, MAINTENANCE OVERDUE, REPLACEMENT REQUIRED, UNDER MAINTENANCE
      let maintenanceStatus = 'HEALTHY';
      let replacementRequired = false;
      let nextMaint = '2026-11-15';
      let lastMaint = '2026-08-15';
      let tech = 'Er. B. Mukherjee (Instrumentation Lead)';

      if (i === 132) {
        maintenanceStatus = 'REPLACEMENT REQUIRED';
        replacementRequired = true;
        nextMaint = '2026-09-01 (Immediate)';
        tech = 'Er. S. Sengupta (Surface Tech)';
      } else if (i === 38 || i === 72) {
        maintenanceStatus = 'MAINTENANCE OVERDUE';
        nextMaint = '2026-09-05';
        tech = 'Er. R. Sharma (Geotech Specialist)';
      } else if (i === 99 || i === 14 || i === 45 || i === 62) {
        maintenanceStatus = 'MAINTENANCE DUE';
        nextMaint = '2026-09-20';
        tech = 'Er. B. Mukherjee (Instrumentation Lead)';
      } else if (i === 24) {
        maintenanceStatus = 'UNDER MAINTENANCE';
        nextMaint = '2026-09-12';
        tech = 'Er. A. K. Roy (Senior Geotechnical Officer)';
      }

      this.nodes.push({
        id: nodeId,
        name: `Mesh Node ${nodeId} (${zone})`,
        zone: zone,
        x: Number(x.toFixed(2)),
        y: Number(y.toFixed(2)),
        z: Number(z.toFixed(2)),
        lat: Number(lat.toFixed(6)),
        lng: Number(lng.toFixed(6)),
        battery: battery,
        rssi: rssi,
        hops: hops,
        status: status,
        lastCommunication: 'Just Now',
        lastMaintenanceDate: lastMaint,
        nextMaintenanceDate: nextMaint,
        maintenanceStatus: maintenanceStatus,
        maintenanceNotes: 'Quarterly zero-point recalibration, battery impedance check & LoRa RF test',
        replacementRequired: replacementRequired,
        technicianAssigned: tech,
        sensors: {
          tilt: Number((0.4 + Math.random() * 0.3).toFixed(2)), // degrees
          displacement: Number((1.2 + Math.random() * 0.4).toFixed(2)), // mm
          vibration: Number((0.6 + Math.random() * 0.3).toFixed(2)), // mm/s
          crack: Number((0.1 + Math.random() * 0.1).toFixed(2)), // mm
          strain: Number((120 + Math.random() * 40).toFixed(0)), // micro-strain
          temperature: Number((26.5 + Math.random() * 2).toFixed(1))
        },
        baseline: {
          tilt: 2.5,
          displacement: 4.2,
          vibration: 1.1,
          crack: 0.5,
          strain: 210
        }
      });
    }

    // Save global reference for fast lookup
    if (typeof window !== 'undefined') {
      window.mockSensorFleet = this.nodes;
    }
  }

  /**
   * Set simulation step (1 to 5) for hackathon demo flow
   */
  setStep(step) {
    this.currentStep = Math.max(1, Math.min(5, step));
    this.applyStepData();
    this.notifySubscribers();
  }

  nextStep() {
    let nxt = this.currentStep + 1;
    if (nxt > 5) nxt = 1;
    this.setStep(nxt);
  }

  prevStep() {
    let prev = this.currentStep - 1;
    if (prev < 1) prev = 5;
    this.setStep(prev);
  }

  toggleAutoPlay() {
    this.autoPlay = !this.autoPlay;
    if (this.autoPlay) {
      if (this.autoPlayInterval) clearInterval(this.autoPlayInterval);
      this.autoPlayInterval = setInterval(() => {
        this.nextStep();
      }, 7000);
    } else {
      if (this.autoPlayInterval) clearInterval(this.autoPlayInterval);
      this.autoPlayInterval = null;
    }
    return this.autoPlay;
  }

  applyStepData() {
    // Modify sensor readings and risks based on Step 1 -> Step 5
    // Nodes in Panel A17 (especially MSN-024, MSN-015, MSN-032) will progress
    const a17Nodes = this.nodes.filter(n => n.zone === 'A17');

    a17Nodes.forEach(node => {
      if (this.currentStep === 1) {
        // STEP 1: Normal 🟢 GREEN (Risk ~18%)
        node.sensors.tilt = Number((0.8 + Math.random() * 0.4).toFixed(2));
        node.sensors.displacement = Number((1.5 + Math.random() * 0.5).toFixed(2));
        node.sensors.vibration = Number((0.7 + Math.random() * 0.3).toFixed(2));
        node.sensors.crack = Number((0.2 + Math.random() * 0.1).toFixed(2));
        node.sensors.strain = Number((140 + Math.random() * 30).toFixed(0));
      } else if (this.currentStep === 2) {
        // STEP 2: Tilt increases 🟡 YELLOW (Risk ~32%)
        node.sensors.tilt = Number((3.2 + Math.random() * 0.6).toFixed(2));
        node.sensors.displacement = Number((3.1 + Math.random() * 0.6).toFixed(2));
        node.sensors.vibration = Number((1.2 + Math.random() * 0.4).toFixed(2));
        node.sensors.crack = Number((0.4 + Math.random() * 0.2).toFixed(2));
        node.sensors.strain = Number((310 + Math.random() * 50).toFixed(0));
      } else if (this.currentStep === 3) {
        // STEP 3: Displacement & vibration increase 🟠 ORANGE (Risk ~65%)
        node.sensors.tilt = Number((4.1 + Math.random() * 0.5).toFixed(2));
        node.sensors.displacement = Number((7.8 + Math.random() * 1.2).toFixed(2));
        node.sensors.vibration = Number((3.9 + Math.random() * 0.8).toFixed(2));
        node.sensors.crack = Number((1.9 + Math.random() * 0.4).toFixed(2));
        node.sensors.strain = Number((580 + Math.random() * 70).toFixed(0));
      } else if (this.currentStep >= 4) {
        // STEP 4 & 5: Crack anomaly & multi-sensor confirmation 🔴 RED (Risk ~87%)
        node.sensors.tilt = Number((4.8 + Math.random() * 0.4).toFixed(2));
        node.sensors.displacement = Number((12.4 + Math.random() * 1.1).toFixed(2));
        node.sensors.vibration = Number((6.2 + Math.random() * 0.9).toFixed(2));
        node.sensors.crack = Number((5.8 + Math.random() * 0.6).toFixed(2));
        node.sensors.strain = Number((840 + Math.random() * 90).toFixed(0));
      }
    });

    // Specific highlight node MSN-024
    const keyNode = this.nodes.find(n => n.id === 'MSN-024') || this.nodes[0];
    if (this.currentStep >= 4) {
      keyNode.sensors.tilt = 4.8;
      keyNode.sensors.displacement = 12.4;
      keyNode.sensors.vibration = 6.2;
      keyNode.sensors.crack = 5.8;
      keyNode.sensors.strain = 840;
    }
  }

  getRiskState() {
    switch (this.currentStep) {
      case 1:
        return {
          step: 1,
          stepTitle: 'Step 1: Baseline Normal Operation',
          level: 'NORMAL',
          color: 'GREEN',
          hexColor: '#10b981',
          score: 0.18,
          confidence: 0.96,
          trend: 'STABLE',
          affectedZone: 'All Zones Normal',
          explanationSummary: 'Surface deformation within safe baseline parameters. Continuous wireless mesh telemetry streaming.',
          actionRequired: 'Continue routine 24/7 automated monitoring.'
        };
      case 2:
        return {
          step: 2,
          stepTitle: 'Step 2: Early Tilt Anomaly Detected',
          level: 'CAUTION',
          color: 'YELLOW',
          hexColor: '#f59e0b',
          score: 0.32,
          confidence: 0.88,
          trend: 'INCREASING',
          affectedZone: 'Panel A17 (West Section)',
          explanationSummary: 'Unilateral tilt sensor deviations detected in cluster MSN-020 to MSN-026 above Longwall Panel A17.',
          actionRequired: 'Increase mesh sampling rate to 10 Hz and notify surface safety engineer.'
        };
      case 3:
        return {
          step: 3,
          stepTitle: 'Step 3: Multi-Sensor Anomaly Emergence',
          level: 'HIGH RISK',
          color: 'ORANGE',
          hexColor: '#f97316',
          score: 0.65,
          confidence: 0.91,
          trend: 'INCREASING',
          affectedZone: 'Panel A17 (Longwall Face)',
          explanationSummary: 'Cross-sensor correlation triggers: ground displacement reached 7.8 mm and micro-vibration elevated.',
          actionRequired: 'Initiate field engineering inspection and prepare barrier perimeter around Panel A17.'
        };
      case 4:
        return {
          step: 4,
          stepTitle: 'Step 4: Crack Initiation & Multi-Sensor Fusion Agreement',
          level: 'CRITICAL',
          color: 'RED',
          hexColor: '#ef4444',
          score: 0.87,
          confidence: 0.94,
          trend: 'RAPIDLY INCREASING',
          affectedZone: 'Sector A17 (Full Span)',
          explanationSummary: 'Crack width accelerated to 5.8 mm. 5 out of 5 independent sensor categories confirm severe strata delamination.',
          actionRequired: 'Execute immediate geotechnical safety emergency assessment and halt surface traffic.'
        };
      case 5:
      default:
        return {
          step: 5,
          stepTitle: 'Step 5: Automated Early Warning & 4D Digital Twin Dispatch',
          level: 'CRITICAL',
          color: 'RED',
          hexColor: '#ef4444',
          score: 0.87,
          confidence: 0.94,
          trend: 'RAPIDLY INCREASING',
          affectedZone: 'Sector A17 (Full Span)',
          explanationSummary: 'AI Evidence Fusion engine has localized the critical subsidence trough. Multi-horizon 4D forecast updated.',
          actionRequired: 'Follow Geotechnical Emergency Protocol: dispatch field survey team and sound sector siren.'
        };
    }
  }

  getGlobalTelemetry() {
    const risk = this.getRiskState();
    const activeNodes = this.nodes.filter(n => n.status === 'ONLINE').length;
    const warningNodes = this.nodes.filter(n => n.status === 'WARNING').length;
    const offlineNodes = this.nodes.filter(n => n.status === 'OFFLINE').length;

    // Peak telemetry from Panel A17
    const keyNode = this.nodes.find(n => n.id === 'MSN-024') || this.nodes[0];

    return {
      timestamp: new Date().toLocaleTimeString(),
      isoTimestamp: new Date().toISOString(),
      totalNodes: this.totalNodesCount,
      onlineNodes: activeNodes,
      warningNodes: warningNodes,
      offlineNodes: offlineNodes,
      networkHealthPercent: 97,
      packetSuccessRate: 98.7,
      gateway: this.gateway,
      risk: risk,
      peakNode: keyNode,
      zones: {
        normal: this.currentStep === 1 ? 4 : (this.currentStep === 2 ? 3 : 2),
        caution: this.currentStep === 2 ? 1 : 1,
        highRisk: this.currentStep === 3 ? 1 : 0,
        critical: this.currentStep >= 4 ? 1 : 0
      },
      sensorEvidence: {
        contributions: [
          { name: 'Displacement', key: 'DISPLACEMENT', weight: 31, value: `${keyNode.sensors.displacement} mm`, baseline: '4.2 mm', status: keyNode.sensors.displacement > 4.2 ? 'ABNORMAL' : 'NORMAL' },
          { name: 'Tilt', key: 'TILT', weight: 24, value: `${keyNode.sensors.tilt}°`, baseline: '2.5°', status: keyNode.sensors.tilt > 2.5 ? 'ABNORMAL' : 'NORMAL' },
          { name: 'Strain', key: 'STRAIN', weight: 22, value: `${keyNode.sensors.strain} µε`, baseline: '210 µε', status: keyNode.sensors.strain > 210 ? 'ABNORMAL' : 'NORMAL' },
          { name: 'Vibration', key: 'VIBRATION', weight: 15, value: `${keyNode.sensors.vibration} mm/s`, baseline: '1.1 mm/s', status: keyNode.sensors.vibration > 1.1 ? 'ABNORMAL' : 'NORMAL' },
          { name: 'Crack', key: 'CRACK', weight: 8, value: `${keyNode.sensors.crack} mm`, baseline: '0.5 mm', status: keyNode.sensors.crack > 0.5 ? 'ABNORMAL' : 'NORMAL' }
        ],
        agreementRatio: this.currentStep === 1 ? '0 out of 5' : (this.currentStep === 2 ? '1 out of 5' : (this.currentStep === 3 ? '3 out of 5' : '5 out of 5')),
        agreementPercent: this.currentStep === 1 ? 0 : (this.currentStep === 2 ? 20 : (this.currentStep === 3 ? 60 : 100))
      },
      prediction: {
        now: keyNode.sensors.displacement,
        plus6h: Number((keyNode.sensors.displacement * 1.43).toFixed(1)),
        plus12h: Number((keyNode.sensors.displacement * 1.86).toFixed(1)),
        plus24h: Number((keyNode.sensors.displacement * 2.55).toFixed(1)),
        plus48h: Number((keyNode.sensors.displacement * 3.42).toFixed(1))
      }
    };
  }

  startSimulation() {
    this.applyStepData();
    // Minor jitter timer every 2 seconds for alive feeling
    this.timer = setInterval(() => {
      this.addMicroFluctuations();
      this.notifySubscribers();
    }, 2000);
  }

  addMicroFluctuations() {
    // Add realistic 1-2% jitter to keep UI live without disrupting step state
    this.nodes.forEach(node => {
      if (node.status === 'OFFLINE') return;
      const jitter = (Math.random() - 0.5) * 0.05;
      node.sensors.vibration = Math.max(0.1, Number((node.sensors.vibration + jitter * 0.2).toFixed(2)));
    });
  }

  subscribe(callback) {
    this.subscribers.push(callback);
    callback(this.getGlobalTelemetry());
    return () => {
      this.subscribers = this.subscribers.filter(fn => fn !== callback);
    };
  }

  notifySubscribers() {
    const data = this.getGlobalTelemetry();
    apiService.broadcastTelemetry(data);
    this.subscribers.forEach(fn => {
      try {
        fn(data);
      } catch (err) {
        console.error('Error notifying mesh subscriber:', err);
      }
    });
  }
}

export const meshSimulation = new MeshSimulation();
