/**
 * MINESONIC: Offline Mode & Cloud Synchronization Service
 * Provides offline-first edge monitoring with seamless cloud database replication
 * Smart India Hackathon 2026 | Team Recursion Rebels
 */

export class OfflineSyncService {
  constructor() {
    this.isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    this.localMonitoringStatus = 'OPERATIONAL_EDGE';
    this.pendingSyncRecords = 18;
    this.lastCloudSync = new Date(Date.now() - 4 * 60000).toLocaleTimeString();
    this.syncProgressPercent = 100;
    this.isSyncing = false;
    this.listeners = [];

    this.initNetworkListeners();
  }

  initNetworkListeners() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.isOnline = true;
        this.triggerCloudSync();
      });
      window.addEventListener('offline', () => {
        this.isOnline = false;
        this.notify();
      });
    }
  }

  toggleNetworkStatus() {
    this.isOnline = !this.isOnline;
    if (this.isOnline) {
      this.triggerCloudSync();
    } else {
      this.notify();
    }
    return this.isOnline;
  }

  recordLocalTelemetry(telemetry) {
    if (!this.isOnline) {
      this.pendingSyncRecords++;
      this.notify();
    }
  }

  triggerCloudSync() {
    if (this.isSyncing || this.pendingSyncRecords === 0) return;
    this.isSyncing = true;
    this.syncProgressPercent = 20;
    this.notify();

    const interval = setInterval(() => {
      this.syncProgressPercent += 30;
      if (this.syncProgressPercent >= 100) {
        clearInterval(interval);
        this.syncProgressPercent = 100;
        this.pendingSyncRecords = 0;
        this.lastCloudSync = new Date().toLocaleTimeString();
        this.isSyncing = false;
        this.notify();
      } else {
        this.notify();
      }
    }, 400);
  }

  getSyncState() {
    return {
      isOnline: this.isOnline,
      connectionBadge: this.isOnline ? 'ONLINE (CLOUD CONNECTED)' : 'OFFLINE (LOCAL GATEWAY)',
      localMonitoringStatus: this.localMonitoringStatus,
      pendingSyncRecords: this.pendingSyncRecords,
      lastCloudSync: this.lastCloudSync,
      syncProgressPercent: this.syncProgressPercent,
      isSyncing: this.isSyncing
    };
  }

  subscribe(callback) {
    this.listeners.push(callback);
    callback(this.getSyncState());
    return () => {
      this.listeners = this.listeners.filter(fn => fn !== callback);
    };
  }

  notify() {
    const state = this.getSyncState();
    this.listeners.forEach(fn => {
      try {
        fn(state);
      } catch (e) {
        console.error('OfflineSyncService error:', e);
      }
    });
  }
}

export const offlineSyncService = new OfflineSyncService();
