/**
 * MINESONIC: Wireless Mesh Self-Healing & Automatic Rerouting Service
 * Detects broken LoRa links, initiates route recalculation, and recovers node connectivity.
 * Smart India Hackathon 2026 | Team Recursion Rebels
 */

export class MeshRoutingService {
  constructor() {
    this.status = 'NORMAL'; // NORMAL, REROUTING, RECOVERED, NETWORK_DEGRADED, OFFLINE
    this.brokenLinks = []; // list of { fromId, toId, timestamp }
    this.reroutedNodes = new Map(); // nodeId -> { originalHop, newHop, recoveryPath: [] }
    this.networkHealthPercent = 98.4;
    this.listeners = [];

    this.routeHistory = [
      { timestamp: '20:41:10', event: 'Link MSN-024 ↔ MSN-018 RSSI degraded (-118 dBm)', type: 'WARNING' },
      { timestamp: '20:42:05', event: 'Primary route failed. Node MSN-024 initiated neighbor discovery', type: 'REROUTE' },
      { timestamp: '20:42:07', event: 'Alternative path discovered via MSN-012 → GW-01 (Hop count: 2)', type: 'RECOVERED' }
    ];
  }

  /**
   * Find optimal path from a node to Central Gateway (GW-01)
   */
  findOptimalRoute(nodeId, nodes) {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return { hops: 1, path: ['GW-01'] };

    if (this.reroutedNodes.has(nodeId)) {
      return this.reroutedNodes.get(nodeId);
    }

    if (node.hops === 1) {
      return { hops: 1, path: [node.id, 'GW-01'], status: 'OPTIMAL_DIRECT' };
    } else if (node.hops === 2) {
      const intermediate = node.preferredNextHop || 'MSN-012';
      return { hops: 2, path: [node.id, intermediate, 'GW-01'], status: 'MULTI_HOP_STABLE' };
    } else {
      return { hops: 3, path: [node.id, 'MSN-045', 'MSN-012', 'GW-01'], status: 'MULTI_HOP_LONG' };
    }
  }

  /**
   * Simulate or detect broken communication link
   */
  detectBrokenLink(fromId, toId = 'GW-01') {
    this.status = 'REROUTING';
    const broken = { fromId, toId, timestamp: new Date().toLocaleTimeString() };
    this.brokenLinks.push(broken);

    this.routeHistory.unshift({
      timestamp: new Date().toLocaleTimeString(),
      event: `Link Failure Detected: ${fromId} ⇸ ${toId}. Primary route unavailable.`,
      type: 'FAILURE'
    });

    this.notify();
    return broken;
  }

  /**
   * Find alternative path using spatial neighbor discovery
   */
  findAlternativePath(nodeId, nodes) {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return null;

    // Pick a healthy online neighbor as bridge
    const healthyBridge = nodes.find(n => n.id !== nodeId && n.status === 'ONLINE' && n.battery > 40 && n.rssi > -85) || { id: 'MSN-012' };

    const newPath = [node.id, healthyBridge.id, 'GW-01'];
    return {
      nodeId,
      originalHop: 'GW-01',
      newHop: healthyBridge.id,
      path: newPath,
      hops: newPath.length - 1,
      recoveryStatus: 'ALTERNATIVE_ROUTE_FOUND'
    };
  }

  /**
   * Complete self-healing reroute for a node
   */
  rerouteNode(nodeId, nodes) {
    this.detectBrokenLink(nodeId, 'GW-01');

    setTimeout(() => {
      const alt = this.findAlternativePath(nodeId, nodes);
      if (alt) {
        this.reroutedNodes.set(nodeId, alt);
        this.status = 'RECOVERED';
        this.networkHealthPercent = 97.8;

        this.routeHistory.unshift({
          timestamp: new Date().toLocaleTimeString(),
          event: `Mesh Self-Healing Complete: ${nodeId} dynamically rerouted via ${alt.newHop} → GW-01.`,
          type: 'RECOVERED'
        });

        const targetNode = nodes.find(n => n.id === nodeId);
        if (targetNode) {
          targetNode.isRerouted = true;
          targetNode.preferredNextHop = alt.newHop;
          targetNode.hops = alt.hops;
        }

        this.notify();
      }
    }, 1200);
  }

  /**
   * Reset all simulated reroutes to baseline
   */
  resetRoutes(nodes) {
    this.status = 'NORMAL';
    this.brokenLinks = [];
    this.reroutedNodes.clear();
    this.networkHealthPercent = 98.4;
    nodes.forEach(n => {
      n.isRerouted = false;
      n.preferredNextHop = 'GW-01';
    });
    this.routeHistory.unshift({
      timestamp: new Date().toLocaleTimeString(),
      event: 'Mesh Topology Restored to Normal Baseline.',
      type: 'NORMAL'
    });
    this.notify();
  }

  getRoutingState(nodes = []) {
    return {
      status: this.status,
      networkHealthPercent: this.networkHealthPercent,
      brokenLinksCount: this.brokenLinks.length,
      brokenLinks: this.brokenLinks,
      reroutedCount: this.reroutedNodes.size,
      reroutedNodes: Array.from(this.reroutedNodes.values()),
      history: this.routeHistory.slice(0, 10),
      avgHopCount: 1.4,
      totalActiveRoutes: nodes.length || 132
    };
  }

  subscribe(callback) {
    this.listeners.push(callback);
    callback(this.getRoutingState());
    return () => {
      this.listeners = this.listeners.filter(fn => fn !== callback);
    };
  }

  notify() {
    const s = this.getRoutingState();
    this.listeners.forEach(fn => {
      try { fn(s); } catch (e) { console.error('Routing listener error:', e); }
    });
  }
}

export const meshRoutingService = new MeshRoutingService();
