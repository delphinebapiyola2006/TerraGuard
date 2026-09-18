/**
 * MineSonic: Geotechnical Telemetry & AI Prediction Charts
 * Uses Chart.js with high-contrast dark industrial styling
 */

import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

// Global Dark Theme Defaults for Chart.js
Chart.defaults.color = '#94a3b8';
Chart.defaults.borderColor = 'rgba(255, 255, 255, 0.08)';
Chart.defaults.font.family = "'Plus Jakarta Sans', sans-serif";

export class TelemetryCharts {
  constructor() {
    this.charts = {};
  }

  /**
   * Multi-Sensor AI Evidence Contribution Chart (Horizontal Bar)
   */
  initFusionEvidenceChart(canvasId) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;
    if (this.charts[canvasId]) this.charts[canvasId].destroy();

    this.charts[canvasId] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Displacement', 'Tilt / Angle', 'Tensile Strain', 'Vibration', 'Crack Opening'],
        datasets: [{
          label: 'AI Evidence Weight (%)',
          data: [31, 24, 22, 15, 8],
          backgroundColor: [
            'rgba(56, 189, 248, 0.85)',
            'rgba(245, 158, 11, 0.85)',
            'rgba(168, 85, 247, 0.85)',
            'rgba(239, 68, 68, 0.85)',
            'rgba(236, 72, 153, 0.85)'
          ],
          borderColor: [
            '#38bdf8',
            '#f59e0b',
            '#a855f7',
            '#ef4444',
            '#ec4899'
          ],
          borderWidth: 1.5,
          borderRadius: 6
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (item) => ` Contribution: ${item.raw}% to overall risk assessment`
            }
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(255, 255, 255, 0.06)' },
            max: 40,
            ticks: { callback: v => v + '%' }
          },
          y: {
            grid: { display: false },
            ticks: { color: '#e2e8f0', font: { weight: '600' } }
          }
        }
      }
    });

    return this.charts[canvasId];
  }

  /**
   * Historical Multi-Sensor Trend Chart with Baseline & Anomaly Points
   */
  initHistoricalChart(canvasId, sensorType = 'displacement', timeframe = '24h') {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;
    if (this.charts[canvasId]) this.charts[canvasId].destroy();

    const pointsCount = timeframe === '1h' ? 12 : (timeframe === '6h' ? 24 : 36);
    const labels = [];
    const actualData = [];
    const baselineData = [];
    const anomalyPoints = [];

    const baseVal = sensorType === 'tilt' ? 2.5 : (sensorType === 'vibration' ? 1.1 : (sensorType === 'crack' ? 0.5 : 4.2));
    const unit = sensorType === 'tilt' ? '°' : (sensorType === 'vibration' ? 'mm/s' : 'mm');

    for (let i = 0; i < pointsCount; i++) {
      labels.push(`-${pointsCount - i}h`);
      baselineData.push(baseVal);

      // S-curve exponential rise towards the end (subsidence progression)
      const progress = i / pointsCount;
      let val = baseVal + (progress > 0.6 ? Math.pow(progress - 0.6, 1.8) * 18 : Math.random() * 0.4 - 0.2);
      val = Number(val.toFixed(2));
      actualData.push(val);

      if (val > baseVal * 1.5) {
        anomalyPoints.push(val);
      } else {
        anomalyPoints.push(null);
      }
    }

    this.charts[canvasId] = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: `Actual Measured (${unit})`,
            data: actualData,
            borderColor: '#38bdf8',
            backgroundColor: 'rgba(56, 189, 248, 0.12)',
            fill: true,
            tension: 0.35,
            borderWidth: 2.5,
            pointRadius: 2,
            pointHoverRadius: 6
          },
          {
            label: `Safe Baseline (${unit})`,
            data: baselineData,
            borderColor: '#10b981',
            borderDash: [5, 5],
            borderWidth: 2,
            pointRadius: 0,
            fill: false
          },
          {
            label: 'AI Anomaly Detected',
            data: anomalyPoints,
            borderColor: '#ef4444',
            backgroundColor: '#ef4444',
            pointRadius: 5,
            pointHoverRadius: 8,
            showLine: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { position: 'top', labels: { boxWidth: 12 } },
          tooltip: {
            callbacks: {
              label: (item) => ` ${item.dataset.label}: ${item.raw} ${unit}`
            }
          }
        },
        scales: {
          x: { grid: { color: 'rgba(255, 255, 255, 0.05)' } },
          y: {
            grid: { color: 'rgba(255, 255, 255, 0.06)' },
            title: { display: true, text: `Measured Value (${unit})`, color: '#64748b' }
          }
        }
      }
    });

    return this.charts[canvasId];
  }

  /**
   * AI Subsidence Prediction Progression Chart (Observed vs 6h, 12h, 24h, 48h Forecast)
   */
  initPredictionChart(canvasId, currentVal = 12.4) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;
    if (this.charts[canvasId]) this.charts[canvasId].destroy();

    const labels = ['-12h', '-6h', 'NOW (T=0)', '+6h (AI Forecast)', '+12h (AI Forecast)', '+24h (AI Forecast)', '+48h (AI Forecast)'];
    
    // Observed historical curve
    const observedData = [4.1, 7.2, currentVal, null, null, null, null];
    
    // AI Predicted trajectory
    const predictedData = [null, null, currentVal, 17.8, 23.1, 31.6, 42.5];
    const upperConfidence = [null, null, currentVal, 19.9, 25.8, 35.2, 47.8];
    const lowerConfidence = [null, null, currentVal, 15.7, 20.4, 28.0, 37.2];

    this.charts[canvasId] = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Observed Sensor Data (mm)',
            data: observedData,
            borderColor: '#00f2fe',
            backgroundColor: 'rgba(0, 242, 254, 0.15)',
            fill: true,
            borderWidth: 3,
            pointRadius: 5,
            pointBackgroundColor: '#00f2fe'
          },
          {
            label: 'AI Subsidence Prediction (mm)',
            data: predictedData,
            borderColor: '#a855f7',
            borderDash: [6, 4],
            backgroundColor: 'rgba(168, 85, 247, 0.1)',
            fill: false,
            borderWidth: 3,
            pointRadius: 5,
            pointBackgroundColor: '#a855f7'
          },
          {
            label: 'Upper 95% Confidence Bound',
            data: upperConfidence,
            borderColor: 'rgba(168, 85, 247, 0.3)',
            borderDash: [3, 3],
            pointRadius: 0,
            fill: '+1',
            backgroundColor: 'rgba(168, 85, 247, 0.08)'
          },
          {
            label: 'Lower 95% Confidence Bound',
            data: lowerConfidence,
            borderColor: 'rgba(168, 85, 247, 0.3)',
            borderDash: [3, 3],
            pointRadius: 0,
            fill: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top', labels: { boxWidth: 12 } },
          tooltip: {
            callbacks: {
              label: (item) => ` ${item.dataset.label}: ${item.raw ? item.raw + ' mm' : 'N/A'}`
            }
          }
        },
        scales: {
          x: { grid: { color: 'rgba(255, 255, 255, 0.05)' } },
          y: {
            grid: { color: 'rgba(255, 255, 255, 0.06)' },
            title: { display: true, text: 'Ground Displacement (mm)', color: '#64748b' }
          }
        }
      }
    });

    return this.charts[canvasId];
  }

  /**
   * Risk Progression 4-Colour Radar Chart
   */
  initRiskRadarChart(canvasId, values = [87, 82, 78, 64, 45]) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;
    if (this.charts[canvasId]) this.charts[canvasId].destroy();

    this.charts[canvasId] = new Chart(ctx, {
      type: 'radar',
      data: {
        labels: ['Displacement', 'Tilt Angle', 'Strain', 'Micro-Vibration', 'Crack Aperture'],
        datasets: [{
          label: 'Current Severity Index (%)',
          data: values,
          backgroundColor: 'rgba(239, 68, 68, 0.25)',
          borderColor: '#ef4444',
          borderWidth: 2,
          pointBackgroundColor: '#ef4444',
          pointRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          r: {
            angleLines: { color: 'rgba(255, 255, 255, 0.1)' },
            grid: { color: 'rgba(255, 255, 255, 0.08)' },
            suggestedMin: 0,
            suggestedMax: 100,
            ticks: { backdropColor: 'transparent', color: '#64748b' }
          }
        }
      }
    });

    return this.charts[canvasId];
  }
}
