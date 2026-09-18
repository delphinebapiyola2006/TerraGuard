/**
 * MINESONIC: Real-Time Surface Subsidence Monitoring System & Digital Twin
 * High-Fidelity Physical Prototype Diorama Model Viewer
 * 
 * Features:
 * 1. Exact replica of the SIH Exhibition Physical Prototype Model with Wooden Base & Engraved Plaque
 * 2. 5 Hardware Sensors with White Top Placards & Leader Lines:
 *    - Vibration Sensor (Ground Movement)
 *    - GPS / GNSS (Vertical Displacement)
 *    - Central Monitoring Node (Solar Powered + IoT)
 *    - Tilt Sensor (Inclination)
 *    - Weather Sensor (Rainfall, Temperature)
 * 3. 3 Geological Strata Layers (Soil, Rock, Coal Seam with Mining Void & Continuous Miner on RIGHT SIDE)
 * 4. Surface Landscape (Moving Car, Moving Train, Village Houses, Trees, Farmland, Water Pond)
 * 5. 4-Colour Hazard Signal Light Tower (Green, Yellow, Orange, Red) with Interlock Vehicle Stop & Audio Buzzer
 * 6. Interactive Subsidence Trough with Parabolic Sinkage & Tension Cracks
 */

export class SubsidenceCanvasViewer {
  constructor(canvasId, onNodeSelect, onThreatChange) {
    this.canvas = document.getElementById(canvasId);
    this.onNodeSelect = onNodeSelect;
    this.onThreatChange = onThreatChange;
    this.ctx = null;
    this.nodes = [];
    this.sinkageDepth = 1.4; // meters (0.0 to 3.0)
    this.lastThreatTier = -1;
    this.animationId = null;
    this.hoveredNode = null;
    this.hoveredItem = null;
    this.timer = 0;
    this.showCalloutLabels = true;
    this.minerActive = true;
    this.audioEnabled = true;
    this.trafficManualOverride = null;
    this.interactiveBoxes = [];

    // Animation Positions
    this.carPos = 0.22;  // 0 to 1 along road
    this.trainPos = 0.55; // 0 to 1 along railway

    // Audio Buzzer Context
    this.audioCtx = null;
    this.lastBeepTime = 0;

    this.init();
  }

  init() {
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.resizeCanvas();
    window.addEventListener('resize', this.resizeCanvas.bind(this));

    this.canvas.addEventListener('pointermove', this.onPointerMove.bind(this));
    this.canvas.addEventListener('pointerdown', this.onPointerDown.bind(this));

    this.animate();
  }

