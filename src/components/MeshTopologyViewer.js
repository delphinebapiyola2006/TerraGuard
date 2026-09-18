/**
 * MineSonic: Wireless Surface Mesh Network Topology Visualizer
 * Real-Time multi-hop LoRa / Zigbee mesh infrastructure with dynamic packets & node inspector
 */

export class MeshTopologyViewer {
  constructor(canvasId, onNodeSelect) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.onNodeSelect = onNodeSelect;

    this.nodes = [];
    this.packets = [];
    this.hoveredNode = null;
    this.selectedNodeId = 'MSN-024';

    this.zoom = 1.0;
    this.panX = 0;
    this.panY = 0;
    this.isDragging = false;
    this.startX = 0;
    this.startY = 0;

    this.animationId = null;
    this.lastPacketSpawn = performance.now();

    this.init();
  }

  init() {
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());

    this.canvas.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.startX = e.clientX - this.panX;
      this.startY = e.clientY - this.panY;
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    this.canvas.addEventListener('mousemove', (e) => {
      if (this.isDragging) {
        this.panX = e.clientX - this.startX;
        this.panY = e.clientY - this.startY;
      } else {
        this.checkHover(e);
      }
    });

    this.canvas.addEventListener('click', (e) => {
      const clicked = this.getNodeAtMouse(e);
      if (clicked) {
        this.selectedNodeId = clicked.id;
        if (this.onNodeSelect) this.onNodeSelect(clicked.id);
      }
    });

    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
      this.zoom = Math.max(0.4, Math.min(2.5, this.zoom * zoomFactor));
    }, { passive: false });

    this.render = this.render.bind(this);
    this.render();
  }

  resizeCanvas() {
    if (!this.canvas) return;
    const parent = this.canvas.parentElement;
    if (!parent) return;
    this.canvas.width = parent.clientWidth || 900;
    this.canvas.height = parent.clientHeight || 550;
  }

  setNodes(nodes) {
    this.nodes = nodes || [];
  }

  checkHover(e) {
    const hit = this.getNodeAtMouse(e);
    if (hit !== this.hoveredNode) {
      this.hoveredNode = hit;
      this.canvas.style.cursor = hit ? 'pointer' : 'default';
    }
  }

  getNodeAtMouse(e) {
    const rect = this.canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left - this.canvas.width / 2 - this.panX) / this.zoom;
    const my = (e.clientY - rect.top - this.canvas.height / 2 - this.panY) / this.zoom;

    // Gateway check
    const gwDist = Math.hypot(mx, my);
    if (gwDist < 16) {
      return { id: 'GW-01', name: 'LoRa Central Gateway', isGateway: true };
    }

    // Nodes check
    for (const node of this.nodes) {
      const nx = node.x * 2.2;
      const ny = node.z * 2.2;
      const d = Math.hypot(mx - nx, my - ny);
      if (d < 10) return node;
    }
    return null;
  }

  spawnPackets() {
    const now = performance.now();
    if (now - this.lastPacketSpawn > 1200 && this.nodes.length > 0) {
      this.lastPacketSpawn = now;
      // Pick 4 random online nodes to send a telemetry packet toward gateway
      for (let i = 0; i < 4; i++) {
        const randNode = this.nodes[Math.floor(Math.random() * this.nodes.length)];
        if (randNode && randNode.status !== 'OFFLINE') {
          this.packets.push({
            startX: randNode.x * 2.2,
            startY: randNode.z * 2.2,
            targetX: 0,
            targetY: 0,
            progress: 0,
            color: randNode.zone === 'A17' ? '#ef4444' : '#00f2fe'
          });
        }
      }
    }
  }

  render() {
    this.animationId = requestAnimationFrame(this.render);
    if (!this.ctx || !this.canvas) return;

    const w = this.canvas.width;
    const h = this.canvas.height;
    const ctx = this.ctx;

    // Dark high-tech command background with grid
    ctx.fillStyle = '#080d1a';
    ctx.fillRect(0, 0, w, h);

    // Draw tech background grid
    ctx.save();
    ctx.translate(w / 2 + this.panX, h / 2 + this.panY);
    ctx.scale(this.zoom, this.zoom);

    ctx.strokeStyle = 'rgba(30, 58, 102, 0.35)';
    ctx.lineWidth = 1;
    const gridSize = 40;
    const range = 600;
    for (let x = -range; x <= range; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, -range);
      ctx.lineTo(x, range);
      ctx.stroke();
    }
    for (let y = -range; y <= range; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(-range, y);
      ctx.lineTo(range, y);
      ctx.stroke();
    }

    // Range Radar Circles around Gateway
    [100, 200, 320, 450].forEach((r, idx) => {
      ctx.strokeStyle = 'rgba(0, 242, 254, 0.12)';
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = 'rgba(0, 242, 254, 0.4)';
      ctx.font = '10px JetBrains Mono';
      ctx.fillText(`${idx + 1}km Range`, r - 25, -6);
    });

    // Draw Mesh Links
    ctx.lineWidth = 1.2;
    for (let i = 0; i < this.nodes.length; i++) {
      const n1 = this.nodes[i];
      const x1 = n1.x * 2.2;
      const y1 = n1.z * 2.2;

      // Gateway direct hop
      const dGw = Math.hypot(x1, y1);
      if (dGw < 180) {
        ctx.strokeStyle = n1.zone === 'A17' ? 'rgba(239, 68, 68, 0.35)' : 'rgba(0, 242, 254, 0.25)';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(x1, y1);
        ctx.stroke();
      }

      // Neighbor links
      for (let j = i + 1; j < this.nodes.length; j++) {
        const n2 = this.nodes[j];
        const x2 = n2.x * 2.2;
        const y2 = n2.z * 2.2;
        const dist = Math.hypot(x1 - x2, y1 - y2);

        if (dist < 55) {
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.18)';
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }
      }
    }

    // Draw Packets Traveling to Gateway
    this.spawnPackets();
    for (let i = this.packets.length - 1; i >= 0; i--) {
      const p = this.packets[i];
      p.progress += 0.02;
      const curX = p.startX + (p.targetX - p.startX) * p.progress;
      const curY = p.startY + (p.targetY - p.startY) * p.progress;

      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(curX, curY, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      if (p.progress >= 1) {
        this.packets.splice(i, 1);
      }
    }

    // Draw Sensor Nodes
    this.nodes.forEach(node => {
      const nx = node.x * 2.2;
      const ny = node.z * 2.2;

      let color = '#10b981'; // 🟢 Online
      if (node.status === 'WARNING') color = '#f59e0b'; // 🟡 Warning
      if (node.status === 'OFFLINE') color = '#ef4444'; // 🔴 Offline

      const isSelected = node.id === this.selectedNodeId;
      const isHovered = this.hoveredNode && this.hoveredNode.id === node.id;

      // Selection ring
      if (isSelected || isHovered) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(nx, ny, 9, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = '11px Plus Jakarta Sans';
        ctx.fillText(node.id, nx + 12, ny + 4);
      }

      // Node Body
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = isSelected ? 12 : 4;
      ctx.beginPath();
      ctx.arc(nx, ny, isSelected ? 6 : 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    // Draw Central LoRa Gateway ◆
    ctx.save();
    ctx.fillStyle = '#00f2fe';
    ctx.shadowColor = '#00f2fe';
    ctx.shadowBlur = 16;
    ctx.beginPath();
    ctx.moveTo(0, -12);
    ctx.lineTo(12, 0);
    ctx.lineTo(0, 12);
    ctx.lineTo(-12, 0);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px Plus Jakarta Sans';
    ctx.fillText('GATEWAY GW-01', -45, -18);
    ctx.font = '9px JetBrains Mono';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('868.1 MHz LoRaWAN', -45, 26);
    ctx.restore();

    ctx.restore();
  }

  destroy() {
    if (this.animationId) cancelAnimationFrame(this.animationId);
  }
}
