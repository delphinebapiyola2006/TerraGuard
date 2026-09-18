/**
 * MINESONIC: Sensor Engineering & Hardware Calibration Utilities
 * Smart India Hackathon 2026 | Team Recursion Rebels
 */

/**
 * Converts RSSI (dBm) to Link Quality Percentage (0 - 100%)
 */
export function rssiToSignalQuality(rssi) {
  if (rssi >= -60) return 100;
  if (rssi <= -120) return 0;
  return Math.round(((rssi + 120) / 60) * 100);
}

/**
 * Converts Battery LiPo Voltage (3.0V - 4.2V) to Percentage
 */
export function voltageToBatteryPercent(voltage) {
  if (voltage >= 4.2) return 100;
  if (voltage <= 3.2) return 0;
  return Math.round(((voltage - 3.2) / 1.0) * 100);
}

/**
 * Formats sensor parameters with correct geotechnical units
 */
export function formatSensorValue(value, type) {
  switch (type.toLowerCase()) {
    case 'displacement': return `${Number(value).toFixed(1)} mm`;
    case 'tilt': return `${Number(value).toFixed(2)}°`;
    case 'vibration': return `${Number(value).toFixed(2)} mm/s`;
    case 'crack': return `${Number(value).toFixed(2)} mm`;
    case 'strain': return `${Math.round(value)} µε`;
    case 'temperature': return `${Number(value).toFixed(1)} °C`;
    case 'battery': return `${Math.round(value)}%`;
    case 'rssi': return `${Math.round(value)} dBm`;
    default: return `${value}`;
  }
}

/**
 * Calculates Euclidean distance between two spatial nodes in meters
 */
export function calculateSpatialDistance(nodeA, nodeB) {
  const dx = nodeA.x - nodeB.x;
  const dy = nodeA.y - nodeB.y;
  const dz = nodeA.z - nodeB.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/**
 * Finds all neighboring nodes within radius R meters
 */
export function findNearbyNodes(targetNode, allNodes, radiusMeters = 75) {
  return allNodes.filter(n => n.id !== targetNode.id && calculateSpatialDistance(targetNode, n) <= radiusMeters);
}
