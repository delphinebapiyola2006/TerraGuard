/**
 * MINESONIC: Mine Safety Command Centre Main Application Coordinator
 * Team: Recursion Rebels | Smart India Hackathon 2026 (Problem Statement 26025)
 * Ministry of Coal & Coal India Limited (CIL)
 */

import { createIcons, icons } from 'lucide';
import { jsPDF } from 'jspdf';
import { ThreeModelViewer } from './components/ThreeModelViewer.js';
import { MeshTopologyViewer } from './components/MeshTopologyViewer.js';
import { TelemetryCharts } from './components/TelemetryCharts.js';
import { GisMapViewer } from './components/GisMapViewer.js';
import { SubsidenceCanvasViewer } from './components/SubsidenceCanvasViewer.js';

// Core Priority Components
import { SensorHealthPanel } from './components/SensorHealthPanel.js';
import { DataQualityPanel } from './components/DataQualityPanel.js';
import { RiskTimeline } from './components/RiskTimeline.js';
import { AlertWorkflow } from './components/AlertWorkflow.js';
import { PhysicalAlertPanel } from './components/PhysicalAlertPanel.js';
import { DemoController } from './components/DemoController.js';
import { ConfidencePanel } from './components/ConfidencePanel.js';
import { WhyTrustAlert } from './components/WhyTrustAlert.js';

// Missing Features Components
import { GatewayHealthPanel } from './components/GatewayHealthPanel.js';
import { SpatialEvidencePanel } from './components/SpatialEvidencePanel.js';
import { RiskBreakdownPanel } from './components/RiskBreakdownPanel.js';
import { AIArchitecturePanel } from './components/AIArchitecturePanel.js';
import { ZoneComparisonPanel } from './components/ZoneComparisonPanel.js';
import { AuditLogPanel } from './components/AuditLogPanel.js';
import { NetworkAnalyticsPanel } from './components/NetworkAnalyticsPanel.js';

// Services
import { meshSimulation } from './services/meshSimulation.js';
import { aiService } from './services/aiService.js';
import { apiService } from './services/apiService.js';
import { sensorHealthService } from './services/sensorHealthService.js';
import { dataQualityService } from './services/dataQualityService.js';
import { riskEngineService } from './services/riskEngineService.js';
import { predictionService } from './services/predictionService.js';
import { notificationService } from './services/notificationService.js';
import { offlineSyncService } from './services/offlineSyncService.js';
import { demoScenarioService } from './services/demoScenarioService.js';
import { meshRoutingService } from './services/meshRoutingService.js';
import { gatewayHealthService } from './services/gatewayHealthService.js';
import { auditService } from './services/auditService.js';

class MineSonicApp {
  constructor() {
    this.dashTwinViewer = null;
    this.fullTwinViewer = null;
    this.meshViewer = null;
    this.gisMapViewer = null;
    this.subsidenceModelViewer = null;
    this.charts = null;
    this.activeTab = 'dashboard';
    this.currentRole = 'SAFETY_OFFICER';
    
    this.selectedNodeId = 'MSN-024';
    this.audioContext = null;
    this.sirenOscillator = null;

    // Component Instances
    this.demoController = null;
    this.dashSensorHealthPanel = null;
    this.fleetSensorHealthPanel = null;
    this.dashDataQualityPanel = null;
    this.fusionDataQualityPanel = null;
    this.dashRiskTimeline = null;
    this.raRiskTimeline = null;
    this.alertsWorkflow = null;
    this.dashPhysicalAlertPanel = null;
    this.alertsPhysicalAlertPanel = null;
    this.raConfidencePanel = null;
    this.dashWhyTrustAlert = null;
    this.fusionWhyTrustAlert = null;
    this.raWhyTrustAlert = null;

    // Enhanced Component Instances
    this.dashGatewayHealthPanel = null;
    this.meshGatewayHealthPanel = null;
    this.dashSpatialEvidencePanel = null;
    this.fusionSpatialEvidencePanel = null;
    this.raSpatialEvidencePanel = null;
    this.dashRiskBreakdownPanel = null;
    this.raRiskBreakdownPanel = null;
    this.dashAiArchitecturePanel = null;
    this.fusionAiArchitecturePanel = null;
    this.dashZoneComparisonPanel = null;
    this.settingsAuditLogPanel = null;
    this.meshNetworkAnalyticsPanel = null;

    this.init();
  }

  init() {
    // 1. Initialize Lucide Icons
    createIcons({ icons });

    // 2. Initialize Telemetry Charts
    this.charts = new TelemetryCharts();

    // 3. Initialize 3D Visualizers
    this.init3DVisualizers();

    // 4. Initialize Modular Priority Components
    this.initPriorityComponents();

    // 5. Setup Navigation & Tabs
    this.setupNavigation();

    // 6. Setup Time & Layer Controls (4D Replay Speeds)
    this.setupTimeAndLayerControls();

    // 7. Setup Header Controls (RBAC, Offline Sync, GeoJSON)
    this.setupHeaderFeatures();

    // 8. Setup Modals, Reports & Fleets
    this.setupModals();
    this.setupReports();
    this.setupSensorFleetTable();
    this.setupHistoricalDataTab();
    this.setupSettings();

    // 9. Start Live Clock
    this.startClock();

    // 10. Subscribe to Real-Time Telemetry & Demo Flow
    meshSimulation.subscribe(this.handleTelemetryUpdate.bind(this));
    demoScenarioService.subscribe(this.handleDemoStepChange.bind(this));
    offlineSyncService.subscribe(this.handleSyncStatusUpdate.bind(this));
  }

  startClock() {
    const clockEl = document.getElementById('liveClockDisplay');
    const updateTime = () => {
      const now = new Date();
      if (clockEl) clockEl.textContent = now.toLocaleTimeString();
      const incTimeEl = document.getElementById('incLiveTime');
      if (incTimeEl) {
        incTimeEl.textContent = `${now.toISOString().split('T')[0]} ${now.toLocaleTimeString()} IST`;
      }
    };
    updateTime();
    setInterval(updateTime, 1000);
  }

  init3DVisualizers() {
    // Dashboard 3D Twin preview
    const dashEl = document.getElementById('dashThreeContainer');
    if (dashEl) {
      this.dashTwinViewer = new ThreeModelViewer('dashThreeContainer', this.handleNodeSelect.bind(this));
    }

    // Dedicated Mesh Topology Canvas
    const meshEl = document.getElementById('meshTopologyCanvas');
    if (meshEl) {
      this.meshViewer = new MeshTopologyViewer('meshTopologyCanvas', this.handleNodeSelect.bind(this));
      this.meshViewer.setNodes(meshSimulation.nodes);
    }

    // Physical Subsidence Prototype Model
    this.initSubsidenceModelViewer();

    // Dedicated GIS Coalfield Satellite Map
    this.initGisMapViewer();
  }

