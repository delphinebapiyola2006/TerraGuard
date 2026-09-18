/**
 * TERRA GUARD - X: Complete Notification Router & IoT Physical Alert Service
 * Multi-Channel Router: Web Dashboard, SMS, Email, Mobile App, Physical LED Beacon & Surface Siren
 * Smart India Hackathon 2026 | Terra Guard - X
 */

export class NotificationService {
  constructor() {
    this.controllerState = {
      deviceModel: 'ESP32-WROOM-32U + SX1276 LoRa + 4-Colour High-Lumen LED Stack',
      controllerId: 'IOT-ALERT-CTRL-01',
      connectionStatus: 'CONNECTED',
      activeLight: 'GREEN',
      sirenStatus: 'MUTED',
      mqttBroker: 'mqtt://lora-mesh.terraguard.internal:1883',
      mqttTopic: 'terraguard/alerts/A17',
      restEndpoint: 'POST /api/alerts/physical',
      lastCommand: {
        zone: 'A17',
        risk_level: 'NORMAL',
        light: 'GREEN',
        siren: false,
        timestamp: new Date().toISOString()
      },
      commandHistory: []
    };

    this.notificationQueue = [
      {
        id: 'NTF-101',
        channel: 'PHYSICAL_LIGHT',
        recipient: 'ESP32 LED Stack (Beacon #01)',
        message: 'Active Light switched to 🔴 RED (Critical Risk)',
        status: 'DELIVERED',
        timestamp: '20:45:22',
        latencyMs: 14
      },
      {
        id: 'NTF-102',
        channel: 'SMS',
        recipient: '+91 98301 XXXXX (Safety Officer)',
        message: 'TERRA GUARD - X ALERT: Critical Ground Subsidence (12.4mm) in Sector A17. Safety protocol active.',
        status: 'DELIVERED',
        timestamp: '20:45:25',
        latencyMs: 1200
      },
      {
        id: 'NTF-103',
        channel: 'MOBILE_PUSH',
        recipient: 'Geotechnical Safety Mobile App (All Field Engineers)',
        message: '🔴 Level 4 Critical Geotechnical Hazard localized at Node TGX-024.',
        status: 'DELIVERED',
        timestamp: '20:45:26',
        latencyMs: 180
      },
      {
        id: 'NTF-104',
        channel: 'EMAIL',
        recipient: 'safety.audit@geotechsurvey.gov.in (Safety Inspection Cell)',
        message: 'Automated Geotechnical Stability Assessment Dossier Generated for Sector A17.',
        status: 'SENT',
        timestamp: '20:45:30',
        latencyMs: 850
      },
      {
        id: 'NTF-105',
        channel: 'CONTROL_ROOM',
        recipient: 'Central Command & Web Dashboard Siren',
        message: 'Audio Siren Activated across Sector A17.',
        status: 'ACKNOWLEDGED',
        timestamp: '20:46:12',
        latencyMs: 5
      }
    ];

    this.listeners = [];
  }

  /**
   * Router function 1: Dispatch to Web Dashboard
   */
  sendDashboardAlert(title, message, riskLevel = 'CRITICAL') {
    return this.logNotification('DASHBOARD', 'Active Command Centre Screen', `${riskLevel}: ${title} - ${message}`, 'DELIVERED');
  }

  /**
   * Router function 2: Simulated SMS Gateway
   */
  sendSMS(phone, message) {
    return this.logNotification('SMS', phone || '+91 98301 XXXXX (Chief Safety Officer)', message, 'DELIVERED');
  }

  /**
   * Router function 3: Automated Email Service
   */
  sendEmail(toAddress, subject, body) {
    return this.logNotification('EMAIL', toAddress || 'safety@terraguard.org', `${subject}: ${body.slice(0, 80)}...`, 'SENT');
  }

  /**
   * Router function 4: Mobile Push Notification
   */
  sendMobileNotification(targetRole, message) {
    return this.logNotification('MOBILE_PUSH', `Role: ${targetRole || 'Field Engineers'}`, message, 'DELIVERED');
  }

  /**
   * Router function 5: Physical Alert Beacon Command (REST & MQTT)
   */
  sendPhysicalAlert(zone, riskLevel, colorLight, activateSiren = false) {
    const payload = {
      zone: zone || 'A17',
      risk_level: riskLevel,
      light: colorLight,
      siren: Boolean(activateSiren),
      timestamp: new Date().toISOString()
    };

    this.controllerState.activeLight = colorLight;
    this.controllerState.sirenStatus = activateSiren ? 'ACTIVE_AUDIBLE' : 'MUTED';
    this.controllerState.lastCommand = payload;
    this.controllerState.mqttTopic = `terraguard/alerts/${zone || 'A17'}`;

    this.controllerState.commandHistory.unshift({
      id: `CMD-${Date.now().toString(36).toUpperCase()}`,
      ...payload
    });

    this.logNotification('PHYSICAL_LIGHT', `ESP32 Beacon (${zone})`, `Light: ${colorLight}, Siren: ${activateSiren}`, 'DELIVERED');
    this.notifyListeners();
    return payload;
  }

  /**
   * Router function 6: Surface Sector Siren
   */
  sendSirenCommand(active) {
    this.controllerState.sirenStatus = active ? 'ACTIVE_AUDIBLE' : 'MUTED';
    this.controllerState.lastCommand.siren = Boolean(active);
    this.logNotification('SIREN', 'Sector A17 High-Decibel Siren', active ? 'SIREN TRIGGERED' : 'SIREN MUTED', 'DELIVERED');
    this.notifyListeners();
  }

  /**
   * Router function 7: Multi-tier Escalation Broadcast
   */
  sendEscalationNotification(alert, targetLevel = 'Level 3 (Safety Director)') {
    const msg = `ESCALATION to ${targetLevel}: ${alert.title} in ${alert.zone}. SLA timer exceeded.`;
    this.sendSMS('+91 94340 XXXXX (Safety Director)', msg);
    this.sendMobileNotification('MANAGEMENT', msg);
    this.sendEmail('safety.director@terraguard.org', 'URGENT ESCALATION', msg);
  }

  logNotification(channel, recipient, message, status = 'DELIVERED') {
    const entry = {
      id: `NTF-${Date.now().toString(36).toUpperCase()}`,
      channel,
      recipient,
      message,
      status, // PENDING, SENT, DELIVERED, FAILED, ACKNOWLEDGED
      timestamp: new Date().toLocaleTimeString(),
      latencyMs: Math.floor(10 + Math.random() * 250)
    };
    this.notificationQueue.unshift(entry);
    if (this.notificationQueue.length > 30) this.notificationQueue.pop();
    this.notifyListeners();
    return entry;
  }

  dispatchPhysicalAlert(zone, riskLevel, colorLight, activateSiren = false) {
    return this.sendPhysicalAlert(zone, riskLevel, colorLight, activateSiren);
  }

  toggleSiren(active) {
    this.sendSirenCommand(active);
  }

  subscribe(callback) {
    this.listeners.push(callback);
    callback(this.controllerState, this.notificationQueue);
    return () => {
      this.listeners = this.listeners.filter(fn => fn !== callback);
    };
  }

  notifyListeners() {
    this.listeners.forEach(fn => {
      try { fn(this.controllerState, this.notificationQueue); } catch (err) { console.error('NotificationService error:', err); }
    });
  }

  getState() {
    return this.controllerState;
  }

  getHistory() {
    return this.notificationQueue;
  }
}

export const notificationService = new NotificationService();
