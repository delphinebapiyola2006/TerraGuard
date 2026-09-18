/**
 * MINESONIC: Physical 4-Colour Alert Lights Controller Component
 * Shows physical IoT stack (Green, Yellow, Orange, Red LEDs) + ESP32 link + MQTT/REST status.
 * Smart India Hackathon 2026 | Team Recursion Rebels
 */

import { notificationService } from '../services/notificationService.js';
import { createIcons, icons } from 'lucide';

export class PhysicalAlertPanel {
  constructor(containerId) {
    this.container = typeof containerId === 'string' ? document.getElementById(containerId) : containerId;
  }

  render() {
    if (!this.container) return;
    const state = notificationService.getState();
    const active = state.activeLight;

    this.container.innerHTML = `
      <div class="physical-alert-card sonic-glass-panel">
        <div class="panel-heading">
          <i data-lucide="zap" class="icon-sm text-accent"></i>
          <h3>PHYSICAL 4-COLOUR EARLY WARNING BEACON</h3>
          <span class="badge-status-level badge-green ml-auto">ESP32 IoT CONNECTED</span>
        </div>

        <div class="physical-beacon-layout mt-3">
          <!-- Physical 4-LED Beacon Tower Visualizer -->
          <div class="beacon-tower-visualizer">
            <div class="beacon-light red ${active === 'RED' ? 'illuminated pulse-fast' : 'dim'}">
              <span class="light-label">RED (CRITICAL)</span>
            </div>
            <div class="beacon-light orange ${active === 'ORANGE' ? 'illuminated' : 'dim'}">
              <span class="light-label">ORANGE (HIGH RISK)</span>
            </div>
            <div class="beacon-light yellow ${active === 'YELLOW' ? 'illuminated' : 'dim'}">
              <span class="light-label">YELLOW (CAUTION)</span>
            </div>
            <div class="beacon-light green ${active === 'GREEN' ? 'illuminated' : 'dim'}">
              <span class="light-label">GREEN (NORMAL)</span>
            </div>
            <div class="beacon-siren-horn ${state.sirenStatus === 'ACTIVE_AUDIBLE' ? 'siren-pulsing' : ''}">
              <i data-lucide="volume-2" class="icon-sm"></i>
              <span>${state.sirenStatus === 'ACTIVE_AUDIBLE' ? 'SIREN SOUNDING' : 'SIREN MUTED'}</span>
            </div>
          </div>

          <!-- Controller Telemetry & Network Details -->
          <div class="beacon-meta-col">
            <div class="iot-specs-grid">
              <div class="iot-spec-item">
                <span class="lbl">Hardware Controller:</span>
                <strong class="val">${state.deviceModel}</strong>
              </div>
              <div class="iot-spec-item">
                <span class="lbl">Active Color:</span>
                <strong class="val text-${active.toLowerCase()}">${active} LED</strong>
              </div>
              <div class="iot-spec-item">
                <span class="lbl">REST Endpoint:</span>
                <span class="val font-mono">${state.restEndpoint}</span>
              </div>
              <div class="iot-spec-item">
                <span class="lbl">MQTT Topic:</span>
                <span class="val font-mono text-accent">${state.mqttTopic}</span>
              </div>
            </div>

            <!-- Last Dispatched JSON Payload -->
            <div class="last-payload-box mt-3">
              <div class="payload-header">
                <span>LAST DISPATCHED IOT PAYLOAD</span>
                <span class="font-mono text-success">200 OK</span>
              </div>
              <pre class="payload-code">${JSON.stringify(state.lastCommand, null, 2)}</pre>
            </div>

            <!-- Manual Test Controls -->
            <div class="beacon-manual-controls mt-3">
              <button class="btn btn-xs btn-outline btn-test-light" data-color="GREEN">Test Green</button>
              <button class="btn btn-xs btn-outline text-yellow btn-test-light" data-color="YELLOW">Test Yellow</button>
              <button class="btn btn-xs btn-outline text-orange btn-test-light" data-color="ORANGE">Test Orange</button>
              <button class="btn btn-xs btn-outline text-red btn-test-light" data-color="RED">Test Red</button>
              <button class="btn btn-xs ${state.sirenStatus === 'ACTIVE_AUDIBLE' ? 'btn-danger-pulse' : 'btn-outline'} btn-toggle-siren">
                <i data-lucide="volume-2" class="icon-xxs"></i> ${state.sirenStatus === 'ACTIVE_AUDIBLE' ? 'Silence Siren' : 'Trigger Siren'}
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Attach test buttons
    this.container.querySelectorAll('.btn-test-light').forEach(b => {
      b.addEventListener('click', (e) => {
        const color = e.currentTarget.dataset.color;
        notificationService.dispatchPhysicalAlert('A17', color, color, color === 'RED');
        this.render();
      });
    });

    this.container.querySelector('.btn-toggle-siren')?.addEventListener('click', () => {
      const isAudible = state.sirenStatus === 'ACTIVE_AUDIBLE';
      notificationService.toggleSiren(!isAudible);
      this.render();
    });

    createIcons({ icons, nameAttr: 'data-lucide', root: this.container });
  }
}