  initPriorityComponents() {
    // Demo Controller
    if (document.getElementById('demoControllerMount')) {
      this.demoController = new DemoController('demoControllerMount');
    }

    // Sensor Health Panels
    if (document.getElementById('dashSensorHealthMount')) {
      this.dashSensorHealthPanel = new SensorHealthPanel('dashSensorHealthMount');
    }
    if (document.getElementById('fleetSensorHealthMount')) {
      this.fleetSensorHealthPanel = new SensorHealthPanel('fleetSensorHealthMount');
    }

    // Data Quality Panels
    if (document.getElementById('dashDataQualityMount')) {
      this.dashDataQualityPanel = new DataQualityPanel('dashDataQualityMount');
    }
    if (document.getElementById('fusionDataQualityMount')) {
      this.fusionDataQualityPanel = new DataQualityPanel('fusionDataQualityMount');
    }

    // Risk Timelines
    const onSelectTimelineStep = (step) => demoScenarioService.setStep(step);
    if (document.getElementById('dashRiskTimelineMount')) {
      this.dashRiskTimeline = new RiskTimeline('dashRiskTimelineMount', onSelectTimelineStep);
    }
    if (document.getElementById('raRiskTimelineMount')) {
      this.raRiskTimeline = new RiskTimeline('raRiskTimelineMount', onSelectTimelineStep);
    }

    // Alert Workflow
    if (document.getElementById('alertsWorkflowMount')) {
      this.alertsWorkflow = new AlertWorkflow('alertsWorkflowMount');
    }

    // Physical Alert Beacons
    if (document.getElementById('dashPhysicalAlertMount')) {
      this.dashPhysicalAlertPanel = new PhysicalAlertPanel('dashPhysicalAlertMount');
    }
    if (document.getElementById('alertsPhysicalBeaconMount')) {
      this.alertsPhysicalAlertPanel = new PhysicalAlertPanel('alertsPhysicalBeaconMount');
    }

    // Confidence Panel
    if (document.getElementById('raConfidenceMount')) {
      this.raConfidencePanel = new ConfidencePanel('raConfidenceMount');
    }

    // Why Trust Alert Panels
    if (document.getElementById('dashWhyTrustMount')) {
      this.dashWhyTrustAlert = new WhyTrustAlert('dashWhyTrustMount');
    }
    if (document.getElementById('fusionWhyTrustMount')) {
      this.fusionWhyTrustAlert = new WhyTrustAlert('fusionWhyTrustMount');
    }
    if (document.getElementById('raWhyTrustMount')) {
      this.raWhyTrustAlert = new WhyTrustAlert('raWhyTrustMount');
    }

    // Gateway Health Panels (Dashboard & Mesh Network)
    if (document.getElementById('dashGatewayHealthMount')) {
      this.dashGatewayHealthPanel = new GatewayHealthPanel('dashGatewayHealthMount');
    }
    if (document.getElementById('meshGatewayHealthMount')) {
      this.meshGatewayHealthPanel = new GatewayHealthPanel('meshGatewayHealthMount');
    }

    // Spatial Evidence Panels (Dashboard, Fusion, Risk Analysis)
    if (document.getElementById('dashSpatialEvidenceMount')) {
      this.dashSpatialEvidencePanel = new SpatialEvidencePanel('dashSpatialEvidenceMount');
    }
    if (document.getElementById('fusionSpatialEvidenceMount')) {
      this.fusionSpatialEvidencePanel = new SpatialEvidencePanel('fusionSpatialEvidenceMount');
    }
    if (document.getElementById('raSpatialEvidenceMount')) {
      this.raSpatialEvidencePanel = new SpatialEvidencePanel('raSpatialEvidenceMount');
    }

    // Risk Breakdown Panels (Dashboard & Risk Analysis)
    if (document.getElementById('dashRiskBreakdownMount')) {
      this.dashRiskBreakdownPanel = new RiskBreakdownPanel('dashRiskBreakdownMount');
    }
    if (document.getElementById('raRiskBreakdownMount')) {
      this.raRiskBreakdownPanel = new RiskBreakdownPanel('raRiskBreakdownMount');
    }

    // AI Architecture Visualizer Panels (Dashboard & Fusion)
    if (document.getElementById('dashAiArchitectureMount')) {
      this.dashAiArchitecturePanel = new AIArchitecturePanel('dashAiArchitectureMount');
    }
    if (document.getElementById('fusionAiArchitectureMount')) {
      this.fusionAiArchitecturePanel = new AIArchitecturePanel('fusionAiArchitectureMount');
    }

    // Zone Comparison Panel (Dashboard)
    if (document.getElementById('dashZoneComparisonMount')) {
      this.dashZoneComparisonPanel = new ZoneComparisonPanel('dashZoneComparisonMount', (zoneId) => {
        const zoneNode = meshSimulation.nodes.find(n => n.zone === zoneId) || meshSimulation.nodes[0];
        this.handleNodeSelect(zoneNode.id);
        auditService.logAction({
          user: this.currentRole,
          action: 'ZONE_FOCUS_CHANGED',
          actionType: 'SENSOR_CONFIG',
          zone: `Panel ${zoneId}`,
          reason: `Operator focused 4D digital twin and telemetry on Panel ${zoneId}`,
          severity: 'INFO'
        });
      });
    }

    // Network Analytics & Self-Healing Panel (Mesh Network)
    if (document.getElementById('meshNetworkAnalyticsMount')) {
      this.meshNetworkAnalyticsPanel = new NetworkAnalyticsPanel('meshNetworkAnalyticsMount');
    }

    // Audit Log Panel (Settings)
    if (document.getElementById('settingsAuditLogMount')) {
      this.settingsAuditLogPanel = new AuditLogPanel('settingsAuditLogMount');
    }
  }

  setupHeaderFeatures() {
    // 1. Offline Mode / Cloud Sync Toggle
    const syncBadge = document.getElementById('headerSyncBadge');
    syncBadge?.addEventListener('click', () => {
      const isOnline = offlineSyncService.toggleNetworkStatus();
      if (!isOnline) {
        alert('Switched to OFFLINE MODE: Continuous local gateway telemetry caching (IndexedDB/SQLite) is active.');
      } else {
        alert('Switched to ONLINE CLOUD SYNC: Queued records synced with SHA-256 validation.');
      }
    });

    // 2. Role-Based Access Control (RBAC) Selector
    const rbacSelect = document.getElementById('rbacRoleSelect');
    rbacSelect?.addEventListener('change', (e) => {
      this.currentRole = e.target.value;
      const roleNames = {
        SAFETY_OFFICER: 'Geotechnical Safety Officer (Full Operational Control)',
        DGMS_INSPECTOR: 'Statutory Safety Auditor (Audit & Inspection Read-Only)',
        GEOTECH_ENG: 'Geotechnical Engineer (Model Tuning & Strata Analysis)',
        MINE_MANAGER: 'Geotechnical Operations Lead (Executive Command)'
      };
      auditService.logAction({
        user: this.currentRole,
        action: 'RBAC_ROLE_SWITCHED',
        actionType: 'USER_ROLE_CHANGE',
        zone: 'Central Command',
        reason: `User activated profile: ${roleNames[this.currentRole]}`,
        severity: 'INFO'
      });
      console.info(`[RBAC] Switched active role to: ${roleNames[this.currentRole]}`);
    });

    // 3. GeoJSON Risk Export Button
    const geoJsonBtns = [document.getElementById('headerGeoJsonBtn'), document.getElementById('btnExportRiskGeoJson')];
    geoJsonBtns.forEach(btn => {
      btn?.addEventListener('click', () => this.exportGisGeoJson());
    });
  }