  resizeCanvas() {
    if (!this.canvas) return;
    const parent = this.canvas.parentElement;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = parent ? parent.getBoundingClientRect() : this.canvas.getBoundingClientRect();
    const width = rect.width > 50 ? rect.width : (this.canvas.clientWidth || 880);
    const height = 560;

    this.canvas.width = width * dpr;
    this.canvas.height = height * dpr;
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;

    if (this.ctx) {
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
  }

  updateData(sinkageDepth, nodes) {
    this.sinkageDepth = sinkageDepth;
    this.nodes = nodes;
  }

  setSinkageDepth(meters) {
    this.sinkageDepth = Math.max(0, Math.min(3.0, meters));
  }

  setThreatTier(tier) {
    if (tier === 1) this.sinkageDepth = 0.4;
    else if (tier === 2) this.sinkageDepth = 1.1;
    else if (tier === 3) this.sinkageDepth = 1.8;
    else if (tier === 4) this.sinkageDepth = 2.7;
  }

  toggleLabels(visible) {
    this.showCalloutLabels = visible !== undefined ? visible : !this.showCalloutLabels;
  }

  toggleMiner(active) {
    this.minerActive = active !== undefined ? active : !this.minerActive;
  }

  toggleAudio(enabled) {
    this.audioEnabled = enabled !== undefined ? enabled : !this.audioEnabled;
  }

  toggleTraffic(moving) {
    this.trafficManualOverride = moving !== undefined ? moving : (this.trafficManualOverride === null ? false : null);
  }

  getSurfaceY(screenX, w, groundBaseY, maxSinkPx) {
    const centerX = w * 0.50;
    const dist = screenX - centerX;
    const sigma = w * 0.17;
    const sinkY = maxSinkPx * Math.exp(-0.5 * (dist / sigma) * (dist / sigma));
    return groundBaseY + sinkY;
  }

  getThreatLevel() {
    if (this.sinkageDepth < 0.8) {
      return { level: 'SAFE', color: '#10b981', hex: '#10b981', text: '🟢 SAFE STATUS', desc: 'Normal Strata Equilibrium • Traffic Moving', tier: 1 };
    } else if (this.sinkageDepth < 1.5) {
      return { level: 'WARNING', color: '#f59e0b', hex: '#f59e0b', text: '🟡 WARNING ADVISORY', desc: 'Elastic Flexure • Buzzer Active • Traffic Halted', tier: 2 };
    } else if (this.sinkageDepth < 2.2) {
      return { level: 'DANGER', color: '#f97316', hex: '#f97316', text: '🟠 DANGER ZONE', desc: 'Active Tension Cracks • Siren Active • Traffic Halted', tier: 3 };
    } else {
      return { level: 'CRITICAL', color: '#ef4444', hex: '#ef4444', text: '🔴 CRITICAL DANGER', desc: 'Dynamic Basin Collapse • EVACUATE NOW', tier: 4 };
    }
  }

  handleBuzzerAudio(threat) {
    if (!this.audioEnabled || threat.tier === 1) return;

    const now = performance.now();
    const interval = threat.tier === 2 ? 1400 : (threat.tier === 3 ? 800 : 450);

    if (now - this.lastBeepTime > interval) {
      this.lastBeepTime = now;
      try {
        if (!this.audioCtx) {
          this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.audioCtx.state === 'suspended') {
          this.audioCtx.resume();
        }

        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        if (threat.tier === 2) {
          osc.type = 'sine';
          osc.frequency.setValueAtTime(650, this.audioCtx.currentTime);
          gain.gain.setValueAtTime(0.04, this.audioCtx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.18);
        } else if (threat.tier === 3) {
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(750, this.audioCtx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(500, this.audioCtx.currentTime + 0.25);
          gain.gain.setValueAtTime(0.06, this.audioCtx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.25);
        } else {
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(950, this.audioCtx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(400, this.audioCtx.currentTime + 0.3);
          gain.gain.setValueAtTime(0.08, this.audioCtx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.3);
        }

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start();
        osc.stop(this.audioCtx.currentTime + (threat.tier === 2 ? 0.18 : (threat.tier === 3 ? 0.25 : 0.3)));
      } catch (e) {}
    }
  }

  animate() {
    this.animationId = requestAnimationFrame(this.animate.bind(this));
    if (!this.ctx) return;
    const ctx = this.ctx;

    const parent = this.canvas.parentElement;
    const w = (parent && parent.clientWidth > 50) ? parent.clientWidth : (this.canvas.clientWidth || 880);
    const h = 560;

    this.timer += 0.03;
    this.interactiveBoxes = [];

    const threat = this.getThreatLevel();

    if (threat.tier !== this.lastThreatTier) {
      this.lastThreatTier = threat.tier;
      if (typeof this.onThreatChange === 'function') {
        this.onThreatChange(threat);
      }
    }

    const isTrafficMoving = this.trafficManualOverride !== null ? this.trafficManualOverride : (threat.tier === 1);
    if (isTrafficMoving) {
      this.carPos = (this.carPos + 0.0035) % 1.0;
      this.trainPos = (this.trainPos + 0.0022) % 1.0;
    }

    this.handleBuzzerAudio(threat);

    ctx.clearRect(0, 0, w, h);

    // 1. Premium Exhibition Studio Backdrop with Spotlighting
    const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
    bgGrad.addColorStop(0, '#0a0f1d');
    bgGrad.addColorStop(0.4, '#101a2e');
    bgGrad.addColorStop(1, '#060a14');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Overhead Exhibition Gallery Spotlight
    const spot = ctx.createRadialGradient(w * 0.5, 70, 40, w * 0.5, h * 0.55, w * 0.75);
    spot.addColorStop(0, 'rgba(56, 189, 248, 0.14)');
    spot.addColorStop(0.5, 'rgba(30, 58, 138, 0.06)');
    spot.addColorStop(1, 'transparent');
    ctx.fillStyle = spot;
    ctx.fillRect(0, 0, w, h);

    // Diorama Box Dimensions
    const boxMarginX = Math.max(28, w * 0.035);
    const boxW = w - (boxMarginX * 2);
    const boxX = boxMarginX;

    const topSkyH = h * 0.36;
    const groundBaseY = topSkyH;
    const boxBottomY = h - 14;
    const strataH = boxBottomY - groundBaseY;

    const maxSinkPx = (this.sinkageDepth / 3.0) * (strataH * 0.30);

    // Subtle drop shadow for cutaway box
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
    ctx.shadowBlur = 20;
    ctx.shadowOffsetY = 10;
    ctx.fillStyle = '#050811';
    ctx.fillRect(boxX - 2, groundBaseY, boxW + 4, strataH);
    ctx.restore();

    // 2. Surface Scenery & Infrastructure
    this.drawAgricultureFarmland(ctx, boxX + 6, boxW * 0.22, groundBaseY, maxSinkPx, w);
    this.drawRailwayAndTrain(ctx, boxX, boxW, groundBaseY, maxSinkPx, w, isTrafficMoving, threat);
    this.drawRoadwayAndCar(ctx, boxX, boxW, groundBaseY, maxSinkPx, w, isTrafficMoving, threat);
    this.drawVillageSettlements(ctx, boxX, boxW, groundBaseY, maxSinkPx, w);
    this.drawWaterPond(ctx, boxX + boxW * 0.84, groundBaseY, maxSinkPx, w);

    // 3. Strata Cross-Section & Underground Mining Void (Right Side)
    this.drawStrataCutaway(ctx, boxX, boxW, groundBaseY, strataH, boxBottomY, maxSinkPx, w);

    // 4. Surface Subsidence Trough Ring
    this.drawSubsidenceTrough(ctx, boxX, boxW, groundBaseY, maxSinkPx, w);

    // 5. Hardware Sensor Masts
    this.drawSensorPoles(ctx, boxX, boxW, groundBaseY, maxSinkPx, w);

    // 6. 4-Colour Hazard Signal Tower
    this.drawHazardSignalTower(ctx, boxX + boxW * 0.035, groundBaseY, maxSinkPx, w, threat);
  }

  // --- 1. Agriculture Farmland ---
  drawAgricultureFarmland(ctx, x, width, groundBaseY, maxSinkPx, w) {
    ctx.save();
    const yOffset = -22;
    const startY = this.getSurfaceY(x, w, groundBaseY, maxSinkPx) + yOffset;

    const farmGrad = ctx.createLinearGradient(x, startY, x + width, startY + 22);
    farmGrad.addColorStop(0, '#78350f');
    farmGrad.addColorStop(0.5, '#92400e');
    farmGrad.addColorStop(1, '#3f6212');
    ctx.fillStyle = farmGrad;
    ctx.fillRect(x, startY - 14, width, 24);

    // Furrows
    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 1.5;
    for (let r = 0; r < 4; r++) {
      ctx.beginPath();
      ctx.moveTo(x + 4, startY - 10 + (r * 4.5));
      ctx.lineTo(x + width - 4, startY - 10 + (r * 4.5));
      ctx.stroke();
    }

    // Wheat
    ctx.fillStyle = '#fde047';
    for (let fx = x + 8; fx < x + width - 8; fx += 8) {
      ctx.fillRect(fx, startY - 16, 2, 5);
      ctx.fillRect(fx + 3, startY - 14, 2, 4);
    }

    // Fence
    ctx.strokeStyle = '#713f12';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x, startY - 14);
    ctx.lineTo(x + width, startY - 14);
    ctx.stroke();
    for (let px = x; px <= x + width; px += 18) {
      ctx.strokeRect(px - 1, startY - 18, 2, 6);
    }

    ctx.restore();
  }

  // --- 2. Railway Track & Animated Train ---
  drawRailwayAndTrain(ctx, boxX, boxW, groundBaseY, maxSinkPx, w, isTrafficMoving, threat) {
    ctx.save();
    const trackYOffset = -20;

    // Gravel Ballast
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 9;
    ctx.beginPath();
    for (let x = boxX; x <= boxX + boxW; x += 10) {
      const y = this.getSurfaceY(x, w, groundBaseY, maxSinkPx) + trackYOffset;
      if (x === boxX) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Wooden Ties
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2.5;
    for (let x = boxX + 6; x <= boxX + boxW - 6; x += 12) {
      const y = this.getSurfaceY(x, w, groundBaseY, maxSinkPx) + trackYOffset;
      ctx.beginPath();
      ctx.moveTo(x, y - 5);
      ctx.lineTo(x, y + 5);
      ctx.stroke();
    }

    // Steel Rails
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.5;
    [-3, 3].forEach(offset => {
      ctx.beginPath();
      for (let x = boxX; x <= boxX + boxW; x += 10) {
        const y = this.getSurfaceY(x, w, groundBaseY, maxSinkPx) + trackYOffset + offset;
        if (x === boxX) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    });

    const trainX = boxX + (this.trainPos * (boxW + 120)) - 60;
    const trainY = this.getSurfaceY(Math.max(boxX, Math.min(boxX + boxW, trainX)), w, groundBaseY, maxSinkPx) + trackYOffset;

    this.drawTrain(ctx, trainX, trainY, isTrafficMoving, threat);
    ctx.restore();
  }

  drawTrain(ctx, x, y, isMoving, threat) {
    ctx.save();
    const engineW = 34;
    const engineH = 14;

    ctx.fillStyle = '#0284c7';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1;
    ctx.fillRect(x, y - engineH, engineW, engineH);
    ctx.strokeRect(x, y - engineH, engineW, engineH);

    // Stripe
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(x + engineW - 8, y - engineH, 8, engineH);

    // Windshield
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(x + engineW - 7, y - engineH + 2, 5, 5);

    // Roof
    ctx.fillStyle = '#475569';
    ctx.fillRect(x + 6, y - engineH - 4, 16, 4);

    if (isMoving) {
      ctx.fillStyle = 'rgba(254, 240, 138, 0.45)';
      ctx.beginPath();
      ctx.moveTo(x + engineW, y - engineH / 2);
      ctx.lineTo(x + engineW + 35, y - engineH / 2 - 8);
      ctx.lineTo(x + engineW + 35, y - engineH / 2 + 12);
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.fillStyle = threat.hex;
      ctx.font = '700 8.5px Space Grotesk, sans-serif';
      ctx.fillText('🛑 TRAIN HALTED', x - 6, y - engineH - 8);
    }

    // Wheels
    ctx.fillStyle = '#1e293b';
    for (let wx = x + 4; wx < x + engineW; wx += 8) {
      ctx.beginPath();
      ctx.arc(wx, y, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Wagons
    [26, 52].forEach(dist => {
      const wx = x - dist;
      ctx.fillStyle = '#78350f';
      ctx.fillRect(wx, y - 11, 22, 11);
      ctx.strokeRect(wx, y - 11, 22, 11);
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(wx + 11, y - 11, 8, Math.PI, 0);
      ctx.fill();
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(wx + 5, y, 2.2, 0, Math.PI * 2);
      ctx.arc(wx + 17, y, 2.2, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.restore();
  }

  // --- 3. Roadway & Animated Car ---
  drawRoadwayAndCar(ctx, boxX, boxW, groundBaseY, maxSinkPx, w, isTrafficMoving, threat) {
    const roadYOffset = -6;
    ctx.save();
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.moveTo(boxX, this.getSurfaceY(boxX, w, groundBaseY, maxSinkPx) + roadYOffset - 7);
    for (let x = boxX; x <= boxX + boxW; x += 15) {
      ctx.lineTo(x, this.getSurfaceY(x, w, groundBaseY, maxSinkPx) + roadYOffset - 7);
    }
    for (let x = boxX + boxW; x >= boxX; x -= 15) {
      ctx.lineTo(x, this.getSurfaceY(x, w, groundBaseY, maxSinkPx) + roadYOffset + 7);
    }
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // White dashed road lines
    ctx.strokeStyle = '#f8fafc';
    ctx.lineWidth = 1.8;
    ctx.setLineDash([8, 6]);
    ctx.beginPath();
    for (let x = boxX + 10; x <= boxX + boxW - 10; x += 15) {
      const y = this.getSurfaceY(x, w, groundBaseY, maxSinkPx) + roadYOffset;
      if (x === boxX + 10) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    const carX = boxX + (this.carPos * (boxW + 80)) - 40;
    const clampedX = Math.max(boxX, Math.min(boxX + boxW, carX));
    const carY = this.getSurfaceY(clampedX, w, groundBaseY, maxSinkPx) + roadYOffset;

    this.drawCar(ctx, carX, carY, isTrafficMoving, threat);
    ctx.restore();
  }

  drawCar(ctx, x, y, isMoving, threat) {
    ctx.save();
    const carW = 26;
    const carH = 10;

    ctx.fillStyle = '#ef4444';
    ctx.strokeStyle = '#991b1b';
    ctx.lineWidth = 1;
    ctx.fillRect(x, y - carH, carW, carH);
    ctx.strokeRect(x, y - carH, carW, carH);

    ctx.fillStyle = '#dc2626';
    ctx.fillRect(x + 5, y - carH - 6, 14, 6);
    ctx.strokeRect(x + 5, y - carH - 6, 14, 6);

    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(x + 7, y - carH - 5, 4, 4);
    ctx.fillRect(x + 13, y - carH - 5, 4, 4);

    if (isMoving) {
      ctx.fillStyle = 'rgba(254, 240, 138, 0.4)';
      ctx.beginPath();
      ctx.moveTo(x + carW, y - carH / 2);
      ctx.lineTo(x + carW + 28, y - carH / 2 - 6);
      ctx.lineTo(x + carW + 28, y - carH / 2 + 10);
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.fillStyle = 'rgba(239, 68, 68, 0.9)';
      ctx.beginPath();
      ctx.arc(x, y - carH / 2, 3.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = threat.hex;
      ctx.font = '700 8px Space Grotesk, sans-serif';
      ctx.fillText('🛑 CAR STOPPED', x - 8, y - carH - 9);
    }

    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(x + 5, y, 2.8, 0, Math.PI * 2);
    ctx.arc(x + carW - 5, y, 2.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // --- 4. Village Houses & Trees ---
  drawVillageSettlements(ctx, boxX, boxW, groundBaseY, maxSinkPx, w) {
    const houses = [
      { relX: 0.17, scale: 0.95, color: '#fef2f2', roof: '#dc2626' },
      { relX: 0.23, scale: 0.82, color: '#fefce8', roof: '#b91c1c' },
      { relX: 0.68, scale: 0.88, color: '#fefce8', roof: '#b91c1c' },
      { relX: 0.77, scale: 1.05, color: '#fff7ed', roof: '#ea580c' }
    ];

    houses.forEach(h => {
      const x = boxX + boxW * h.relX;
      const y = this.getSurfaceY(x, w, groundBaseY, maxSinkPx) + 2;
      this.drawModelHouse(ctx, x, y, h.scale, h.color, h.roof);
    });

    const treePositions = [0.11, 0.28, 0.35, 0.44, 0.54, 0.83, 0.92];
    treePositions.forEach((relX, i) => {
      const x = boxX + boxW * relX;
      const y = this.getSurfaceY(x, w, groundBaseY, maxSinkPx);
      const radius = 10 + (i % 3) * 3;
      this.drawModelTree(ctx, x, y, radius, i % 2 === 0 ? '#15803d' : '#166534');
    });
  }

  drawModelHouse(ctx, x, y, s, wallColor, roofColor) {
    ctx.save();
    const w = 28 * s;
    const h = 20 * s;
    const roofH = 14 * s;

    ctx.fillStyle = wallColor;
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1;
    ctx.fillRect(x - w / 2, y - h, w, h);
    ctx.strokeRect(x - w / 2, y - h, w, h);

    // Windows
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(x - w * 0.35, y - h * 0.7, 6 * s, 6 * s);
    ctx.fillRect(x + w * 0.15, y - h * 0.7, 6 * s, 6 * s);

    // Door
    ctx.fillStyle = '#78350f';
    ctx.fillRect(x - 3 * s, y - h * 0.5, 6 * s, h * 0.5);

    // Roof
    ctx.fillStyle = roofColor;
    ctx.beginPath();
    ctx.moveTo(x - w / 2 - 3, y - h);
    ctx.lineTo(x, y - h - roofH);
    ctx.lineTo(x + w / 2 + 3, y - h);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  drawModelTree(ctx, x, y, r, color) {
    ctx.save();
    ctx.fillStyle = '#543d2b';
    ctx.fillRect(x - 2, y - r * 1.3, 4, r * 1.3);

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y - r * 1.3, r, 0, Math.PI * 2);
    ctx.arc(x - r * 0.5, y - r * 1.1, r * 0.7, 0, Math.PI * 2);
    ctx.arc(x + r * 0.5, y - r * 1.1, r * 0.7, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // --- 5. Water Pond ---
  drawWaterPond(ctx, x, groundBaseY, maxSinkPx, w) {
    const y = this.getSurfaceY(x, w, groundBaseY, maxSinkPx) + 4;
    ctx.save();
    const grad = ctx.createLinearGradient(x - 25, y, x + 25, y + 10);
    grad.addColorStop(0, '#0284c7');
    grad.addColorStop(1, '#0369a1');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(x, y, 26, 9, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.ellipse(x - 6, y - 2, 12, 3, -0.2, 0, Math.PI);
    ctx.stroke();
    ctx.restore();
  }

  // --- 6. Strata Layers & Underground Mining Void ---
  drawStrataCutaway(ctx, boxX, boxW, groundBaseY, strataH, boxBottomY, maxSinkPx, w) {
    ctx.save();

    const soilRatio = 0.28;
    const rockRatio = 0.38;
    const coalRatio = 0.34;

    const soilH = strataH * soilRatio;
    const rockH = strataH * rockRatio;
    const coalH = strataH * coalRatio;

    // ----------------------------------------------------
    // LAYER 1: SOIL LAYER (Textured Brown Earth)
    // ----------------------------------------------------
    const soilGrad = ctx.createLinearGradient(boxX, groundBaseY, boxX, groundBaseY + soilH);
    soilGrad.addColorStop(0, '#854d0e');
    soilGrad.addColorStop(0.5, '#6e472e');
    soilGrad.addColorStop(1, '#57371f');
    ctx.fillStyle = soilGrad;

    ctx.beginPath();
    ctx.moveTo(boxX, boxBottomY);
    ctx.lineTo(boxX, this.getSurfaceY(boxX, w, groundBaseY, maxSinkPx));
    for (let x = boxX; x <= boxX + boxW; x += 8) {
      ctx.lineTo(x, this.getSurfaceY(x, w, groundBaseY, maxSinkPx));
    }
    ctx.lineTo(boxX + boxW, boxBottomY);
    ctx.closePath();
    ctx.fill();

    // Earth grains
    ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
    for (let i = 0; i < 70; i++) {
      const rx = boxX + (Math.sin(i * 99) * 0.5 + 0.5) * boxW;
      const ry = groundBaseY + (Math.cos(i * 77) * 0.5 + 0.5) * (soilH * 0.8);
      ctx.fillRect(rx, ry, 2.5, 2);
    }

    // Top Green Grass Rim
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 4;
    ctx.beginPath();
    for (let x = boxX; x <= boxX + boxW; x += 8) {
      const y = this.getSurfaceY(x, w, groundBaseY, maxSinkPx);
      if (x === boxX) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // ----------------------------------------------------
    // LAYER 2: ROCK LAYER (Textured Grey Overburden)
    // ----------------------------------------------------
    const rockTopBaseY = groundBaseY + soilH;
    const rockGrad = ctx.createLinearGradient(boxX, rockTopBaseY, boxX, rockTopBaseY + rockH);
    rockGrad.addColorStop(0, '#94a3b8');
    rockGrad.addColorStop(0.5, '#64748b');
    rockGrad.addColorStop(1, '#475569');
    ctx.fillStyle = rockGrad;

    ctx.beginPath();
    ctx.moveTo(boxX, boxBottomY);
    for (let x = boxX; x <= boxX + boxW; x += 8) {
      const sink = (this.getSurfaceY(x, w, groundBaseY, maxSinkPx) - groundBaseY) * 0.75;
      ctx.lineTo(x, rockTopBaseY + sink);
    }
    ctx.lineTo(boxX + boxW, boxBottomY);
    ctx.closePath();
    ctx.fill();

    // Rock fractures
    ctx.strokeStyle = 'rgba(15, 23, 42, 0.4)';
    ctx.lineWidth = 1.5;
    for (let j = 0; j < 3; j++) {
      ctx.beginPath();
      const lineBaseY = rockTopBaseY + (j + 1) * (rockH / 3.5);
      for (let x = boxX; x <= boxX + boxW; x += 16) {
        const sink = (this.getSurfaceY(x, w, groundBaseY, maxSinkPx) - groundBaseY) * 0.65;
        const jitter = Math.sin(x * 0.1 + j) * 2;
        if (x === boxX) ctx.moveTo(x, lineBaseY + sink + jitter);
        else ctx.lineTo(x, lineBaseY + sink + jitter);
      }
      ctx.stroke();
    }

    // ----------------------------------------------------
    // LAYER 3: COAL SEAM (Jet Black Glossy Layer) - Sinks with Strata
    // ----------------------------------------------------
    const coalTopBaseY = rockTopBaseY + rockH;
    ctx.fillStyle = '#090d16';
    ctx.beginPath();
    ctx.moveTo(boxX, boxBottomY);
    for (let x = boxX; x <= boxX + boxW; x += 8) {
      const sink = (this.getSurfaceY(x, w, groundBaseY, maxSinkPx) - groundBaseY) * 0.68;
      ctx.lineTo(x, coalTopBaseY + sink);
    }
    ctx.lineTo(boxX + boxW, boxBottomY);
    ctx.closePath();
    ctx.fill();

    // Coal seam natural fissures / layers
    ctx.strokeStyle = 'rgba(30, 41, 59, 0.6)';
    ctx.lineWidth = 1.2;
    for (let c = 0; c < 2; c++) {
      ctx.beginPath();
      const lineBaseY = coalTopBaseY + (c + 1) * (coalH / 2.8);
      for (let x = boxX; x <= boxX + boxW; x += 16) {
        const sink = (this.getSurfaceY(x, w, groundBaseY, maxSinkPx) - groundBaseY) * 0.55;
        const jitter = Math.sin(x * 0.15 + c) * 1.5;
        if (x === boxX) ctx.moveTo(x, lineBaseY + sink + jitter);
        else ctx.lineTo(x, lineBaseY + sink + jitter);
      }
      ctx.stroke();
    }

    // ----------------------------------------------------
    // UNDERGROUND MINING GALLERY VOID (Positioned on RIGHT SIDE)
    // Sinks and converges realistically under overburden pressure
    // ----------------------------------------------------
    const galleryW = boxW * 0.48;
    const galleryX = boxX + boxW * 0.48;
    const galleryBottom = boxBottomY - 4;
    const getGalleryRoofY = (x) => {
      const sink = (this.getSurfaceY(x, w, groundBaseY, maxSinkPx) - groundBaseY) * 0.68;
      return coalTopBaseY + 6 + sink;
    };

    // Dynamic excavated void polygon with sagging roof
    ctx.beginPath();
    ctx.moveTo(galleryX, galleryBottom);
    ctx.lineTo(galleryX, getGalleryRoofY(galleryX));
    for (let x = galleryX; x <= galleryX + galleryW; x += 6) {
      ctx.lineTo(x, getGalleryRoofY(x));
    }
    ctx.lineTo(galleryX + galleryW, galleryBottom);
    ctx.closePath();
    ctx.fillStyle = '#020408';
    ctx.fill();
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Fallen Coal Rubble on Floor
    ctx.fillStyle = '#1e293b';
    for (let x = galleryX + 8; x < galleryX + galleryW - 8; x += 10) {
      ctx.beginPath();
      ctx.arc(x, galleryBottom - 2, 3 + (x % 4), 0, Math.PI * 2);
      ctx.fill();
    }

    // Dynamic Compressing Hydraulic Roof Chocks / Props
    const pillarPositions = [
      galleryX + galleryW * 0.12,
      galleryX + galleryW * 0.32,
      galleryX + galleryW * 0.52
    ];

    pillarPositions.forEach(px => {
      const propTopY = getGalleryRoofY(px);
      const propH = Math.max(8, galleryBottom - propTopY);

      // Steel Cylinder Shaft
      ctx.fillStyle = '#cbd5e1';
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1;
      ctx.fillRect(px - 3.5, propTopY, 7, propH);
      ctx.strokeRect(px - 3.5, propTopY, 7, propH);

      // Hydraulic Top Shoe & Base Plate
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(px - 7, propTopY, 14, 4);
      ctx.fillRect(px - 7, galleryBottom - 4, 14, 4);

      // Pressure Gauge
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(px + 6, propTopY + propH * 0.4, 2, 0, Math.PI * 2);
      ctx.fill();
    });

    // Continuous Miner Machine (Cutting Coal Face on the Right)
    this.drawContinuousMiner(ctx, galleryX + galleryW * 0.70, galleryBottom - 24, 1.0);

    // Left-Side Physical Strata Badges
    const badgeSinkSoil = (this.getSurfaceY(boxX + 16, w, groundBaseY, maxSinkPx) - groundBaseY) * 0.9;
    const badgeSinkRock = (this.getSurfaceY(boxX + 16, w, groundBaseY, maxSinkPx) - groundBaseY) * 0.75;
    const badgeSinkCoal = (this.getSurfaceY(boxX + 16, w, groundBaseY, maxSinkPx) - groundBaseY) * 0.68;

    this.drawStrataBadge(ctx, boxX + 16, groundBaseY + soilH * 0.45 + badgeSinkSoil, 'Soil Layer', 105);
    this.drawStrataBadge(ctx, boxX + 16, rockTopBaseY + rockH * 0.45 + badgeSinkRock, 'Rock Strata', 110);
    this.drawStrataBadge(ctx, boxX + 16, coalTopBaseY + coalH * 0.45 + badgeSinkCoal, 'Deep Strata\n(Subsidence Zone)', 140, true);

    ctx.restore();
  }

  drawContinuousMiner(ctx, x, y, scale) {
    ctx.save();
    const yellow = '#eab308';
    const darkMetal = '#1f2937';

    // Tracks
    ctx.fillStyle = darkMetal;
    ctx.fillRect(x - 20, y + 16, 40, 8);
    ctx.fillStyle = '#64748b';
    for (let bx = x - 16; bx <= x + 16; bx += 8) {
      ctx.beginPath();
      ctx.arc(bx, y + 20, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Body
    ctx.fillStyle = yellow;
    ctx.strokeStyle = '#713f12';
    ctx.lineWidth = 1.2;
    ctx.fillRect(x - 22, y + 4, 38, 14);
    ctx.strokeRect(x - 22, y + 4, 38, 14);

    // Cab
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(x - 18, y + 7, 8, 8);

    // Headlight
    ctx.fillStyle = 'rgba(253, 224, 71, 0.4)';
    ctx.beginPath();
    ctx.moveTo(x + 16, y + 8);
    ctx.lineTo(x + 46, y - 4);
    ctx.lineTo(x + 46, y + 20);
    ctx.closePath();
    ctx.fill();

    // Cutter Drum
    const boomAngle = Math.sin(this.timer * 2) * 0.15;
    ctx.fillStyle = yellow;
    ctx.fillRect(x + 14, y + 6 + boomAngle * 10, 16, 8);

    const drumX = x + 30;
    const drumY = y + 10 + boomAngle * 10;
    ctx.fillStyle = '#d97706';
    ctx.beginPath();
    ctx.arc(drumX, drumY, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#451a03';
    ctx.stroke();

    if (this.minerActive) {
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 2;
      for (let a = 0; a < 4; a++) {
        const ang = this.timer * 6 + a * (Math.PI / 2);
        ctx.beginPath();
        ctx.moveTo(drumX, drumY);
        ctx.lineTo(drumX + Math.cos(ang) * 11, drumY + Math.sin(ang) * 11);
        ctx.stroke();
      }

      ctx.fillStyle = '#f59e0b';
      for (let s = 0; s < 4; s++) {
        const sparkX = drumX + 6 + Math.sin(this.timer * 8 + s) * 8;
        const sparkY = drumY + Math.cos(this.timer * 8 + s) * 8;
        ctx.fillRect(sparkX, sparkY, 2, 2);
      }
    }

    // Rear Conveyor
    ctx.fillStyle = darkMetal;
    ctx.fillRect(x - 42, y + 10, 22, 5);
    ctx.strokeStyle = '#475569';
    ctx.strokeRect(x - 42, y + 10, 22, 5);

    ctx.restore();
  }

  drawStrataBadge(ctx, x, y, text, w, isMultiLine = false) {
    ctx.save();
    const h = isMultiLine ? 34 : 22;
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    ctx.shadowBlur = 6;
    ctx.fillRect(x, y - h / 2, w, h);
    ctx.strokeRect(x, y - h / 2, w, h);
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#0f172a';
    ctx.font = '700 11px Space Grotesk, sans-serif';
    ctx.textAlign = 'center';

    if (isMultiLine) {
      const lines = text.split('\n');
      ctx.fillText(lines[0], x + w / 2, y - 3);
      ctx.font = '600 9.5px Space Grotesk, sans-serif';
      ctx.fillText(lines[1], x + w / 2, y + 10);
    } else {
      ctx.fillText(text, x + w / 2, y + 4);
    }
    ctx.restore();
  }

  // --- 7. Subsidence Trough Ring ---
  drawSubsidenceTrough(ctx, boxX, boxW, groundBaseY, maxSinkPx, w) {
    const centerX = w * 0.50;
    const centerY = this.getSurfaceY(centerX, w, groundBaseY, maxSinkPx);

    ctx.save();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.8;
    ctx.setLineDash([6, 5]);
    ctx.beginPath();
    ctx.ellipse(centerX, centerY - 2, boxW * 0.16, 16 + maxSinkPx * 0.2, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Crack
    if (this.sinkageDepth > 0.1) {
      const crackWidth = Math.max(1.5, (this.sinkageDepth / 3.0) * 8);
      ctx.strokeStyle = '#1e1b4b';
      ctx.fillStyle = '#090d16';
      ctx.lineWidth = crackWidth;
      ctx.beginPath();
      ctx.moveTo(centerX - 35, centerY);
      ctx.lineTo(centerX - 12, centerY + 3);
      ctx.lineTo(centerX + 6, centerY - 1);
      ctx.stroke();
    }

    ctx.restore();
  }

  // --- 8. Hardware Sensor Poles ---
  drawSensorPoles(ctx, boxX, boxW, groundBaseY, maxSinkPx, w) {
    const poleConfigs = [
      { id: 'Node #1', name: 'Vibration Sensor', sub: '(Ground Movement)', relX: 0.09, height: 58, type: 'vibration' },
      { id: 'Node #2', name: 'GPS / GNSS', sub: '(Vertical Displacement)', relX: 0.28, height: 62, type: 'gps' },
      { id: 'Node #3', name: 'Central Monitoring Node', sub: '(Solar Powered + IoT)', relX: 0.50, height: 75, type: 'central' },
      { id: 'Node #4', name: 'Tilt Sensor', sub: '(Inclination)', relX: 0.72, height: 60, type: 'tilt' },
      { id: 'Node #5', name: 'Weather Sensor', sub: '(Rainfall, Temperature)', relX: 0.91, height: 66, type: 'weather' }
    ];

    poleConfigs.forEach((p) => {
      const x = boxX + boxW * p.relX;
      const groundY = this.getSurfaceY(x, w, groundBaseY, maxSinkPx);
      const isHover = this.hoveredNode && this.hoveredNode.id === p.id;
      const nodeData = this.nodes.find(n => n.id === p.id) || { id: p.id, name: p.name, online: true };

      this.interactiveBoxes.push({
        id: p.id,
        nodeData,
        x: x - 28,
        y: groundY - p.height - 30,
        w: 56,
        h: p.height + 34,
        type: p.type
      });

      this.renderPhysicalPole(ctx, x, groundY, p.height, p.type, isHover, nodeData);
    });
  }

  renderPhysicalPole(ctx, x, groundY, h, type, isHover, node) {
    ctx.save();
    const mastTopY = groundY - h;

    if (isHover) {
      ctx.fillStyle = 'rgba(0, 242, 254, 0.2)';
      ctx.beginPath();
      ctx.arc(x, mastTopY + 20, 36, 0, Math.PI * 2);
      ctx.fill();

      // Clean tooltip label on hover only
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.strokeStyle = '#00f2fe';
      ctx.lineWidth = 1;
      const textW = ctx.measureText(node.name || type).width + 16;
      ctx.fillRect(x - textW / 2, mastTopY - 24, textW, 20);
      ctx.strokeRect(x - textW / 2, mastTopY - 24, textW, 20);
      ctx.fillStyle = '#ffffff';
      ctx.font = '600 10px Space Grotesk, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(node.name || type, x, mastTopY - 10);
    }

    if (type === 'central') {
      // Dual Aluminum Columns
      ctx.fillStyle = '#94a3b8';
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1;
      ctx.fillRect(x - 6, mastTopY + 26, 4, h - 26);
      ctx.fillRect(x + 2, mastTopY + 26, 4, h - 26);

      // Large Solar Photovoltaic Panel
      const solarW = 72;
      const solarH = 24;
      ctx.fillStyle = '#1e1b4b';
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1.5;
      ctx.fillRect(x - solarW / 2, mastTopY - 16, solarW, solarH);
      ctx.strokeRect(x - solarW / 2, mastTopY - 16, solarW, solarH);

      // Solar grid lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.lineWidth = 0.8;
      for (let gx = x - solarW / 2 + 12; gx < x + solarW / 2; gx += 12) {
        ctx.beginPath();
        ctx.moveTo(gx, mastTopY - 16);
        ctx.lineTo(gx, mastTopY - 16 + solarH);
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.moveTo(x - solarW / 2, mastTopY - 4);
      ctx.lineTo(x + solarW / 2, mastTopY - 4);
      ctx.stroke();

      // Transparent IP67 Enclosure Box
      const boxW = 54;
      const boxH = 36;
      const boxY = mastTopY + 12;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.8;
      ctx.fillRect(x - boxW / 2, boxY, boxW, boxH);
      ctx.strokeRect(x - boxW / 2, boxY, boxW, boxH);

      // Green PCB Circuit
      ctx.fillStyle = '#065f46';
      ctx.fillRect(x - 22, boxY + 6, 44, 24);

      // Microcontroller Chip
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(x - 16, boxY + 10, 12, 12);
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(x + 2, boxY + 10, 16, 16);

      // Pulsing Blue IoT LED
      const ledGlow = (Math.sin(this.timer * 8) + 1) * 0.5;
      ctx.fillStyle = `rgba(0, 242, 254, ${0.4 + ledGlow * 0.6})`;
      ctx.beginPath();
      ctx.arc(x + 12, boxY + 18, 3 + ledGlow * 2, 0, Math.PI * 2);
      ctx.fill();

      // Antenna
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x + boxW / 2 + 2, boxY + 18);
      ctx.lineTo(x + boxW / 2 + 2, boxY - 20);
      ctx.stroke();

      // RF Wave Rings
      const waveR = (this.timer % 2) * 22;
      ctx.strokeStyle = `rgba(0, 242, 254, ${1 - (this.timer % 2) / 2})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(x + boxW / 2 + 2, boxY - 20, waveR, -Math.PI / 2, Math.PI / 2);
      ctx.stroke();

      ctx.restore();
      return;
    }

    // Standard Pole
    ctx.fillStyle = '#94a3b8';
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1;
    ctx.fillRect(x - 2.5, mastTopY + 10, 5, h - 10);
    ctx.strokeRect(x - 2.5, mastTopY + 10, 5, h - 10);

    // Solar Panel on Bracket
    const solW = 24;
    const solH = 14;
    ctx.fillStyle = '#1e1b4b';
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;
    ctx.save();
    ctx.translate(x + 8, mastTopY + 18);
    ctx.rotate(-0.35);
    ctx.fillRect(-solW / 2, -solH / 2, solW, solH);
    ctx.strokeRect(-solW / 2, -solH / 2, solW, solH);
    ctx.restore();

    // Electronics Enclosure
    ctx.fillStyle = '#e2e8f0';
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1.2;
    ctx.fillRect(x - 8, mastTopY + 28, 16, 20);
    ctx.strokeRect(x - 8, mastTopY + 28, 16, 20);

    // Sensor Heads
    if (type === 'vibration') {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(x - 6, mastTopY - 6, 12, 16);
      ctx.beginPath();
      ctx.arc(x, mastTopY - 6, 6, Math.PI, 0);
      ctx.fill();
    } else if (type === 'gps') {
      ctx.fillStyle = '#f8fafc';
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(x, mastTopY - 2, 10, Math.PI, 0);
      ctx.lineTo(x + 10, mastTopY + 3);
      ctx.lineTo(x - 10, mastTopY + 3);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (type === 'tilt') {
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1;
      ctx.fillRect(x - 7, mastTopY - 4, 14, 14);
      ctx.strokeRect(x - 7, mastTopY - 4, 14, 14);
    } else if (type === 'weather') {
      ctx.fillStyle = '#f8fafc';
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1;
      for (let l = 0; l < 4; l++) {
        ctx.fillRect(x - 8 + l, mastTopY - 8 + (l * 4), 16 - l * 2, 3);
        ctx.strokeRect(x - 8 + l, mastTopY - 8 + (l * 4), 16 - l * 2, 3);
      }
    }

    ctx.restore();
  }

  // --- 9. 4-Colour Hazard Signal Light Tower ---
  drawHazardSignalTower(ctx, x, groundBaseY, maxSinkPx, w, threat) {
    ctx.save();
    const y = this.getSurfaceY(x, w, groundBaseY, maxSinkPx);
    const towerH = 54;
    const topY = y - towerH;

    ctx.fillStyle = '#475569';
    ctx.fillRect(x - 2.5, topY, 5, towerH);

    const headW = 16;
    const headH = 44;
    const headY = topY - headH + 4;
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1.5;
    ctx.fillRect(x - headW / 2, headY, headW, headH);
    ctx.strokeRect(x - headW / 2, headY, headW, headH);

    const lamps = [
      { color: '#ef4444', active: threat.tier === 4, glow: 'rgba(239, 68, 68, 0.95)' },
      { color: '#f97316', active: threat.tier === 3, glow: 'rgba(249, 115, 22, 0.95)' },
      { color: '#f59e0b', active: threat.tier === 2, glow: 'rgba(245, 158, 11, 0.95)' },
      { color: '#10b981', active: threat.tier === 1, glow: 'rgba(16, 185, 129, 0.95)' }
    ];

    lamps.forEach((l, i) => {
      const lampY = headY + 5.5 + (i * 9.5);
      ctx.fillStyle = l.active ? l.color : '#1e293b';
      ctx.beginPath();
      ctx.arc(x, lampY, 3.4, 0, Math.PI * 2);
      ctx.fill();

      if (l.active) {
        const pulse = (Math.sin(this.timer * 6) + 1) * 0.5;
        ctx.fillStyle = l.glow;
        ctx.beginPath();
        ctx.arc(x, lampY, 5.5 + pulse * 3.5, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    ctx.restore();
  }


  onPointerMove(e) {
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    let found = null;
    for (const box of this.interactiveBoxes) {
      if (mouseX >= box.x && mouseX <= box.x + box.w && mouseY >= box.y && mouseY <= box.y + box.h) {
        found = box;
        break;
      }
    }

    this.hoveredNode = found ? found.nodeData : null;
    this.canvas.style.cursor = found ? 'pointer' : 'default';
  }

  onPointerDown(e) {
    if (this.hoveredNode && typeof this.onNodeSelect === 'function') {
      this.onNodeSelect(this.hoveredNode.id);
    }
  }
}
