/**
 * MINESONIC: Network Analytics & Mesh Self-Healing Controller Component
 * Displays real-time RF Link Quality, Packet Loss, Hop Distances, and Self-Healing Rerouting.
 * Smart India Hackathon 2026 | Team Recursion Rebels
 */

import { meshRoutingService } from '../services/meshRoutingService.js';
import { meshSimulation } from '../services/meshSimulation.js';
import { createIcons, icons } from 'lucide';

export class NetworkAnalyticsPanel {
  constructor(containerId) {
    this.container = typeof containerId === 'string' ? document.getElementById(containerId) : containerId;
  }

  render() {
    if (!this.container) return;
    const r = meshRoutingService.getRoutingState(meshSimulation.nodes);

    const isRecovered = r.status === 'RECOVERED';
    const isRerouting = r.status === 'REROUTING';

    this.container.innerHTML = `
      <div class="network-analytics-card sonic-glass-panel">
        <div class="panel-heading">
          <i data-lucide="activity" class="icon-sm text-accent"></i>
          <h3>WIRELESS MESH NETWORK ANALYTICS &amp; SELF-HEALING</h3>
          <span class="badge-status-level ${isRecovered ? 'badge-green' : (isRerouting ? 'badge-yellow' : 'badge-green')} ml-auto">
            RECOVERY STATUS: ${r.status}
          </span>
        </div>

        <!-- 8 Network Health Stats Grid -->
        <div class="network-stats-grid mt-3">
          <div class="net-stat-box">
            <span class="lbl">Mesh Coverage Area</span>
            <div class="val text-accent">4.2 km²</div>
            <span class="sub">Raniganj Surface Zone</span>
          </div>

          <div class="net-stat-box">
            <span class="lbl">Packet Delivery Rate</span>
            <div class="val text-success">${r.networkHealthPercent}%</div>
            <span class="sub">132 Nodes Monitored</span>
          </div>

          <div class="net-stat-box">
            <span class="lbl">Packet Loss Rate</span>
            <div class="val text-accent">1.3%</div>
            <span class="sub">Forward Error Correction</span>
          </div>

          <div class="net-stat-box">
            <span class="lbl">Average Latency</span>
            <div class="val text-purple">42 ms</div>
            <span class="sub">Multi-Hop LoRa Transmit</span>
          </div>

          <div class="net-stat-box">
            <span class="lbl">Average Link RSSI</span>
            <div class="val text-accent">-72.4 dBm</div>
            <span class="sub">SNR: +8.5 dB (Strong)</span>
          </div>

          <div class="net-stat-box">
            <span class="lbl">Average Hop Count</span>
            <div class="val text-accent">${r.avgHopCount} Hops</div>
            <span class="sub">Direct to Central Gateway</span>
          </div>

          <div class="net-stat-box">
            <span class="lbl">Active Mesh Routes</span>
            <div class="val text-success">${r.totalActiveRoutes} Routes</div>
            <span class="sub">Dynamic AODV Protocol</span>
          </div>

          <div class="net-stat-box">
            <span class="lbl">Network Stability Index</span>
            <div class="val text-success">99.1%</div>
            <span class="sub">Zero Link Oscillations</span>
          </div>
        </div>

        <!-- Self-Healing Mesh Demo Controller Strip -->
        <div class="mesh-healing-controller-box mt-3">
          <div class="healing-hdr">
            <div>
              <strong class="text-accent"><i data-lucide="cpu" class="icon-xs"></i> LoRa MESH SELF-HEALING SIMULATOR</strong>
              <p style="font-size:0.7rem; color:#94a3b8; margin-top:2px;">
                Demonstrate autonomous failover when a primary LoRa node link experiences severe RF shadowing or structural damage.
              </p>
            </div>
            <div class="healing-btns" style="display:flex; gap:8px;">
              <button class="btn btn-xs btn-outline text-red" id="btnSimulateLinkFailure">
                <i data-lucide="zap-off" class="icon-xxs"></i> Simulate Link Failure (MSN-024)
              </button>
              <button class="btn btn-xs btn-primary" id="btnTriggerSelfHealing">
                <i data-lucide="refresh-cw" class="icon-xxs"></i> Trigger Self-Healing Reroute
              </button>
              <button class="btn btn-xs btn-outline" id="btnResetTopology">
                <i data-lucide="rotate-ccw" class="icon-xxs"></i> Reset Topology
              </button>
            </div>
          </div>

          <!-- Dynamic Route History Log -->
          <div class="route-history-list mt-3">
            ${r.history.map(h => `
              <div class="route-log-item ${h.type.toLowerCase()}">
                <span class="log-time font-mono">${h.timestamp}</span>
                <span class="log-event">${h.event}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    // Attach healing simulator buttons
    this.container.querySelector('#btnSimulateLinkFailure')?.addEventListener('click', () => {
      meshRoutingService.detectBrokenLink('MSN-024', 'GW-01');
      this.render();
    });

    this.container.querySelector('#btnTriggerSelfHealing')?.addEventListener('click', () => {
      meshRoutingService.rerouteNode('MSN-024', meshSimulation.nodes);
      this.render();
    });

    this.container.querySelector('#btnResetTopology')?.addEventListener('click', () => {
      meshRoutingService.resetRoutes(meshSimulation.nodes);
      this.render();
    });

    createIcons({ icons, nameAttr: 'data-lucide', root: this.container });
  }
}