  exportGisGeoJson() {
    const telemetry = meshSimulation.getGlobalTelemetry();
    const geoJson = {
      type: "FeatureCollection",
      metadata: {
        site: "Geological Survey Sector A17",
        generatedAt: new Date().toISOString(),
        threatLevel: telemetry.risk.level,
        riskScore: telemetry.risk.score,
        safetyStandard: "Geotechnical Ground Stability Code 2026"
      },
      features: [
        {
          type: "Feature",
          properties: {
            name: "Panel A17 Subsidence Danger Zone (45° Angle of Draw)",
            riskLevel: telemetry.risk.level,
            peakDisplacementMm: telemetry.peakNode.sensors.displacement,
            evacuationStatus: telemetry.risk.score >= 0.75 ? "MANDATORY_EVACUATION" : "ADVISORY_MONITORING"
          },
          geometry: {
            type: "Polygon",
            coordinates: [[
              [86.9500, 23.6820],
              [86.9560, 23.6820],
              [86.9565, 23.6870],
              [86.9505, 23.6870],
              [86.9500, 23.6820]
            ]]
          }
        },
        ...meshSimulation.nodes.map(n => ({
          type: "Feature",
          properties: {
            id: n.id,
            zone: n.zone,
            status: n.status,
            battery: n.battery,
            displacementMm: n.sensors.displacement,
            tiltDeg: n.sensors.tilt,
            vibrationMmS: n.sensors.vibration,
            crackMm: n.sensors.crack,
            strainMicroStrain: n.sensors.strain,
            maintenanceStatus: n.maintenanceStatus,
            technician: n.technicianAssigned
          },
          geometry: {
            type: "Point",
            coordinates: [n.lng, n.lat]
          }
        }))
      ]
    };

    const blob = new Blob([JSON.stringify(geoJson, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TerraGuardX_GIS_Hazard_${Date.now()}.geojson`;
    a.click();
    URL.revokeObjectURL(url);
  }

  handleSyncStatusUpdate(syncState) {
    const syncDot = document.getElementById('headerSyncDot');
    const syncText = document.getElementById('headerSyncText');
    const syncBadge = document.getElementById('headerSyncBadge');

    if (syncDot && syncText) {
      if (syncState.isOnline) {
        syncDot.className = 'pulsing-dot green';
        syncText.innerHTML = `Cloud: <strong>${syncState.isSyncing ? `SYNCING (${syncState.syncProgressPercent}%)` : 'ONLINE'}</strong>`;
        if (syncBadge) syncBadge.className = 'status-pill status-online btn-sync-toggle';
      } else {
        syncDot.className = 'pulsing-dot yellow';
        syncText.innerHTML = `Cloud: <strong>OFFLINE (${syncState.pendingSyncRecords} QUEUED)</strong>`;
        if (syncBadge) syncBadge.className = 'status-pill btn-sync-toggle';
      }
    }
  }

  handleDemoStepChange(curStep, isPlaying) {
    if (this.demoController) {
      this.demoController.render(curStep, isPlaying);
    }
  }

  setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const tabPanes = document.querySelectorAll('.tab-pane');

    const switchTab = (targetTab) => {
      if (!targetTab) return;
      this.activeTab = targetTab;
      
      navItems.forEach(item => item.classList.remove('active'));
      tabPanes.forEach(pane => pane.classList.remove('active'));

      const activeBtn = document.querySelector(`.nav-item[data-tab="${targetTab}"]`);
      if (activeBtn) activeBtn.classList.add('active');

      const activePane = document.getElementById(`tab-${targetTab}`);
      if (activePane) activePane.classList.add('active');

      // Refresh 3D / Canvas viewports on tab change
      if (targetTab === 'subsidence-model') {
        if (!this.subsidenceModelViewer) {
          this.initSubsidenceModelViewer();
        } else {
          setTimeout(() => this.subsidenceModelViewer?.resizeCanvas(), 50);
        }
        this.updateSubsidenceModelData();
      }

      if (targetTab === 'gis-map') {
        if (!this.gisMapViewer) {
          this.initGisMapViewer();
        } else {
          setTimeout(() => {
            this.gisMapViewer?.resize();
            this.gisMapViewer?.updateDynamicLayers(meshSimulation.nodes, meshSimulation.getGlobalTelemetry());
          }, 60);
        }
      }

      if (targetTab === 'digital-twin') {
        if (!this.fullTwinViewer) {
          requestAnimationFrame(() => {
            this.fullTwinViewer = new ThreeModelViewer('fullTwinContainer', this.handleNodeSelect.bind(this));
            this.fullTwinViewer.updateState(meshSimulation.getGlobalTelemetry());
          });
        } else {
          setTimeout(() => this.fullTwinViewer?.resize(), 50);
        }
      }

      if (targetTab === 'dashboard') {
        setTimeout(() => this.dashTwinViewer?.resize(), 50);
        this.renderDashboardCharts();
      }

      if (targetTab === 'mesh-network') {
        if (this.meshViewer) setTimeout(() => this.meshViewer.resizeCanvas(), 50);
        this.meshNetworkAnalyticsPanel?.render();
        this.meshGatewayHealthPanel?.render();
      }

      if (targetTab === 'historical-data') {
        this.updateHistoricalChart();
      }

      if (targetTab === 'prediction') {
        this.updatePredictionChart();
      }

      if (targetTab === 'alerts' && this.alertsWorkflow) {
        this.alertsWorkflow.render();
        this.alertsPhysicalAlertPanel?.render();
      }

      if (targetTab === 'sensor-management' && this.fleetSensorHealthPanel) {
        this.fleetSensorHealthPanel.render(meshSimulation.getGlobalTelemetry());
        this.setupSensorFleetTable();
      }

      if (targetTab === 'settings') {
        this.settingsAuditLogPanel?.render();
      }

      createIcons({ icons });
    };

    navItems.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = e.currentTarget.dataset.tab;
        switchTab(target);
      });
    });

    document.getElementById('btnDashOpenFullTwin')?.addEventListener('click', () => {
      switchTab('digital-twin');
    });
  }

  setupTimeAndLayerControls() {
    // 4D Time Slider (Dashboard)
    const dashTimeSlider = document.getElementById('dashTimeSlider');
    const dashTimeLabel = document.getElementById('dashTimeSliderLabel');
    dashTimeSlider?.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      this.updateTimeLabel(dashTimeLabel, val);
      if (this.dashTwinViewer) this.dashTwinViewer.updateState(meshSimulation.getGlobalTelemetry(), val);
    });

    // 4D Time Slider (Dedicated Full Page)
    const fullTimeSlider = document.getElementById('fullTwinTimeSlider');
    const fullTimeLabel = document.getElementById('fullTwinTimeLabel');
    fullTimeSlider?.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      this.updateTimeLabel(fullTimeLabel, val);
      if (this.fullTwinViewer) this.fullTwinViewer.updateState(meshSimulation.getGlobalTelemetry(), val);
    });

    // Replay Speed Multipliers (1X, 2X, 5X)
    const speedBtns = document.querySelectorAll('.btn-replay-speed');
    speedBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        speedBtns.forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        const speed = parseInt(e.currentTarget.dataset.speed, 10) || 1;
        demoScenarioService.setSpeed(speed);
      });
    });

    // Auto Replay Button on 4D Twin
    document.getElementById('btnTwinAutoReplay')?.addEventListener('click', () => {
      demoScenarioService.togglePlay();
    });

    // Layer Checkboxes
    const layerMap = [
      { id: 'layerSensorNodes', key: 'sensorNodes' },
      { id: 'layerMeshConnections', key: 'meshConnections' },
      { id: 'layerUndergroundPanels', key: 'undergroundPanels' },
      { id: 'layerGroundDeformation', key: 'groundDeformation' },
      { id: 'layerMovementVectors', key: 'movementVectors' },
      { id: 'layerRiskZones', key: 'riskZones' },
      { id: 'layerCrackLocations', key: 'crackLocations' },
      { id: 'layerPredictionLayer', key: 'predictionLayer' }
    ];

    layerMap.forEach(item => {
      const chk = document.getElementById(item.id);
      chk?.addEventListener('change', (e) => {
        if (this.fullTwinViewer) this.fullTwinViewer.setLayerVisibility(item.key, e.target.checked);
        if (this.dashTwinViewer) this.dashTwinViewer.setLayerVisibility(item.key, e.target.checked);
      });
    });

    // Camera Navigation & Preset Buttons
    document.getElementById('btnDashResetView')?.addEventListener('click', () => this.dashTwinViewer?.resetView());
    document.getElementById('btnDashAutoRotate')?.addEventListener('click', () => this.dashTwinViewer?.toggleAutoRotate());
    document.getElementById('btnTwinReset')?.addEventListener('click', () => this.fullTwinViewer?.resetView());
    document.getElementById('btnTwinZoomIn')?.addEventListener('click', () => this.fullTwinViewer?.zoomIn());
    document.getElementById('btnTwinZoomOut')?.addEventListener('click', () => this.fullTwinViewer?.zoomOut());
    document.getElementById('btnTwinAutoOrbit')?.addEventListener('click', () => this.fullTwinViewer?.toggleAutoRotate());

    document.getElementById('btnTwinViewIso')?.addEventListener('click', () => this.fullTwinViewer?.setCameraPreset('isometric'));
    document.getElementById('btnTwinViewUnderground')?.addEventListener('click', () => this.fullTwinViewer?.setCameraPreset('underground'));
    document.getElementById('btnTwinViewSurface')?.addEventListener('click', () => this.fullTwinViewer?.setCameraPreset('surface'));
    document.getElementById('btnTwinViewSection')?.addEventListener('click', () => this.fullTwinViewer?.setCameraPreset('cross-section'));

    const btnTwinXRay = document.getElementById('btnTwinXRay');
    btnTwinXRay?.addEventListener('click', () => {
      if (this.fullTwinViewer) {
        const isXRay = this.fullTwinViewer.toggleXRay();
        btnTwinXRay.innerHTML = `<i data-lucide="scan" class="icon-xxs"></i> X-Ray Strata: ${isXRay ? 'ON (Active)' : 'OFF'}`;
        btnTwinXRay.classList.toggle('active', isXRay);
        createIcons({ icons });
      }
    });
  }

  updateTimeLabel(labelEl, val) {
    if (!labelEl) return;
    if (val < 40) {
      labelEl.textContent = `HISTORICAL ARCHIVE (-${Math.round((50 - val) * 0.48)}h)`;
      labelEl.style.color = '#64748b';
    } else if (val > 60) {
      labelEl.textContent = `AI PREDICTED FORECAST (+${Math.round((val - 50) * 0.48)}h)`;
      labelEl.style.color = '#a855f7';
    } else {
      labelEl.textContent = `CURRENT CONDITION (NOW)`;
      labelEl.style.color = 'var(--accent-cyan)';
    }
  }

  handleTelemetryUpdate(telemetry) {
    const keyNode = telemetry.peakNode;
    
    // Process through Data Quality Pipeline
    dataQualityService.processRawPacket(keyNode);

    // Compute Fused Spatial Risk
    const fusedRisk = riskEngineService.evaluateRisk(keyNode, meshSimulation.nodes, meshSimulation.currentStep);
    telemetry.risk = fusedRisk;

    // Dispatch to Notification Router & Physical Alert Beacons
    notificationService.dispatchPhysicalAlert(keyNode.zone, fusedRisk.level, fusedRisk.color, fusedRisk.score >= 0.75);

    // Record local sync metric
    offlineSyncService.recordLocalTelemetry(telemetry);

    // 1. Update Header Status
    const globalRiskText = document.getElementById('globalRiskText');
    const headerRiskDot = document.getElementById('headerRiskDot');
    if (globalRiskText) {
      const icon = fusedRisk.color === 'GREEN' ? '🟢' : (fusedRisk.color === 'YELLOW' ? '🟡' : (fusedRisk.color === 'ORANGE' ? '🟠' : '🔴'));
      globalRiskText.innerHTML = `${icon} ${fusedRisk.level} (${Math.round(fusedRisk.score * 100)}%)`;
    }
    if (headerRiskDot) headerRiskDot.className = `pulsing-dot ${fusedRisk.color.toLowerCase()}`;

    // 2. Update Dashboard Metrics
    const dashRiskBadge = document.getElementById('dashRiskBadge');
    const dashRiskScore = document.getElementById('dashRiskScore');
    const dashRiskTrend = document.getElementById('dashRiskTrend');
    const dashConfidence = document.getElementById('dashConfidence');

    if (dashRiskBadge) {
      dashRiskBadge.className = `badge-status-level badge-${fusedRisk.color.toLowerCase()}`;
      dashRiskBadge.textContent = `${fusedRisk.level}`;
    }
    if (dashRiskScore) dashRiskScore.textContent = `${Math.round(fusedRisk.score * 100)}%`;
    if (dashRiskTrend) {
      dashRiskTrend.textContent = fusedRisk.trend;
      dashRiskTrend.className = fusedRisk.color === 'GREEN' ? 'text-success' : 'text-red';
    }
    if (dashConfidence) dashConfidence.textContent = `${Math.round(fusedRisk.confidence * 100)}%`;

    // Active Risk Zones
    const zn = document.getElementById('dashZoneNormal');
    const zc = document.getElementById('dashZoneCaution');
    const zh = document.getElementById('dashZoneHigh');
    const zcr = document.getElementById('dashZoneCritical');
    if (zn) zn.textContent = telemetry.zones.normal;
    if (zc) zc.textContent = telemetry.zones.caution;
    if (zh) zh.textContent = telemetry.zones.highRisk;
    if (zcr) zcr.textContent = telemetry.zones.critical;

    // 3. Update Dashboard Risk Gauge & Bottom Cards
    const gaugeVal = document.getElementById('dashRiskGaugeVal');
    const gaugeCircle = document.getElementById('dashRiskGaugeCircle');
    const riskClassText = document.getElementById('dashRiskClassText');
    const confText = document.getElementById('dashConfidenceText');
    const trendText = document.getElementById('dashTrendText');
    const forecastVal = document.getElementById('dashForecastVal');

    if (gaugeVal) gaugeVal.textContent = `${Math.round(fusedRisk.score * 100)}%`;
    if (gaugeCircle) {
      gaugeCircle.style.borderColor = fusedRisk.hexColor;
      gaugeCircle.style.background = `${fusedRisk.hexColor}15`;
    }
    if (riskClassText) {
      riskClassText.textContent = `${fusedRisk.level}`;
      riskClassText.style.color = fusedRisk.hexColor;
    }
    if (confText) confText.textContent = `${Math.round(fusedRisk.confidence * 100)}%`;
    if (trendText) {
      trendText.textContent = fusedRisk.trend;
      trendText.style.color = fusedRisk.hexColor;
    }
    if (forecastVal) forecastVal.textContent = `${telemetry.prediction.plus24h} mm (${fusedRisk.score >= 0.75 ? 'Critical Trough' : 'Safe Baseline'})`;

    // 4. Update Explainable AI Card Text
    const exp = aiService.generateExplanation(telemetry);
    const aiInsightText = document.getElementById('dashAiInsightText');
    const aiActionText = document.getElementById('dashAiActionText');
    const aiConfPill = document.getElementById('dashAiConfidencePill');
    if (aiInsightText) aiInsightText.textContent = exp.insightSummary;
    if (aiActionText) aiActionText.textContent = exp.recommendedAction;
    if (aiConfPill) aiConfPill.textContent = exp.confidence;

    // 5. Update Multi-Sensor Fusion & Risk Analysis Pages
    this.updateFusionPage(telemetry);
    this.updateRiskAnalysisPage(telemetry, exp);

    // 6. Update 4D Digital Twin Viewers & Subsidence Model
    if (this.dashTwinViewer) this.dashTwinViewer.updateState(telemetry);
    if (this.fullTwinViewer) this.fullTwinViewer.updateState(telemetry);
    this.updateSubsidenceModelData();
    if (this.gisMapViewer) this.gisMapViewer.updateDynamicLayers(meshSimulation.nodes, telemetry);

    // 7. Update Active Priority & Missing Feature Panels
    this.renderPriorityPanels(telemetry);

    // 8. Update Alerts Feed & Drawer
    this.renderAlertsList(telemetry);
    this.updateNodeDrawer(keyNode);
  }

  renderPriorityPanels(telemetry) {
    const curStep = meshSimulation.currentStep;

    // Demo Controller
    if (this.demoController) {
      this.demoController.render(demoScenarioService.getCurrentStep(), demoScenarioService.isPlaying);
    }

    // Sensor Health Panels
    this.dashSensorHealthPanel?.render(telemetry, telemetry.peakNode);
    this.fleetSensorHealthPanel?.render(telemetry, telemetry.peakNode);

    // Data Quality Panels
    this.dashDataQualityPanel?.render();
    this.fusionDataQualityPanel?.render();

    // Risk Timelines
    this.dashRiskTimeline?.render(curStep);
    this.raRiskTimeline?.render(curStep);

    // Physical Alert Beacon
    this.dashPhysicalAlertPanel?.render();
    this.alertsPhysicalAlertPanel?.render();

    // Confidence & Trust Panels
    this.raConfidencePanel?.render(telemetry);
    this.dashWhyTrustAlert?.render(telemetry);
    this.fusionWhyTrustAlert?.render(telemetry);
    this.raWhyTrustAlert?.render(telemetry);

    // Missing Feature Panels
    this.dashGatewayHealthPanel?.render();
    this.meshGatewayHealthPanel?.render();

    this.dashSpatialEvidencePanel?.render(telemetry);
    this.fusionSpatialEvidencePanel?.render(telemetry);
    this.raSpatialEvidencePanel?.render(telemetry);

    this.dashRiskBreakdownPanel?.render(telemetry);
    this.raRiskBreakdownPanel?.render(telemetry);

    this.dashAiArchitecturePanel?.render();
    this.fusionAiArchitecturePanel?.render();

    this.dashZoneComparisonPanel?.render(telemetry.peakNode?.zone || 'A17');
    this.meshNetworkAnalyticsPanel?.render();
  }

  updateFusionPage(telemetry) {
    const keyNode = telemetry.peakNode;
    const s = keyNode.sensors;
    const b = keyNode.baseline;

    const tVal = document.getElementById('fusionTiltVal');
    const tDev = document.getElementById('fusionTiltDev');
    const dVal = document.getElementById('fusionDispVal');
    const dDev = document.getElementById('fusionDispDev');
    const stVal = document.getElementById('fusionStrainVal');
    const stDev = document.getElementById('fusionStrainDev');
    const vVal = document.getElementById('fusionVibVal');
    const vDev = document.getElementById('fusionVibDev');
    const cVal = document.getElementById('fusionCrackVal');
    const cDev = document.getElementById('fusionCrackDev');

    if (tVal) tVal.textContent = `${s.tilt}°`;
    if (tDev) tDev.textContent = `${s.tilt > b.tilt ? '+' : ''}${Math.round(((s.tilt - b.tilt) / b.tilt) * 100)}%`;
    if (dVal) dVal.textContent = `${s.displacement} mm`;
    if (dDev) dDev.textContent = `${s.displacement > b.displacement ? '+' : ''}${Math.round(((s.displacement - b.displacement) / b.displacement) * 100)}%`;
    if (stVal) stVal.textContent = `${s.strain} µε`;
    if (stDev) stDev.textContent = `${s.strain > b.strain ? '+' : ''}${Math.round(((s.strain - b.strain) / b.strain) * 100)}%`;
    if (vVal) vVal.textContent = `${s.vibration} mm/s`;
    if (vDev) vDev.textContent = `${s.vibration > b.vibration ? '+' : ''}${Math.round(((s.vibration - b.vibration) / b.vibration) * 100)}%`;
    if (cVal) cVal.textContent = `${s.crack} mm`;
    if (cDev) cDev.textContent = `${s.crack > b.crack ? '+' : ''}${Math.round(((s.crack - b.crack) / b.crack) * 100)}%`;

    const agreeHeading = document.getElementById('fusionAgreeHeading');
    const agreeBannerText = document.getElementById('dashAgreementText');
    if (agreeHeading) agreeHeading.textContent = `${telemetry.sensorEvidence.agreementRatio} sensor categories show abnormal behaviour`;
    if (agreeBannerText) agreeBannerText.textContent = `${telemetry.sensorEvidence.agreementRatio} sensor categories show abnormal behaviour`;

    const outScore = document.getElementById('fusionOutcomeScore');
    const outClass = document.getElementById('fusionOutcomeClass');
    if (outScore) outScore.textContent = `${Math.round(telemetry.risk.score * 100)}%`;
    if (outClass) {
      outClass.textContent = `${telemetry.risk.level}`;
      outClass.style.color = telemetry.risk.hexColor;
    }
  }

  updateRiskAnalysisPage(telemetry, exp) {
    const rLevel = document.getElementById('raRiskLevel');
    const rScore = document.getElementById('raRiskScore');
    const rConf = document.getElementById('raConfidence');
    const rTrend = document.getElementById('raTrend');
    const rInterp = document.getElementById('raInterpretationText');
    const rAction = document.getElementById('raActionText');

    if (rLevel) {
      rLevel.textContent = `${telemetry.risk.level}`;
      rLevel.style.color = telemetry.risk.hexColor;
    }
    if (rScore) {
      rScore.textContent = `${Math.round(telemetry.risk.score * 100)}%`;
      rScore.style.color = telemetry.risk.hexColor;
    }
    if (rConf) rConf.textContent = `${Math.round(telemetry.risk.confidence * 100)}%`;
    if (rTrend) {
      rTrend.textContent = telemetry.risk.trend;
      rTrend.style.color = telemetry.risk.hexColor;
    }
    if (rInterp) rInterp.textContent = exp.whatHappened + ' ' + exp.whereItHappened;
    if (rAction) rAction.textContent = exp.recommendedAction;
  }

  renderDashboardCharts() {
    this.charts.initFusionEvidenceChart('dashFusionChart');
  }

  renderAlertsList(telemetry) {
    const feed = document.getElementById('dashAlertsFeed');
    if (!feed) return;

    const risk = telemetry.risk;
    const isRed = risk.score >= 0.75;
    const isOrange = risk.score >= 0.50 && risk.score < 0.75;
    const isYellow = risk.score >= 0.25 && risk.score < 0.50;

    let itemsHtml = `
      <div class="alert-feed-item ${isRed ? 'red' : (isOrange ? 'orange' : (isYellow ? 'yellow' : 'green'))}">
        <div>
          <span class="alert-zone-title">Longwall Panel A17</span>
          <div style="font-size:0.7rem; color:#94a3b8;">${risk.level} (${Math.round(risk.score * 100)}%) &bull; Displacement: ${telemetry.peakNode?.sensors?.displacement} mm</div>
        </div>
        <span class="alert-time-stamp">${new Date().toLocaleTimeString()}</span>
      </div>
      <div class="alert-feed-item yellow">
        <div>
          <span class="alert-zone-title">Goaf Barrier Panel A12</span>
          <div style="font-size:0.7rem; color:#94a3b8;">CAUTION (38%) &bull; Micro-seismic check</div>
        </div>
        <span class="alert-time-stamp">20:31</span>
      </div>
    `;

    feed.innerHTML = itemsHtml;
  }

  handleNodeSelect(nodeId) {
    this.selectedNodeId = nodeId;
    const node = meshSimulation.nodes.find(n => n.id === nodeId) || meshSimulation.nodes[0];
    this.updateNodeDrawer(node);

    // Diagnostics modal
    const diagTitle = document.getElementById('diagNodeTitle');
    const diagBody = document.getElementById('diagNodeBody');
    if (diagTitle) diagTitle.textContent = `Node ${node.id} (${node.zone}) Full Diagnostics & Maintenance`;
    if (diagBody) {
      const health = sensorHealthService.calculateSensorHealthScore(node);
      diagBody.innerHTML = `
        <div style="display:flex; flex-direction:column; gap:10px;">
          <div style="background:rgba(15,23,42,0.8); padding:12px; border-radius:8px;">
            <div style="color:var(--accent-cyan); font-weight:700;">HARDWARE STATUS: ${node.status}</div>
            <div>Battery: <strong>${node.battery}% (LiPo 3.9V)</strong> | RSSI: <strong>${node.rssi} dBm</strong> | Hops: <strong>${node.hops}</strong></div>
            <div>Coordinates: Lat ${node.lat}, Lng ${node.lng}</div>
            <div style="margin-top:6px; color:#34d399;">AI Health Score: <strong>${health.overallHealthScore}% (${health.faultDiagnosis})</strong></div>
          </div>
          <div style="background:rgba(15,23,42,0.8); padding:12px; border-radius:8px;">
            <div style="color:#ffffff; font-weight:700; margin-bottom:6px;">LIVE SENSOR CHANNELS:</div>
            <div>&bull; Displacement: <strong>${node.sensors.displacement} mm</strong> (Baseline: ${node.baseline.displacement} mm)</div>
            <div>&bull; Tilt Angle: <strong>${node.sensors.tilt}°</strong> (Baseline: ${node.baseline.tilt}°)</div>
            <div>&bull; Micro-Vibration: <strong>${node.sensors.vibration} mm/s</strong> (Baseline: ${node.baseline.vibration} mm/s)</div>
            <div>&bull; Crack Gauge: <strong>${node.sensors.crack} mm</strong> (Baseline: ${node.baseline.crack} mm)</div>
            <div>&bull; Tensile Strain: <strong>${node.sensors.strain} µε</strong> (Baseline: ${node.baseline.strain} µε)</div>
          </div>
          <div style="background:rgba(15,23,42,0.8); padding:12px; border-radius:8px;">
            <div style="color:var(--accent-yellow); font-weight:700; margin-bottom:6px;">MAINTENANCE SCHEDULE:</div>
            <div>&bull; Status: <strong>${node.maintenanceStatus}</strong></div>
            <div>&bull; Last Calibration: <strong>${node.lastMaintenanceDate}</strong> | Next: <strong>${node.nextMaintenanceDate}</strong></div>
            <div>&bull; Technician Assigned: <strong>${node.technicianAssigned}</strong></div>
            <div>&bull; Notes: <em>${node.maintenanceNotes}</em></div>
          </div>
        </div>
      `;
    }
  }

  updateNodeDrawer(node) {
    if (!node) return;
    const drawerId = document.getElementById('drawerNodeId');
    const drawerZone = document.getElementById('drawerNodeZone');
    const drawerStatus = document.getElementById('drawerNodeStatus');
    const drawerBatt = document.getElementById('drawerNodeBattery');
    const drawerRssi = document.getElementById('drawerNodeRssi');
    const drawerTilt = document.getElementById('drawerSensorTilt');
    const drawerDisp = document.getElementById('drawerSensorDisp');
    const drawerVib = document.getElementById('drawerSensorVib');
    const drawerCrack = document.getElementById('drawerSensorCrack');
    const drawerStrain = document.getElementById('drawerSensorStrain');

    if (drawerId) drawerId.textContent = node.id;
    if (drawerZone) drawerZone.textContent = `Zone: Longwall Panel ${node.zone}`;
    if (drawerStatus) drawerStatus.innerHTML = `${node.status === 'ONLINE' ? '🟢 ONLINE' : (node.status === 'WARNING' ? '🟡 WARNING' : '🔴 OFFLINE')}`;
    if (drawerBatt) drawerBatt.textContent = `${node.battery}% (LiPo 3.9V)`;
    if (drawerRssi) drawerRssi.textContent = `${node.rssi} dBm`;

    if (drawerTilt) drawerTilt.textContent = `${node.sensors.tilt}°`;
    if (drawerDisp) drawerDisp.textContent = `${node.sensors.displacement} mm`;
    if (drawerVib) drawerVib.textContent = `${node.sensors.vibration} mm/s`;
    if (drawerCrack) drawerCrack.textContent = `${node.sensors.crack} mm`;
    if (drawerStrain) drawerStrain.textContent = `${node.sensors.strain} µε`;
  }

  setupSensorFleetTable() {
    const tableBody = document.getElementById('sensorFleetTableBody');
    const searchInput = document.getElementById('sensorSearchInput');
    const zoneFilter = document.getElementById('sensorFilterZone');
    const statusFilter = document.getElementById('sensorFilterStatus');
    const maintFilter = document.getElementById('sensorFilterMaint');

    const renderTable = () => {
      if (!tableBody) return;
      const query = (searchInput?.value || '').toLowerCase();
      const selZone = zoneFilter?.value || 'ALL';
      const selStatus = statusFilter?.value || 'ALL';
      const selMaint = maintFilter?.value || 'ALL';

      const filtered = meshSimulation.nodes.filter(n => {
        const matchesQuery = n.id.toLowerCase().includes(query) || 
                             n.zone.toLowerCase().includes(query) ||
                             (n.technicianAssigned && n.technicianAssigned.toLowerCase().includes(query));
        const matchesZone = selZone === 'ALL' || n.zone === selZone;
        const matchesStatus = selStatus === 'ALL' || n.status === selStatus;
        const matchesMaint = selMaint === 'ALL' || n.maintenanceStatus === selMaint;
        return matchesQuery && matchesZone && matchesStatus && matchesMaint;
      });

      // Update Maintenance Summary Cards Counters
      const totalCount = meshSimulation.nodes.length;
      const healthyCount = meshSimulation.nodes.filter(n => n.maintenanceStatus === 'HEALTHY').length;
      const dueCount = meshSimulation.nodes.filter(n => n.maintenanceStatus === 'MAINTENANCE DUE').length;
      const overdueCount = meshSimulation.nodes.filter(n => n.maintenanceStatus === 'MAINTENANCE OVERDUE').length;
      const replaceCount = meshSimulation.nodes.filter(n => n.maintenanceStatus === 'REPLACEMENT REQUIRED').length;

      const tEl = document.getElementById('maintTotalVal');
      const hEl = document.getElementById('maintHealthyVal');
      const dEl = document.getElementById('maintDueVal');
      const oEl = document.getElementById('maintOverdueVal');
      const rEl = document.getElementById('maintReplaceVal');

      if (tEl) tEl.textContent = totalCount;
      if (hEl) hEl.textContent = healthyCount;
      if (dEl) dEl.textContent = dueCount;
      if (oEl) oEl.textContent = overdueCount;
      if (rEl) rEl.textContent = replaceCount;

      tableBody.innerHTML = filtered.slice(0, 30).map(n => {
        let maintBadgeClass = 'badge-green';
        if (n.maintenanceStatus === 'MAINTENANCE DUE') maintBadgeClass = 'badge-yellow';
        else if (n.maintenanceStatus === 'MAINTENANCE OVERDUE') maintBadgeClass = 'badge-orange';
        else if (n.maintenanceStatus === 'REPLACEMENT REQUIRED') maintBadgeClass = 'badge-red';
        else if (n.maintenanceStatus === 'UNDER MAINTENANCE') maintBadgeClass = 'badge-blue';

        return `
          <tr>
            <td><strong class="text-accent">${n.id}</strong></td>
            <td>Panel ${n.zone}</td>
            <td class="font-mono ${n.sensors.displacement > 4.2 ? 'text-red' : 'text-success'}">${n.sensors.displacement} mm</td>
            <td class="font-mono">${n.sensors.tilt}°</td>
            <td><span class="${n.battery < 20 ? 'text-red' : 'text-accent'}">${n.battery}%</span></td>
            <td>${n.lastMaintenanceDate || '2026-08-15'}</td>
            <td>${n.nextMaintenanceDate || '2026-11-15'}</td>
            <td><span class="badge-status-level ${maintBadgeClass}">${n.maintenanceStatus || 'HEALTHY'}</span></td>
            <td style="font-size:0.75rem; color:#94a3b8;">${n.technicianAssigned || 'Er. B. Mukherjee'}</td>
            <td><button class="btn btn-xs btn-outline btn-inspect-node" data-id="${n.id}">Inspect</button></td>
          </tr>
        `;
      }).join('');

      tableBody.querySelectorAll('.btn-inspect-node').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const id = e.currentTarget.dataset.id;
          this.handleNodeSelect(id);
          document.getElementById('nodeModalBackdrop')?.classList.add('active');
        });
      });
    };

    renderTable();
    searchInput?.addEventListener('input', renderTable);
    zoneFilter?.addEventListener('change', renderTable);
    statusFilter?.addEventListener('change', renderTable);
    maintFilter?.addEventListener('change', renderTable);
  }

  setupHistoricalDataTab() {
    const sensorSelect = document.getElementById('historySensorSelect');
    const timeframeBtns = document.querySelectorAll('.btn-timeframe');

    let currentSensor = 'displacement';
    let currentTimeframe = '24h';

    this.updateHistoricalChart = () => {
      this.charts.initHistoricalChart('historicalChartCanvas', currentSensor, currentTimeframe);
    };

    sensorSelect?.addEventListener('change', (e) => {
      currentSensor = e.target.value;
      this.updateHistoricalChart();
    });

    timeframeBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        timeframeBtns.forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        currentTimeframe = e.currentTarget.dataset.time;
        this.updateHistoricalChart();
      });
    });
  }

  updatePredictionChart() {
    this.charts.initPredictionChart('predictionChartCanvas', meshSimulation.nodes[0]?.sensors?.displacement || 12.4);
  }

  initSubsidenceModelViewer() {
    const canvasEl = document.getElementById('subsidenceModelCanvas');
    if (!canvasEl) return;

    if (!this.subsidenceModelViewer) {
      this.subsidenceModelViewer = new SubsidenceCanvasViewer(
        'subsidenceModelCanvas',
        this.handleNodeSelect.bind(this),
        (threat) => {
          this.handleModelThreatChange(threat);
        }
      );
      this.subsidenceModelViewer.updateData(1.4, meshSimulation.nodes);
      this.setupSubsidenceModelControls();
    }
  }

  handleModelThreatChange(threat) {
    const sigText = document.getElementById('modelSignalStatusText');
    const trafText = document.getElementById('modelTrafficStatusText');
    const buzText = document.getElementById('modelBuzzerStatusText');
    const dgmsText = document.getElementById('modelDgmsActionText');

    if (sigText) {
      sigText.textContent = `${threat.text}`;
      sigText.style.color = threat.color;
    }

    if (trafText) {
      if (threat.tier === 1) {
        trafText.textContent = '🟢 RUNNING NORMALLY';
        trafText.className = 'text-success';
      } else {
        trafText.textContent = '🛑 HALTED (SAFETY INTERLOCK)';
        trafText.className = 'text-red';
      }
    }

    if (buzText) {
      if (threat.tier === 1) {
        buzText.textContent = 'STANDBY (MUTED)';
        buzText.className = 'text-accent';
      } else if (threat.tier === 2) {
        buzText.textContent = '🟡 CAUTION BEEP ACTIVE (650Hz)';
        buzText.className = 'text-yellow';
      } else if (threat.tier === 3) {
        buzText.textContent = '🟠 DUAL-TONE ALARM ACTIVE';
        buzText.className = 'text-orange';
      } else {
        buzText.textContent = '🔴 URGENT EVACUATION SIREN (110dB)';
        buzText.className = 'text-red';
      }
    }

    if (dgmsText) {
      if (threat.tier === 1) dgmsText.textContent = 'Normal Continuous 24/7 Monitoring';
      else if (threat.tier === 2) dgmsText.textContent = 'Advisory Alert Issued • Surface Traffic Speed Restricted';
      else if (threat.tier === 3) dgmsText.textContent = 'Danger Directive • All Surface Haulage & Access Halted';
      else dgmsText.textContent = 'MANDATORY EVACUATION PROTOCOL • Survey Sector Cordoned';
    }

    // Update button active state
    const sigBtns = {
      1: 'btnModelSigGreen',
      2: 'btnModelSigYellow',
      3: 'btnModelSigOrange',
      4: 'btnModelSigRed'
    };
    Object.entries(sigBtns).forEach(([tier, btnId]) => {
      const btn = document.getElementById(btnId);
      if (btn) {
        if (parseInt(tier, 10) === threat.tier) btn.classList.add('active');
        else btn.classList.remove('active');
      }
    });

    // Real-Time Floating Notification Toast on hazard activation
    if (threat.tier >= 2) {
      this.showToast(
        `${threat.text}: Automatic Traffic Interlock Activated`,
        `Surface subsidence elevated (${threat.desc}). Railway & Roadway signals locked. Moving vehicles halted. Acoustic buzzer active.`,
        threat.level.toLowerCase()
      );
    }
  }

  setupSubsidenceModelControls() {
    // 1. 4-Colour Hazard Signal Buttons
    const sigMap = [
      { id: 'btnModelSigGreen', tier: 1 },
      { id: 'btnModelSigYellow', tier: 2 },
      { id: 'btnModelSigOrange', tier: 3 },
      { id: 'btnModelSigRed', tier: 4 }
    ];

    sigMap.forEach(item => {
      document.getElementById(item.id)?.addEventListener('click', () => {
        if (this.subsidenceModelViewer) {
          this.subsidenceModelViewer.setThreatTier(item.tier);
          const slider = document.getElementById('modelSinkageSlider');
          const sliderVal = document.getElementById('modelSinkageSliderVal');
          const depthVal = Math.round(this.subsidenceModelViewer.sinkageDepth * 10);
          if (slider) slider.value = depthVal;
          if (sliderVal) sliderVal.textContent = `${depthVal}.0 mm`;
        }
      });
    });

    // 2. Sinkage Depth Slider
    const sinkSlider = document.getElementById('modelSinkageSlider');
    const sinkVal = document.getElementById('modelSinkageSliderVal');
    sinkSlider?.addEventListener('input', (e) => {
      const valMm = parseFloat(e.target.value);
      if (sinkVal) sinkVal.textContent = `${valMm.toFixed(1)} mm`;
      if (this.subsidenceModelViewer) {
        this.subsidenceModelViewer.setSinkageDepth(valMm / 10.0);
      }
    });

    // 3. Audio Toggle
    const audioBtn = document.getElementById('btnModelAudioToggle');
    const audioTxt = document.getElementById('modelAudioToggleText');
    let isAudioOn = true;
    audioBtn?.addEventListener('click', () => {
      isAudioOn = !isAudioOn;
      this.subsidenceModelViewer?.toggleAudio(isAudioOn);
      if (audioTxt) audioTxt.textContent = isAudioOn ? 'Buzzer: ON' : 'Buzzer: MUTED';
      audioBtn.classList.toggle('active', isAudioOn);
    });

    // 4. Traffic Toggle
    const trafficBtn = document.getElementById('btnModelTrafficToggle');
    const trafficTxt = document.getElementById('modelTrafficToggleText');
    let trafficState = 'AUTO';
    trafficBtn?.addEventListener('click', () => {
      if (trafficState === 'AUTO') {
        trafficState = 'FORCED_STOP';
        this.subsidenceModelViewer?.toggleTraffic(false);
        if (trafficTxt) trafficTxt.textContent = 'Traffic: STOPPED';
      } else if (trafficState === 'FORCED_STOP') {
        trafficState = 'FORCED_RUN';
        this.subsidenceModelViewer?.toggleTraffic(true);
        if (trafficTxt) trafficTxt.textContent = 'Traffic: RUNNING';
      } else {
        trafficState = 'AUTO';
        this.subsidenceModelViewer?.toggleTraffic(undefined);
        if (trafficTxt) trafficTxt.textContent = 'Traffic: AUTO';
      }
    });

    // 5. Labels Toggle
    const labelsBtn = document.getElementById('btnModelLabelsToggle');
    const labelsTxt = document.getElementById('modelLabelsToggleText');
    let isLabelsOn = true;
    labelsBtn?.addEventListener('click', () => {
      isLabelsOn = !isLabelsOn;
      this.subsidenceModelViewer?.toggleLabels(isLabelsOn);
      if (labelsTxt) labelsTxt.textContent = isLabelsOn ? 'Labels: ON' : 'Labels: OFF';
    });

    // 6. Miner Toggle
    const minerBtn = document.getElementById('btnModelMinerToggle');
    const minerTxt = document.getElementById('modelMinerToggleText');
    let isMinerOn = true;
    minerBtn?.addEventListener('click', () => {
      isMinerOn = !isMinerOn;
      this.subsidenceModelViewer?.toggleMiner(isMinerOn);
      if (minerTxt) minerTxt.textContent = isMinerOn ? 'Miner: ACTIVE' : 'Miner: IDLE';
    });
  }

  updateSubsidenceModelData() {
    const telemetry = meshSimulation.getGlobalTelemetry();
    const peak = telemetry.peakNode;
    if (!peak) return;

    const dEl = document.getElementById('modelTelDisp');
    const tEl = document.getElementById('modelTelTilt');
    const vEl = document.getElementById('modelTelVib');
    const cEl = document.getElementById('modelTelCrack');
    const sEl = document.getElementById('modelTelStrain');
    const bEl = document.getElementById('modelTelBatt');

    if (dEl) dEl.textContent = `${peak.sensors.displacement} mm`;
    if (tEl) tEl.textContent = `${peak.sensors.tilt}°`;
    if (vEl) vEl.textContent = `${peak.sensors.vibration} mm/s`;
    if (cEl) cEl.textContent = `${peak.sensors.crack} mm`;
    if (sEl) sEl.textContent = `${peak.sensors.strain} µε`;
    if (bEl) bEl.textContent = `${peak.battery}% (LiPo)`;
  }

  initGisMapViewer() {
    const mapEl = document.getElementById('gisMapFullContainer');
    if (!mapEl) return;

    if (!this.gisMapViewer) {
      this.gisMapViewer = new GisMapViewer('gisMapFullContainer', this.handleNodeSelect.bind(this));
      this.gisMapViewer.updateDynamicLayers(meshSimulation.nodes, meshSimulation.getGlobalTelemetry());
      this.setupGisMapControls();
    }
  }

  setupGisMapControls() {
    // Coalfield select
    const fieldSelect = document.getElementById('gisCoalfieldSelect');
    fieldSelect?.addEventListener('change', (e) => {
      this.gisMapViewer?.switchCoalfield(e.target.value);
      const coords = {
        raniganj: '23.6845° N, 86.9532° E',
        jharia: '23.7480° N, 86.4170° E',
        korba: '22.3595° N, 82.7501° E',
        singrauli: '24.1980° N, 82.6650° E',
        bokaro: '23.7820° N, 85.8650° E'
      };
      const cEl = document.getElementById('gisCoordsDisplay');
      if (cEl) cEl.textContent = coords[e.target.value] || '23.6845° N, 86.9532° E';
    });

    // Basemap select
    const baseSelect = document.getElementById('gisBasemapSelect');
    baseSelect?.addEventListener('change', (e) => {
      this.gisMapViewer?.setBasemap(e.target.value);
    });

    // Layer checkboxes
    const layerCheckboxes = [
      { id: 'gisLayerPanels', key: 'panels' },
      { id: 'gisLayerHeatmap', key: 'heatmap' },
      { id: 'gisLayerBuffer', key: 'buffer' },
      { id: 'gisLayerSensors', key: 'sensors' },
      { id: 'gisLayerInfra', key: 'infra' },
      { id: 'gisLayerSettlements', key: 'settlements' }
    ];

    layerCheckboxes.forEach(item => {
      document.getElementById(item.id)?.addEventListener('change', (e) => {
        this.gisMapViewer?.toggleLayer(item.key, e.target.checked);
      });
    });

    // Center Panel button
    document.getElementById('btnGisCenterPanel')?.addEventListener('click', () => {
      this.gisMapViewer?.centerOnActivePanel();
    });

    // Export GeoJSON
    document.getElementById('btnGisExportGeoJson')?.addEventListener('click', () => {
      this.exportGisGeoJson();
    });
  }

  showToast(title, msg, type = 'info') {
    const container = document.getElementById('sonicToastContainer');
    if (!container) return;

    let toastTypeClass = 'toast-green';
    let iconSvg = 'check-circle';
    if (type === 'warning' || type === 'yellow') {
      toastTypeClass = 'toast-yellow';
      iconSvg = 'alert-triangle';
    } else if (type === 'danger' || type === 'orange') {
      toastTypeClass = 'toast-orange';
      iconSvg = 'alert-octagon';
    } else if (type === 'critical' || type === 'red') {
      toastTypeClass = 'toast-red';
      iconSvg = 'shield-alert';
    }

    const toast = document.createElement('div');
    toast.className = `sonic-toast ${toastTypeClass}`;
    toast.innerHTML = `
      <div class="toast-icon-wrap">
        <i data-lucide="${iconSvg}" class="icon-xs"></i>
      </div>
      <div class="toast-content">
        <div class="toast-title">${title}</div>
        <div class="toast-msg">${msg}</div>
        <div class="toast-time">${new Date().toLocaleTimeString()} IST</div>
      </div>
    `;

    container.appendChild(toast);
    createIcons({ icons });

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 300);
    }, 4500);
  }

  setupReports() {
    const modal = document.getElementById('reportModalBackdrop');
    const titleEl = document.getElementById('modalReportTitle');
    const contentEl = document.getElementById('modalReportContent');

    const openReport = async (repType) => {
      const telemetry = meshSimulation.getGlobalTelemetry();
      const analysis = await aiService.runGeotechnicalAnalysis(telemetry);

      if (titleEl) titleEl.textContent = `TERRA GUARD - X: ${repType.toUpperCase()} SAFETY REPORT`;
      if (contentEl) {
        contentEl.innerHTML = `
          <div style="background:rgba(15,23,42,0.9); padding:16px; border-radius:8px; font-family:var(--font-mono); font-size:0.8rem; white-space:pre-wrap;">
TERRA GUARD - X GEOTECHNICAL STABILITY REPORT
Survey Sector: Sector A17 (Fault Deformation Zone)
Strata Depth: 185m | Active LoRa Mesh Nodes: ${telemetry.onlineNodes}/${telemetry.totalNodes}
Report Generated: ${new Date().toISOString()}
-------------------------------------------------------------
GLOBAL THREAT LEVEL: ${telemetry.risk.level} (${Math.round(telemetry.risk.score * 100)}% Risk Score)
AI Engine Source: ${analysis.source}

${analysis.content}
-------------------------------------------------------------
Geotechnical Hazard Safety Statutory Reference #TGX26025
          </div>
        `;
      }
      modal?.classList.add('active');
    };

    document.querySelectorAll('.btn-view-report').forEach(btn => {
      btn.addEventListener('click', (e) => openReport(e.currentTarget.dataset.rep));
    });

    document.getElementById('headerReportBtn')?.addEventListener('click', () => openReport('daily'));
    document.getElementById('btnRaExportReport')?.addEventListener('click', () => openReport('Geotechnical Safety Audit'));

    document.querySelectorAll('.btn-download-pdf').forEach(btn => {
      btn.addEventListener('click', () => this.generatePdfReport());
    });
    document.getElementById('btnModalDownloadPdf')?.addEventListener('click', () => this.generatePdfReport());

    // Critical Incident Report Export Listeners
    document.getElementById('btnIncidentExportPdf')?.addEventListener('click', () => this.generateCriticalIncidentPdf());
    document.getElementById('btnIncidentExportCsv')?.addEventListener('click', () => this.exportCriticalIncidentCsv());
    document.getElementById('btnIncidentExportJson')?.addEventListener('click', () => this.exportCriticalIncidentJson());
    document.getElementById('btnIncidentExportPng')?.addEventListener('click', () => this.exportRiskMapPng());
    document.getElementById('btnIncidentExportGeoJson')?.addEventListener('click', () => this.exportGisGeoJson());
  }

  generatePdfReport() {
    const doc = new jsPDF();
    const telemetry = meshSimulation.getGlobalTelemetry();

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("TERRA GUARD - X - GROUND SAFETY PLATFORM", 14, 20);

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("Real-Time Ground Subsidence Compliance Assessment", 14, 28);
    doc.text(`Survey Sector: Sector A17 | Depth: 185m`, 14, 35);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 42);

    doc.setLineWidth(0.5);
    doc.line(14, 46, 196, 46);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(`CURRENT THREAT LEVEL: ${telemetry.risk.level} (${Math.round(telemetry.risk.score * 100)}% Risk Score)`, 14, 56);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`- LoRa Mesh Infrastructure: ${telemetry.onlineNodes} / ${telemetry.totalNodes} Nodes Online (98.7% Packet Success)`, 14, 66);
    doc.text(`- Peak Surface Displacement: ${telemetry.peakNode?.sensors?.displacement} mm (Baseline: 4.2 mm)`, 14, 73);
    doc.text(`- Inclinometer Peak Tilt: ${telemetry.peakNode?.sensors?.tilt}° (Baseline: 2.5°)`, 14, 80);
    doc.text(`- Micro-Vibration Amplitude: ${telemetry.peakNode?.sensors?.vibration} mm/s (Baseline: 1.1 mm/s)`, 14, 87);
    doc.text(`- Surface Crack Aperture: ${telemetry.peakNode?.sensors?.crack} mm (Baseline: 0.5 mm)`, 14, 94);
    doc.text(`- 24-Hour Predicted Progression: ${telemetry.prediction.plus24h} mm`, 14, 101);

    doc.setFont("helvetica", "bold");
    doc.text("MANDATORY SAFETY ACTION DIRECTIVE:", 14, 115);
    doc.setFont("helvetica", "normal");
    doc.text(telemetry.risk.actionRequired, 14, 122, { maxWidth: 170 });

    doc.save(`TerraGuardX_Safety_Report_${Date.now()}.pdf`);
  }

  generateCriticalIncidentPdf() {
    const doc = new jsPDF();
    const telemetry = meshSimulation.getGlobalTelemetry();

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("TERRA GUARD - X: CRITICAL SUBSIDENCE DOSSIER", 14, 20);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Incident ID: INC-2026-A17-088 | Status: EVACUATION ORDER ISSUED`, 14, 28);
    doc.text(`Sector: Geological Survey Sector A17 | Depth: 185m`, 14, 35);
    doc.text(`Statutory Authority: Geotechnical Hazard Safety Standard 2026`, 14, 42);

    doc.setLineWidth(0.5);
    doc.line(14, 46, 196, 46);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text(`THREAT CLASSIFICATION: RED CRITICAL (Score: ${(telemetry.risk.score * 100).toFixed(1)}%)`, 14, 55);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`- Peak Subsidence Displacement: 12.4 mm (Critical Threshold: 10.0 mm)`, 14, 64);
    doc.text(`- Peak Tilt Rate: 5.8° (Critical Threshold: 4.0°)`, 14, 71);
    doc.text(`- Surface Crack Propagation: 3.2 mm (Baseline: 0.5 mm)`, 14, 78);
    doc.text(`- Multi-Sensor AI Fused Confidence: 94.2% (Uncertainty: 4.2%)`, 14, 85);
    doc.text(`- Primary Contributing Factor: InSAR + Multi-Node Mesh Convergence (0.34)`, 14, 92);
    doc.text(`- 24-Hour Predicted Subsidence: +31.6 mm (Accelerating Trend)`, 14, 99);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("PHYSICAL & DIGITAL ALERT DISPATCH VERIFICATION:", 14, 112);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`- Web Dashboard Alert: Broadcast DELIVERED`, 14, 121);
    doc.text(`- SMS Notification Router: Sent to Safety Officers (DELIVERED)`, 14, 128);
    doc.text(`- Physical ESP32 Beacons: ACTIVE RED FLASHING LIGHT`, 14, 135);
    doc.text(`- Sector Acoustic Siren: 110 dB Evacuation Alarm ACTIVE`, 14, 142);
    doc.text(`- Acknowledgment: Er. R. Sharma (Safety Officer) at 20:46:10 IST`, 14, 149);
    doc.text(`- Field Response: Emergency Response Team Alpha deployed to Perimeter Roadway`, 14, 156);

    doc.save(`TerraGuardX_Critical_Incident_INC-2026-A17-088_${Date.now()}.pdf`);
    auditService.logAction({
      user: this.currentRole,
      action: 'CRITICAL_INCIDENT_REPORT_EXPORTED_PDF',
      actionType: 'DEMO_ACTION',
      zone: 'Sector A17',
      reason: 'Official Critical Incident PDF Dossier generated and archived',
      severity: 'HIGH'
    });
  }

