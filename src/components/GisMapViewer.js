/**
 * MINESONIC: Advanced GIS Coalfield Satellite Map & Geospatial Risk Platform (Leaflet)
 * Satellite Imagery Base Layer with Underground Panels, 45° Statutory Buffer, Iso-Deformation Heatmap,
 * Surface Infrastructure (Railway/Road), Settlements & 132-Node LoRa Sensor Network
 * Smart India Hackathon 2026 | Team Recursion Rebels
 */

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export class GisMapViewer {
  constructor(containerId, onNodeSelect) {
    this.containerId = containerId;
    this.onNodeSelect = onNodeSelect;
    this.map = null;
    
    // Layer Groups
    this.panelsLayer = null;
    this.bufferLayer = null;
    this.riskHeatLayer = null;
    this.infraLayer = null;
    this.settlementsLayer = null;
    this.nodeMarkersLayer = null;
    this.baseLayers = {};

    // Geological Survey Region Coordinates
    this.coalfields = {
      raniganj: { name: 'Raniganj Geological Survey Region', lat: 23.6845, lng: 86.9532, zoom: 15, seam: 'Sector A17 (Zone #4)' },
      jharia: { name: 'Jharia Ground Stability Sector', lat: 23.7480, lng: 86.4170, zoom: 15, seam: 'Sector J04 (Zone IX)' },
      korba: { name: 'Korba Geotechnical Region', lat: 22.3595, lng: 82.7501, zoom: 14, seam: 'Sector G12 (Zone #2)' },
      singrauli: { name: 'Singrauli Infrastructure Perimeter', lat: 24.1980, lng: 82.6650, zoom: 14, seam: 'Sector S08 (Block-B)' },
      bokaro: { name: 'Bokaro Terrain Monitoring Sector', lat: 23.7820, lng: 85.8650, zoom: 15, seam: 'Sector B06 (Perimeter)' }
    };

    this.currentCoalfield = 'raniganj';
    this.initMap();
  }

  initMap() {
    const container = document.getElementById(this.containerId);
    if (!container) return;

    if (this.map) {
      this.map.remove();
      this.map = null;
    }

    const field = this.coalfields[this.currentCoalfield];

    this.map = L.map(this.containerId, {
      center: [field.lat, field.lng],
      zoom: field.zoom,
      zoomControl: true,
      attributionControl: false
    });

    // 1. High-Res Satellite Imagery (Esri World Imagery) - DEFAULT
    const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 19
    });

    // 2. OpenStreetMap Standard
    const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19
    });

    // 3. Topographic Relief Map
    const topoLayer = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
      maxZoom: 17
    });

    // 4. CartoDB Dark Matter
    const darkLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{y}/{x}{r}.png', {
      maxZoom: 19
    });

    satelliteLayer.addTo(this.map);

    this.baseLayers = {
      satellite: satelliteLayer,
      osm: osmLayer,
      topo: topoLayer,
      dark: darkLayer
    };

    // Initialize Overlay Layer Groups
    this.panelsLayer = L.layerGroup().addTo(this.map);
    this.bufferLayer = L.layerGroup().addTo(this.map);
    this.riskHeatLayer = L.layerGroup().addTo(this.map);
    this.infraLayer = L.layerGroup().addTo(this.map);
    this.settlementsLayer = L.layerGroup().addTo(this.map);
    this.nodeMarkersLayer = L.layerGroup().addTo(this.map);

    // Draw Static & Synthetic Features for Current Coalfield
    this.drawGeospatialFeatures();
  }

  setBasemap(type) {
    if (!this.map || !this.baseLayers[type]) return;
    Object.values(this.baseLayers).forEach(layer => {
      if (this.map.hasLayer(layer)) this.map.removeLayer(layer);
    });
    this.baseLayers[type].addTo(this.map);
  }

  switchCoalfield(coalfieldKey) {
    if (!this.coalfields[coalfieldKey]) return;
    this.currentCoalfield = coalfieldKey;
    const f = this.coalfields[coalfieldKey];
    if (this.map) {
      this.map.setView([f.lat, f.lng], f.zoom);
      this.drawGeospatialFeatures();
    }
  }

  drawGeospatialFeatures() {
    if (!this.map) return;
    const f = this.coalfields[this.currentCoalfield];
    const cLat = f.lat;
    const cLng = f.lng;

    // 1. Underground Extraction Panels Layer
    this.panelsLayer.clearLayers();
    const panelA17Coords = [
      [cLat + 0.0040, cLng - 0.0042],
      [cLat + 0.0050, cLng + 0.0048],
      [cLat - 0.0015, cLng + 0.0058],
      [cLat - 0.0025, cLng - 0.0032]
    ];
    const polyA17 = L.polygon(panelA17Coords, {
      color: '#ef4444',
      weight: 3,
      dashArray: '8, 6',
      fillColor: '#ef4444',
      fillOpacity: 0.24
    }).bindPopup(`
      <div style="font-family:sans-serif; font-size:12px;">
        <strong style="color:#ef4444; font-size:13px;">📍 Survey Sector A17 (Deformation Zone)</strong><br>
        <strong>Region:</strong> ${f.name}<br>
        <strong>Strata Layer:</strong> ${f.seam}<br>
        <strong>Depth:</strong> 185 meters | <strong>Classification:</strong> Strata Cavity Zone<br>
        <strong>Deformation Status:</strong> <span style="color:#ef4444; font-weight:700;">High Risk (12.4mm Sinking)</span>
      </div>
    `);
    this.panelsLayer.addLayer(polyA17);

    // Panel A12 (Buffer Zone)
    const panelA12Coords = [
      [cLat - 0.0030, cLng + 0.0068],
      [cLat - 0.0020, cLng + 0.0148],
      [cLat - 0.0085, cLng + 0.0158],
      [cLat - 0.0095, cLng + 0.0078]
    ];
    const polyA12 = L.polygon(panelA12Coords, {
      color: '#f59e0b',
      weight: 2,
      dashArray: '6, 6',
      fillColor: '#f59e0b',
      fillOpacity: 0.15
    }).bindPopup(`
      <div style="font-family:sans-serif; font-size:12px;">
        <strong style="color:#f59e0b;">📍 Sector A12 (Buffer Zone)</strong><br>
        <strong>Status:</strong> Subsurface Void<br>
        <strong>Depth:</strong> 210m | <strong>Monitoring:</strong> Caution
      </div>
    `);
    this.panelsLayer.addLayer(polyA12);

    // 2. Statutory 45° Angle of Draw Safety Buffer Layer
    this.bufferLayer.clearLayers();
    const bufferCoords = [
      [cLat + 0.0065, cLng - 0.0070],
      [cLat + 0.0075, cLng + 0.0076],
      [cLat - 0.0040, cLng + 0.0086],
      [cLat - 0.0050, cLng - 0.0060]
    ];
    const polyBuffer = L.polygon(bufferCoords, {
      color: '#38bdf8',
      weight: 2,
      dashArray: '4, 4',
      fillColor: '#38bdf8',
      fillOpacity: 0.08
    }).bindPopup(`
      <div style="font-family:sans-serif; font-size:12px;">
        <strong style="color:#38bdf8;">📐 Geotechnical 45° Angle of Draw Safety Buffer</strong><br>
        <strong>Safety Standard:</strong> Geotechnical Ground Stability Code 2026<br>
        <strong>Draw Distance:</strong> 185m from deformation boundary<br>
        <strong>Restriction:</strong> Structural perimeter verification required.
      </div>
    `);
    this.bufferLayer.addLayer(polyBuffer);

    // 3. Surface Infrastructure Lines (Railway & Roadway)
    this.infraLayer.clearLayers();
    // Railway Track
    const railwayCoords = [
      [cLat + 0.0080, cLng - 0.0120],
      [cLat + 0.0045, cLng - 0.0020],
      [cLat + 0.0010, cLng + 0.0080],
      [cLat - 0.0030, cLng + 0.0160]
    ];
    const polyRailway = L.polyline(railwayCoords, {
      color: '#facc15',
      weight: 3.5,
      dashArray: '10, 8'
    }).bindPopup(`
      <div style="font-family:sans-serif; font-size:12px;">
        <strong style="color:#facc15;">🚂 Eastern Railway Coal Haulage Line</strong><br>
        <strong>Status:</strong> Active Surface Transport Corridor<br>
        <strong>Interlock:</strong> Automatic Signal Interlock connected to GeoShield IoT
      </div>
    `);
    this.infraLayer.addLayer(polyRailway);

    // Main Colliery Road
    const roadCoords = [
      [cLat - 0.0070, cLng - 0.0100],
      [cLat - 0.0010, cLng - 0.0010],
      [cLat + 0.0030, cLng + 0.0050],
      [cLat + 0.0070, cLng + 0.0110]
    ];
    const polyRoad = L.polyline(roadCoords, {
      color: '#cbd5e1',
      weight: 4
    }).bindPopup(`
      <div style="font-family:sans-serif; font-size:12px;">
        <strong style="color:#cbd5e1;">🛣️ NH / Colliery Perimeter Roadway</strong><br>
        <strong>Vehicle Traffic:</strong> Monitored &bull; Speed limit: 20 km/h
      </div>
    `);
    this.infraLayer.addLayer(polyRoad);

    // 4. Village Settlements & Forest / Water Areas
    this.settlementsLayer.clearLayers();
    const villageCoords = [
      [cLat + 0.0055, cLng + 0.0090],
      [cLat + 0.0080, cLng + 0.0130],
      [cLat + 0.0040, cLng + 0.0150],
      [cLat + 0.0025, cLng + 0.0105]
    ];
    const polyVillage = L.polygon(villageCoords, {
      color: '#a855f7',
      weight: 1.5,
      fillColor: '#a855f7',
      fillOpacity: 0.2
    }).bindPopup(`
      <div style="font-family:sans-serif; font-size:12px;">
        <strong style="color:#a855f7;">🏘️ Kenda / Sitarampur Village Settlement</strong><br>
        <strong>Population:</strong> 3,450 Residents<br>
        <strong>Safety Advisory:</strong> Regular subsidence monitoring and early warning active.
      </div>
    `);
    this.settlementsLayer.addLayer(polyVillage);

    // Water Pond
    const pondCircle = L.circle([cLat - 0.0045, cLng + 0.0025], {
      radius: 120,
      color: '#0284c7',
      fillColor: '#0284c7',
      fillOpacity: 0.4
    }).bindPopup(`<strong>💧 Surface Water Body / Reservoir</strong><br>Groundwater aquifer recharge basin`);
    this.settlementsLayer.addLayer(pondCircle);
  }

  updateDynamicLayers(nodes, telemetry) {
    if (!this.map || !this.nodeMarkersLayer) return;
    this.nodeMarkersLayer.clearLayers();
    this.riskHeatLayer.clearLayers();

    const f = this.coalfields[this.currentCoalfield];
    const cLat = f.lat;
    const cLng = f.lng;
    const riskScore = telemetry.risk?.score || 0.18;
    const isCritical = riskScore >= 0.75;
    const isHigh = riskScore >= 0.50;

    // Subsidence Iso-Deformation Heatmap Rings
    const heatColor = isCritical ? '#ef4444' : (isHigh ? '#f97316' : (riskScore >= 0.25 ? '#f59e0b' : '#10b981'));
    const heatCircle = L.circle([cLat + 0.0015, cLng + 0.0010], {
      radius: isCritical ? 420 : 260,
      color: heatColor,
      fillColor: heatColor,
      fillOpacity: isCritical ? 0.38 : 0.20,
      weight: 2
    }).bindPopup(`
      <div style="font-family:sans-serif; font-size:12px;">
        <strong style="color:${heatColor};">🔴 DYNAMIC SUBSIDENCE TROUGH (Knothe Basin)</strong><br>
        <strong>Peak Displacement:</strong> ${telemetry.peakNode?.sensors?.displacement || 12.4} mm<br>
        <strong>48h Forward Forecast:</strong> 31.6 mm<br>
        <strong>AI Evidence Confidence:</strong> 94% (Bayesian Fusion)
      </div>
    `);
    this.riskHeatLayer.addLayer(heatCircle);

    // Central LoRa Mesh Gateway Marker ◆
    const gwIcon = L.divIcon({
      className: 'gis-gateway-marker',
      html: `<div style="background:#00f2fe; width:18px; height:18px; transform:rotate(45deg); border:2px solid #ffffff; box-shadow:0 0 12px #00f2fe; display:flex; align-items:center; justify-content:center;"><span style="font-size:8px; font-weight:900; color:#050811;">GW</span></div>`,
      iconSize: [18, 18],
      iconAnchor: [9, 9]
    });
    const gwMarker = L.marker([cLat, cLng], { icon: gwIcon })
      .bindPopup(`
        <div style="font-family:sans-serif; font-size:12px;">
          <strong style="color:#00f2fe; font-size:13px;">📡 Central LoRa Gateway #GW-01</strong><br>
          <strong>Frequency:</strong> 868.1 MHz ISM Band<br>
          <strong>Surface Coverage:</strong> 128 / 132 Nodes Connected<br>
          <strong>Packet Delivery Rate:</strong> 98.7% &bull; Solar Battery: 94%
        </div>
      `);
    this.nodeMarkersLayer.addLayer(gwMarker);

    // Plot Surface Nodes
    const displayNodes = (nodes && nodes.length > 0) ? nodes : [
      { id: 'MSN-001', zone: 'A17', lat: cLat + 0.001, lng: cLng - 0.002, status: 'ONLINE', sensors: { displacement: 12.4, tilt: 4.8, vibration: 6.2 }, battery: 92, rssi: -71 },
      { id: 'MSN-024', zone: 'A17', lat: cLat + 0.002, lng: cLng + 0.001, status: 'ONLINE', sensors: { displacement: 11.8, tilt: 4.2, vibration: 5.8 }, battery: 88, rssi: -68 },
      { id: 'MSN-055', zone: 'A12', lat: cLat - 0.004, lng: cLng + 0.009, status: 'ONLINE', sensors: { displacement: 3.2, tilt: 1.1, vibration: 1.4 }, battery: 95, rssi: -74 }
    ];

    displayNodes.forEach(node => {
      let color = '#10b981';
      if (node.status === 'WARNING') color = '#f59e0b';
      if (node.status === 'OFFLINE') color = '#ef4444';
      if (node.sensors && node.sensors.displacement > 4.2) color = '#ef4444';

      const icon = L.divIcon({
        className: 'gis-sensor-marker',
        html: `<div style="background:${color}; width:12px; height:12px; border-radius:50%; border:2px solid #ffffff; box-shadow:0 0 8px ${color};"></div>`,
        iconSize: [12, 12],
        iconAnchor: [6, 6]
      });

      const marker = L.marker([node.lat, node.lng], { icon: icon });
      marker.on('click', () => {
        if (this.onNodeSelect) this.onNodeSelect(node.id);
      });

      marker.bindPopup(`
        <div style="font-family:sans-serif; font-size:12px;">
          <strong style="color:#00f2fe; font-size:13px;">📡 ${node.id} (Panel ${node.zone})</strong><br>
          <strong>Displacement:</strong> <span style="color:${node.sensors?.displacement > 4.2 ? '#ef4444' : '#10b981'}; font-weight:700;">${node.sensors?.displacement || 0} mm</span><br>
          <strong>Tilt:</strong> ${node.sensors?.tilt || 0}° | <strong>Vib:</strong> ${node.sensors?.vibration || 0} mm/s<br>
          <strong>Battery:</strong> ${node.battery || 90}% | <strong>RSSI:</strong> ${node.rssi || -70} dBm
        </div>
      `);

      this.nodeMarkersLayer.addLayer(marker);
    });
  }

  toggleLayer(layerKey, isVisible) {
    if (!this.map) return;
    const map = this.map;
    const layerMap = {
      panels: this.panelsLayer,
      buffer: this.bufferLayer,
      heatmap: this.riskHeatLayer,
      infra: this.infraLayer,
      settlements: this.settlementsLayer,
      sensors: this.nodeMarkersLayer
    };

    const targetLayer = layerMap[layerKey];
    if (targetLayer) {
      if (isVisible && !map.hasLayer(targetLayer)) map.addLayer(targetLayer);
      else if (!isVisible && map.hasLayer(targetLayer)) map.removeLayer(targetLayer);
    }
  }

  centerOnActivePanel() {
    if (!this.map) return;
    const f = this.coalfields[this.currentCoalfield];
    this.map.setView([f.lat + 0.0015, f.lng + 0.0010], 16);
  }

  resize() {
    if (this.map) {
      setTimeout(() => this.map.invalidateSize(), 60);
    }
  }
}