  exportCriticalIncidentCsv() {
    const telemetry = meshSimulation.getGlobalTelemetry();
    const rows = [
      ["Incident_ID", "Survey_Region", "Sector", "Timestamp", "Risk_Level", "Risk_Score", "AI_Confidence", "Displacement_mm", "Tilt_deg", "Crack_mm", "Strain_ue", "Vibration_mms", "Forecast_24h_mm", "Status"],
      ["INC-2026-A17-088", "Geological Survey Region", "Sector A17", new Date().toISOString(), telemetry.risk.level, telemetry.risk.score, "0.94", telemetry.peakNode.sensors.displacement, telemetry.peakNode.sensors.tilt, telemetry.peakNode.sensors.crack, telemetry.peakNode.sensors.strain, telemetry.peakNode.sensors.vibration, telemetry.prediction.plus24h, "ACKNOWLEDGED_EVACUATED"]
    ];

    const csvContent = rows.map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `TerraGuardX_Incident_INC-2026-A17-088.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  exportCriticalIncidentJson() {
    const telemetry = meshSimulation.getGlobalTelemetry();
    const data = {
      incidentId: "INC-2026-A17-088",
      system: "TERRA GUARD - X",
      region: "Geological Survey Region - Sector A17",
      timestamp: new Date().toISOString(),
      threatLevel: telemetry.risk.level,
      fusedRiskScore: telemetry.risk.score,
      aiConfidence: 0.94,
      uncertaintyPercent: 4.2,
      affectedSensors: ["TGX-020", "TGX-022", "TGX-024", "TGX-026", "TGX-028"],
      sensorEvidence: telemetry.peakNode.sensors,
      spatialEvidence: {
        affectedAreaSqm: 245,
        azimuthAngle: 135,
        clusterStrength: "HIGH",
        neighborAgreementRatio: 0.91
      },
      progressionForecast: {
        t0: telemetry.peakNode.sensors.displacement,
        plus6h: 17.8,
        plus12h: 23.1,
        plus24h: 31.6
      },
      statutoryAudit: {
        acknowledgedBy: "Er. R. Sharma (Safety Officer)",
        fieldVerificationStatus: "TEAM_ALPHA_DISPATCHED",
        evacuationOrder: "CONFIRMED",
        physicalAlertTower: "ACTIVE_RED_BEACON"
      }
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TerraGuardX_Incident_INC-2026-A17-088.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  exportRiskMapPng() {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');

    // Draw Dark Gradient Background
    const bgGrad = ctx.createLinearGradient(0, 0, 800, 600);
    bgGrad.addColorStop(0, '#070d19');
    bgGrad.addColorStop(1, '#0f172a');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 800, 600);

    // Grid Lines
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.15)';
    ctx.lineWidth = 1;
    for (let x = 0; x < 800; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 600);
      ctx.stroke();
    }
    for (let y = 0; y < 600; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(800, y);
      ctx.stroke();
    }

    // Subsidence Risk Heatmap Contours
    const grad = ctx.createRadialGradient(400, 300, 10, 400, 300, 240);
    grad.addColorStop(0, 'rgba(239, 68, 68, 0.85)');
    grad.addColorStop(0.35, 'rgba(249, 115, 22, 0.6)');
    grad.addColorStop(0.7, 'rgba(234, 179, 8, 0.3)');
    grad.addColorStop(1, 'rgba(16, 185, 129, 0.05)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(400, 300, 240, 0, Math.PI * 2);
    ctx.fill();

    // Title & Legend
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px "Space Grotesk", sans-serif';
    ctx.fillText('TERRA GUARD - X: SECTOR A17 SUBSIDENCE RISK CONTOUR MAP', 30, 45);

    ctx.fillStyle = '#38bdf8';
    ctx.font = '12px "JetBrains Mono", monospace';
    ctx.fillText(`Survey Region: Sector A17 | 45° Angle of Draw | Generated: ${new Date().toISOString()}`, 30, 70);

    // Node Points
    meshSimulation.nodes.slice(0, 40).forEach(n => {
      const px = 400 + n.x * 2.2;
      const py = 300 + n.z * 2.2;
      ctx.fillStyle = n.sensors.displacement > 4.2 ? '#ef4444' : '#10b981';
      ctx.beginPath();
      ctx.arc(px, py, 4, 0, Math.PI * 2);
      ctx.fill();
    });

    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `TerraGuardX_Risk_Map_A17_${Date.now()}.png`;
    a.click();
  }

  setupModals() {
    const reportModal = document.getElementById('reportModalBackdrop');
    const sosModal = document.getElementById('sosModalBackdrop');
    const nodeModal = document.getElementById('nodeModalBackdrop');

    document.getElementById('btnCloseReportModal')?.addEventListener('click', () => reportModal?.classList.remove('active'));
    document.getElementById('btnModalClose')?.addEventListener('click', () => reportModal?.classList.remove('active'));

    document.getElementById('btnCloseNodeModal')?.addEventListener('click', () => nodeModal?.classList.remove('active'));
    document.getElementById('btnCloseDiag')?.addEventListener('click', () => nodeModal?.classList.remove('active'));

    document.getElementById('emergencySosBtn')?.addEventListener('click', () => {
      sosModal?.classList.add('active');
      this.playSiren();
      auditService.logAction({
        user: this.currentRole,
        action: 'EMERGENCY_SOS_TRIGGERED',
        actionType: 'PHYSICAL_BEACON_DISPATCH',
        zone: 'Sector A17',
        reason: 'Operator manually activated Sector Evacuation Siren',
        severity: 'CRITICAL'
      });
    });

    document.getElementById('btnCloseSosModal')?.addEventListener('click', () => {
      sosModal?.classList.remove('active');
      this.stopSiren();
    });

    document.getElementById('btnMuteSiren')?.addEventListener('click', () => {
      sosModal?.classList.remove('active');
      this.stopSiren();
    });

    document.getElementById('btnConfirmEvacuate')?.addEventListener('click', () => {
      alert('SECTOR EVACUATION DIRECTIVE BROADCAST: Emergency response teams dispatched and gates sealed.');
      sosModal?.classList.remove('active');
      this.stopSiren();
    });
  }

  playSiren() {
    try {
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(440, this.audioContext.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, this.audioContext.currentTime + 0.5);
      osc.frequency.exponentialRampToValueAtTime(440, this.audioContext.currentTime + 1.0);

      gain.gain.setValueAtTime(0.2, this.audioContext.currentTime);
      osc.connect(gain);
      gain.connect(this.audioContext.destination);
      osc.start();
      this.sirenOscillator = osc;
    } catch (e) {
      console.warn('Audio siren notice:', e);
    }
  }

  stopSiren() {
    if (this.sirenOscillator) {
      try {
        this.sirenOscillator.stop();
        this.sirenOscillator.disconnect();
      } catch (e) {}
      this.sirenOscillator = null;
    }
  }

  setupSettings() {
    const geminiInput = document.getElementById('settingGeminiKey');
    const saveBtn = document.getElementById('btnSaveApiKey');

    if (geminiInput) {
      geminiInput.value = aiService.getApiKey();
    }

    saveBtn?.addEventListener('click', () => {
      if (geminiInput) {
        aiService.setApiKey(geminiInput.value);
        alert('AI Key and Geotechnical Settings Saved Successfully!');
        auditService.logAction({
          user: this.currentRole,
          action: 'SETTINGS_UPDATED',
          actionType: 'THRESHOLD_CHANGE',
          zone: 'Central Gateway',
          reason: 'Administrator updated geotechnical parameters & AI configuration',
          severity: 'INFO'
        });
      }
    });
  }
}

// Instantiate MineSonic on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.mineSonicApp = new MineSonicApp();
});
