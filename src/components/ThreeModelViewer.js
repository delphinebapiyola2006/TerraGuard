/**
 * MineSonic: 4D Digital Twin Three.js Engine
 * Ultra-High-Fidelity 3D/4D Geotechnical Mine Environment & Strata Volume
 * Open-Face Geotechnical Strata Cutaway Diorama with Subterranean Longwall Cavern,
 * Dynamic Parabolic Subsidence Bowl, Real-Time Vertex Heatmap & 4D Time Convergence
 */

import * as THREE from 'three';

export class ThreeModelViewer {
  constructor(containerId, onNodeSelect) {
    this.container = document.getElementById(containerId);
    this.onNodeSelect = onNodeSelect;
    
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    
    // Core 3D Objects & Groups
    this.worldGroup = new THREE.Group();
    this.terrainMesh = null;
    this.terrainGeometry = null;
    this.baseTerrainPositions = null;
    this.strataSideMeshes = [];
    this.strataMaterials = [];
    this.panelMeshes = [];
    this.propMeshes = [];
    this.tunnelMeshes = [];
    this.nodeMeshes = [];
    this.meshLines = null;
    this.movementVectorsGroup = null;
    this.crackLocationsGroup = null;
    this.predictionOverlay = null;
    this.heatmapMesh = null;
    this.infrastructureGroup = new THREE.Group();
    this.undergroundGroup = new THREE.Group();
    this.drawAngleGroup = null;
    this.particles = null;
    this.continuousMiner = null;
    this.minerDrum = null;
    this.pitheadWheels = [];
    this.carMesh = null;
    this.truckMesh = null;
    this.trainMesh = null;
    this.gatewayMesh = null;
    this.beaconRings = [];
    this.depthLabelsGroup = new THREE.Group();

    // Layer Visibility Flags
    this.layers = {
      sensorNodes: true,
      meshConnections: true,
      undergroundPanels: true,
      groundDeformation: true,
      movementVectors: true,
      riskZones: true,
      crackLocations: true,
      predictionLayer: true,
      drawAngle: true
    };

    this.isXRayMode = false;

    // Time Slider State: 0 = Past (-24h), 50 = Now, 100 = Future (+24h AI Prediction)
    this.timeValue = 50; 
    this.currentStep = 1;
    this.riskScore = 0.18;

    // Smooth Camera Controls (Spherical Orbit)
    this.isMouseDown = false;
    this.isRightMouseDown = false;
    this.mouseX = 0;
    this.mouseY = 0;
    
    // Default: Signature Isometric Geotechnical Cutaway View (showing surface + open underground gallery)
    this.cameraRadius = 290;
    this.cameraTheta = 45 * (Math.PI / 180);
    this.cameraPhi = 66 * (Math.PI / 180);
    this.targetCenter = new THREE.Vector3(5, -24, 8);

    this.targetCameraRadius = this.cameraRadius;
    this.targetCameraTheta = this.cameraTheta;
    this.targetCameraPhi = this.cameraPhi;
    this.targetTargetCenter = this.targetCenter.clone();

    this.isAutoRotating = false;
    this.animationFrameId = null;
    this.clock = new THREE.Clock();

    this.raycaster = new THREE.Raycaster();
    this.mouseVec = new THREE.Vector2();

    this.init();
  }

  init() {
    if (!this.container) return;
    this.container.innerHTML = '';

    const width = this.container.clientWidth || 880;
    const height = this.container.clientHeight || 560;

    // 1. Scene with Deep Atmospheric Midnight Fog
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x060913);
    this.scene.fog = new THREE.FogExp2(0x060913, 0.0016);

    // 2. Camera
    this.camera = new THREE.PerspectiveCamera(40, width / height, 1, 3200);
    this.updateCameraPosition();

    // 3. High Performance WebGL Renderer with Shadows & Tone Mapping
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.35;
    this.container.appendChild(this.renderer.domElement);

    // 4. Studio Geotechnical Lighting Setup
    this.setupLighting();

    // 5. Build Complete 3D Geotechnical World
    this.scene.add(this.worldGroup);
    this.buildGeotechnicalStrataBlock();
    this.buildSurfaceTopography();
    this.buildUndergroundCavernAndLongwallFace();
    this.buildSurfaceInfrastructure();
    this.buildHardwareSensorsAndMesh();
    this.buildDeformationHeatmap();
    this.buildMovementVectors();
    this.buildAngleOfDrawEnvelopes();
    this.buildCrackLocations();
    this.buildPredictionEnvelope();
    this.buildTelemetryParticleStreams();
    this.build3DDepthMeasurementPillars();

    // 6. Interactive Mouse & Touch Events
    this.setupInteractions();

    // 7. Render Loop
    this.animate = this.animate.bind(this);
    this.animate();
  }

  setupLighting() {
    // Key Sunlight (Warm daylight from upper-right)
    const sun = new THREE.DirectionalLight(0xfffaed, 2.2);
    sun.position.set(160, 260, 140);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 2048;
    sun.shadow.mapSize.height = 2048;
    sun.shadow.camera.near = 10;
    sun.shadow.camera.far = 750;
    const d = 190;
    sun.shadow.camera.left = -d;
    sun.shadow.camera.right = d;
    sun.shadow.camera.top = d;
    sun.shadow.camera.bottom = -d;
    sun.shadow.bias = -0.0003;
    this.scene.add(sun);

    // Hemisphere Ambient Fill (Atmospheric Sky + Ground bounce)
    const hemiLight = new THREE.HemisphereLight(0x93c5fd, 0x1e293b, 1.25);
    this.scene.add(hemiLight);

    // Cyan Rim Light (High-tech geotechnical contour edge illumination)
    const rimLight = new THREE.DirectionalLight(0x00f2fe, 0.75);
    rimLight.position.set(-180, 70, -180);
    this.scene.add(rimLight);

    // Subterranean Mining Gallery Spotlight & Amber Lanterns
    const mineVoidLight = new THREE.PointLight(0xffa000, 4.5, 180);
    mineVoidLight.position.set(20, -56, 10);
    mineVoidLight.castShadow = true;
    this.scene.add(mineVoidLight);

    const mineVoidFill = new THREE.PointLight(0x38bdf8, 2.2, 120);
    mineVoidFill.position.set(-40, -56, 10);
    this.scene.add(mineVoidFill);

    // Master Gateway Tower Cyan Beacon
    const gwLight = new THREE.PointLight(0x00f2fe, 2.5, 110);
    gwLight.position.set(0, 28, 0);
    this.scene.add(gwLight);
  }

  // --- Procedural High-Resolution Surface Texture ---
  createSurfaceTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 2048;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    // 1. Lush Green Earth with Realistic Topsoil Gradient & Mottling
    const grassGrad = ctx.createLinearGradient(0, 0, w, h);
    grassGrad.addColorStop(0, '#2d5e24');
    grassGrad.addColorStop(0.3, '#3c7932');
    grassGrad.addColorStop(0.65, '#285721');
    grassGrad.addColorStop(1, '#1b4017');
    ctx.fillStyle = grassGrad;
    ctx.fillRect(0, 0, w, h);

    // Dense grass micro-texture
    for (let i = 0; i < 35000; i++) {
      const rx = Math.random() * w;
      const ry = Math.random() * h;
      const shade = Math.random();
      ctx.fillStyle = shade > 0.65 ? 'rgba(74, 165, 66, 0.45)' : (shade > 0.35 ? 'rgba(25, 60, 20, 0.4)' : 'rgba(160, 140, 85, 0.3)');
      ctx.fillRect(rx, ry, Math.random() * 5 + 2, Math.random() * 5 + 2);
    }

    // 2. Agricultural Farmland with Plowed Furrows (Top-Left)
    ctx.fillStyle = '#5c3a21';
    ctx.fillRect(60, 60, 560, 440);
    ctx.strokeStyle = '#8b5a2b';
    ctx.lineWidth = 6;
    for (let y = 75; y < 490; y += 20) {
      ctx.beginPath();
      ctx.moveTo(70, y);
      ctx.lineTo(610, y);
      ctx.stroke();
    }
    // Crop growth patches
    ctx.fillStyle = '#eab308';
    for (let x = 80; x < 600; x += 26) {
      for (let y = 80; y < 480; y += 20) {
        ctx.fillRect(x, y, 15, 6);
      }
    }

    // 3. Mining Yard & Pithead Excavation Ground (Top-Right)
    const pitGrad = ctx.createRadialGradient(1550, 450, 40, 1550, 450, 420);
    pitGrad.addColorStop(0, '#1c1917');
    pitGrad.addColorStop(0.5, '#292524');
    pitGrad.addColorStop(0.85, '#44403c');
    pitGrad.addColorStop(1, 'rgba(68, 64, 60, 0)');
    ctx.fillStyle = pitGrad;
    ctx.beginPath();
    ctx.arc(1550, 450, 420, 0, Math.PI * 2);
    ctx.fill();

    // 4. Natural Lake / Water Reservoir (Bottom-Left)
    const lakeGrad = ctx.createRadialGradient(460, 1600, 40, 460, 1600, 310);
    lakeGrad.addColorStop(0, '#0284c7');
    lakeGrad.addColorStop(0.65, '#0369a1');
    lakeGrad.addColorStop(0.88, '#075985');
    lakeGrad.addColorStop(1, '#ca8a04'); // Sandy bank
    ctx.fillStyle = lakeGrad;
    ctx.beginPath();
    ctx.ellipse(460, 1600, 290, 220, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // 5. Curving Asphalt Highway
    ctx.save();
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 80;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, 1080);
    ctx.bezierCurveTo(600, 1160, 1200, 980, 2048, 1060);
    ctx.stroke();

    // Road Shoulder Borders
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Yellow Dashed Center Divider
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 5;
    ctx.setLineDash([34, 26]);
    ctx.beginPath();
    ctx.moveTo(0, 1080);
    ctx.bezierCurveTo(600, 1160, 1200, 980, 2048, 1060);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    // 6. Railway Track Corridor
    ctx.save();
    // Ballast Bed (Dark Gravel)
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 64;
    ctx.beginPath();
    ctx.moveTo(0, 1380);
    ctx.bezierCurveTo(700, 1360, 1300, 1400, 2048, 1340);
    ctx.stroke();

    // Wooden Ties (Sleepers)
    ctx.strokeStyle = '#5c3a21';
    ctx.lineWidth = 6;
    for (let rx = 20; rx < 2030; rx += 22) {
      const ry = 1380 + Math.sin(rx * 0.0018) * 15;
      ctx.beginPath();
      ctx.moveTo(rx, ry - 22);
      ctx.lineTo(rx, ry + 22);
      ctx.stroke();
    }

    // Steel Shiny Rails
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 3.8;
    [-12, 12].forEach(offset => {
      ctx.beginPath();
      ctx.moveTo(0, 1380 + offset);
      ctx.bezierCurveTo(700, 1360 + offset, 1300, 1400 + offset, 2048, 1340 + offset);
      ctx.stroke();
    });
    ctx.restore();

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    return texture;
  }

  // --- Procedural Rock Texture for Strata Cutaway Walls ---
  createStrataSideTexture(strataType) {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    if (strataType === 'soil') {
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, '#543d2b');
      grad.addColorStop(0.5, '#432e1e');
      grad.addColorStop(1, '#322013');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
      // Silt pebble mottles
      for (let i = 0; i < 4000; i++) {
        ctx.fillStyle = Math.random() > 0.5 ? 'rgba(140, 110, 75, 0.4)' : 'rgba(30, 20, 10, 0.4)';
        ctx.fillRect(Math.random() * w, Math.random() * h, Math.random() * 8 + 2, Math.random() * 4 + 2);
      }
    } else if (strataType === 'sandstone') {
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, '#786551');
      grad.addColorStop(0.5, '#695745');
      grad.addColorStop(1, '#574636');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
      // Sedimentary horizontal bedding planes
      for (let y = 15; y < h; y += Math.random() * 25 + 15) {
        ctx.strokeStyle = Math.random() > 0.5 ? 'rgba(40, 30, 20, 0.6)' : 'rgba(180, 160, 130, 0.4)';
        ctx.lineWidth = Math.random() * 3 + 1;
        ctx.beginPath();
        ctx.moveTo(0, y);
        for (let x = 0; x < w; x += 40) {
          ctx.lineTo(x, y + Math.sin(x * 0.03) * 4);
        }
        ctx.stroke();
      }
    } else if (strataType === 'shale') {
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, '#38434f');
      grad.addColorStop(0.5, '#28313b');
      grad.addColorStop(1, '#1b232c');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
      // Tight laminated fissile slate sheets
      for (let y = 8; y < h; y += 10) {
        ctx.strokeStyle = 'rgba(15, 20, 26, 0.7)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
    } else if (strataType === 'coal') {
      ctx.fillStyle = '#0c0f14';
      ctx.fillRect(0, 0, w, h);
      // Jet-black lustrous coal bands
      for (let i = 0; i < 6000; i++) {
        ctx.fillStyle = Math.random() > 0.6 ? 'rgba(40, 50, 65, 0.5)' : 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(Math.random() * w, Math.random() * h, Math.random() * 12 + 4, Math.random() * 3 + 1);
      }
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }

  // --- Build 3D Geotechnical Strata Cutaway Volume ---
  buildGeotechnicalStrataBlock() {
    const blockW = 250;
    const blockD = 250;

    // 4 Geological Strata Layers
    const strataLayers = [
      { id: 'soil', name: 'Topsoil & Siltstone Layer', topY: 0, botY: -14, type: 'soil', color: 0x5a3720, rough: 0.85 },
      { id: 'sandstone', name: 'Sandstone Overburden Barrier', topY: -14, botY: -38, type: 'sandstone', color: 0x695745, rough: 0.75 },
      { id: 'shale', name: 'Shale Impermeable Barrier', topY: -38, botY: -52, type: 'shale', color: 0x28313b, rough: 0.8 },
      { id: 'coal', name: 'Coal Seam #4 (Panel A17 Level)', topY: -52, botY: -72, type: 'coal', color: 0x111620, rough: 0.4 }
    ];

    // Build the 3 Solid Back & Side Strata Slabs (Left, Back, Base)
    strataLayers.forEach(l => {
      const slabH = l.topY - l.botY;
      const centerY = (l.topY + l.botY) / 2;
      const sideTex = this.createStrataSideTexture(l.type);

      // Back slab
      const backGeom = new THREE.BoxGeometry(blockW, slabH, 30);
      const mat = new THREE.MeshStandardMaterial({
        color: l.color,
        map: sideTex,
        roughness: l.rough,
        metalness: 0.2
      });
      const backMesh = new THREE.Mesh(backGeom, mat);
      backMesh.position.set(0, centerY, -blockD / 2 + 15);
      backMesh.receiveShadow = true;
      backMesh.castShadow = true;
      this.worldGroup.add(backMesh);
      this.strataSideMeshes.push(backMesh);
      this.strataMaterials.push(mat);

      // Left slab
      const leftGeom = new THREE.BoxGeometry(30, slabH, blockD - 30);
      const leftMesh = new THREE.Mesh(leftGeom, mat);
      leftMesh.position.set(-blockW / 2 + 15, centerY, 15);
      leftMesh.receiveShadow = true;
      leftMesh.castShadow = true;
      this.worldGroup.add(leftMesh);
      this.strataSideMeshes.push(leftMesh);

      // Strata Boundary Neon Grid Rim
      const edgeGeom = new THREE.EdgesGeometry(backGeom);
      const edgeLine = new THREE.LineSegments(edgeGeom, new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.2 }));
      backMesh.add(edgeLine);
    });

    // Solid Bottom Foundation Slab
    const baseGeom = new THREE.BoxGeometry(blockW, 10, blockD);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.9, metalness: 0.3 });
    const baseMesh = new THREE.Mesh(baseGeom, baseMat);
    baseMesh.position.set(0, -77, 0);
    baseMesh.receiveShadow = true;
    this.worldGroup.add(baseMesh);

    // Cyan Foundation Border
    const baseEdge = new THREE.LineSegments(
      new THREE.EdgesGeometry(baseGeom),
      new THREE.LineBasicMaterial({ color: 0x00f2fe, transparent: true, opacity: 0.4 })
    );
    baseMesh.add(baseEdge);
  }

  // --- Build Realistic Undulating Surface Topography ---
  buildSurfaceTopography() {
    const size = 250;
    const segments = 100;
    this.terrainGeometry = new THREE.PlaneGeometry(size, size, segments, segments);
    this.terrainGeometry.rotateX(-Math.PI / 2);

    const pos = this.terrainGeometry.attributes.position;
    this.baseTerrainPositions = new Float32Array(pos.array.length);

    // Natural undulating topography
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const y = Math.sin(x * 0.022) * 3.4 + Math.cos(z * 0.024) * 2.8 + Math.sin((x + z) * 0.038) * 1.4;
      pos.setY(i, y);
      this.baseTerrainPositions[i * 3 + 0] = x;
      this.baseTerrainPositions[i * 3 + 1] = y;
      this.baseTerrainPositions[i * 3 + 2] = z;
    }
    this.terrainGeometry.computeVertexNormals();

    const terrainTexture = this.createSurfaceTexture();
    const terrainMat = new THREE.MeshStandardMaterial({
      map: terrainTexture,
      roughness: 0.72,
      metalness: 0.1,
      flatShading: false
    });

    this.terrainMesh = new THREE.Mesh(this.terrainGeometry, terrainMat);
    this.terrainMesh.receiveShadow = true;
    this.terrainMesh.castShadow = true;
    this.worldGroup.add(this.terrainMesh);

    // High-tech subtle HUD grid overlay
    const wireMat = new THREE.MeshBasicMaterial({ color: 0x00f2fe, wireframe: true, transparent: true, opacity: 0.06 });
    const wireMesh = new THREE.Mesh(this.terrainGeometry, wireMat);
    wireMesh.position.y += 0.08;
    this.worldGroup.add(wireMesh);
  }

  // --- Build Open Subterranean Cavern, Mining Face & Longwall Gallery ---
  buildUndergroundCavernAndLongwallFace() {
    this.undergroundGroup = new THREE.Group();

    // 1. Longwall Extraction Panels inside Coal Seam Level (-52m to -72m)
    const panels = [
      { id: 'A17', name: 'Panel A17 (Active Longwall Extraction Face)', x: 15, y: -62, z: 0, width: 95, depth: 75, height: 10, color: 0xef4444, active: true },
      { id: 'A12', name: 'Panel A12 (Depillared Goaf Zone)', x: 70, y: -62, z: -45, width: 65, depth: 55, height: 10, color: 0xf59e0b, active: false },
      { id: 'A08', name: 'Panel A08 (Stable Barrier Pillar)', x: -65, y: -62, z: -45, width: 60, depth: 50, height: 10, color: 0x10b981, active: false }
    ];

    panels.forEach(p => {
      // 3D Excavated Void Floor & Ceiling
      const floorGeom = new THREE.BoxGeometry(p.width, 1.2, p.depth);
      const floorMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.9 });
      const floor = new THREE.Mesh(floorGeom, floorMat);
      floor.position.set(p.x, p.y - p.height / 2, p.z);
      this.undergroundGroup.add(floor);

      const roofGeom = new THREE.BoxGeometry(p.width, 1.2, p.depth);
      const roofMat = new THREE.MeshStandardMaterial({
        color: p.color,
        emissive: p.color,
        emissiveIntensity: p.active ? 0.45 : 0.18,
        roughness: 0.4,
        metalness: 0.6
      });
      const roof = new THREE.Mesh(roofGeom, roofMat);
      roof.position.set(p.x, p.y + p.height / 2, p.z);
      roof.userData = { panelId: p.id, name: p.name, active: p.active, baseY: p.y + p.height / 2 };
      this.undergroundGroup.add(roof);
      this.panelMeshes.push(roof);

      // Glowing Wire Frame on Panel Ceiling
      const wire = new THREE.LineSegments(
        new THREE.EdgesGeometry(roofGeom),
        new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 })
      );
      roof.add(wire);
    });

    // 2. 6 Heavy Hydraulic Steel Shield Chocks (Roof Supports) along Panel A17 Face
    [-32, -18, -4, 10, 24, 38].forEach(px => {
      const propGroup = new THREE.Group();

      // Dual Chrome Hydraulic Cylinders
      [-1.6, 1.6].forEach(cz => {
        const cyl = new THREE.Mesh(
          new THREE.CylinderGeometry(1.2, 1.3, 9.2, 16),
          new THREE.MeshStandardMaterial({ color: 0xf8fafc, metalness: 0.95, roughness: 0.15 })
        );
        cyl.position.set(0, 0, cz);
        cyl.castShadow = true;
        propGroup.add(cyl);
      });

      // Heavy Yellow Shield Canopy Roof Beam
      const canopy = new THREE.Mesh(
        new THREE.BoxGeometry(6.2, 1.4, 7.8),
        new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.4, metalness: 0.8 })
      );
      canopy.position.y = 4.8;
      canopy.castShadow = true;
      propGroup.add(canopy);

      // Base Sled Plate
      const base = new THREE.Mesh(
        new THREE.BoxGeometry(6.2, 1.2, 7.8),
        new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.85 })
      );
      base.position.y = -4.8;
      propGroup.add(base);

      propGroup.position.set(15 + px, -62, -12);
      propGroup.userData = { baseY: -62 };
      this.undergroundGroup.add(propGroup);
      this.propMeshes.push(propGroup);
    });

    // 3. Fallen Goaf / Caving Rock Debris behind the Hydraulic Chocks
    const goafGroup = new THREE.Group();
    for (let i = 0; i < 28; i++) {
      const rockGeom = new THREE.DodecahedronGeometry(Math.random() * 3.2 + 1.8);
      const rockMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.9 });
      const rock = new THREE.Mesh(rockGeom, rockMat);
      rock.position.set(
        -25 + Math.random() * 70,
        -64 + Math.random() * 4,
        -26 - Math.random() * 18
      );
      rock.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
      goafGroup.add(rock);
    }
    this.undergroundGroup.add(goafGroup);

    // 4. Heavy Continuous Miner / Longwall Shearer Machine
    const minerGroup = new THREE.Group();

    // Main Heavy Yellow Chassis
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(22, 5.8, 9.2),
      new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.35, metalness: 0.75 })
    );
    body.position.y = 0;
    body.castShadow = true;
    minerGroup.add(body);

    // Operator Cab with Safety Glass
    const cab = new THREE.Mesh(
      new THREE.BoxGeometry(6.5, 3.2, 6.2),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2 })
    );
    cab.position.set(-5, 3.8, 0);
    minerGroup.add(cab);

    // Rotating Carbide Cutter Drum
    const drum = new THREE.Mesh(
      new THREE.CylinderGeometry(3.2, 3.2, 9.6, 24),
      new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.95, roughness: 0.15 })
    );
    drum.rotation.z = Math.PI / 2;
    drum.position.set(13.8, 0.4, 0);
    minerGroup.add(drum);
    this.minerDrum = drum;

    // Tungsten Carbide Picks on Cutter Drum
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
      const pick = new THREE.Mesh(
        new THREE.ConeGeometry(0.5, 1.4, 6),
        new THREE.MeshStandardMaterial({ color: 0xf8fafc, metalness: 0.98 })
      );
      pick.position.set(13.8, 0.4 + Math.sin(a) * 3.5, Math.cos(a) * 3.5);
      pick.rotation.x = a;
      minerGroup.add(pick);
    }

    // Heavy High-Intensity Forward Mining Headlights
    const minerLight = new THREE.SpotLight(0xfff176, 5.5, 65, Math.PI / 4.5, 0.35);
    minerLight.position.set(14, 1.8, 0);
    minerLight.target.position.set(45, 1.8, 0);
    minerGroup.add(minerLight);
    minerGroup.add(minerLight.target);

    minerGroup.position.set(40, -62, 12);
    minerGroup.userData = { baseY: -62 };
    this.undergroundGroup.add(minerGroup);
    this.continuousMiner = minerGroup;

    // 5. Coal Conveyor Belt Haulage System
    const conveyorGeom = new THREE.BoxGeometry(85, 1.4, 3.8);
    const conveyorMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.7, metalness: 0.4 });
    const conveyor = new THREE.Mesh(conveyorGeom, conveyorMat);
    conveyor.position.set(10, -65, 20);
    this.undergroundGroup.add(conveyor);

    // Coal lumps on conveyor
    for (let cx = -35; cx < 40; cx += 5) {
      const coalLump = new THREE.Mesh(
        new THREE.DodecahedronGeometry(1.2),
        new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.2, metalness: 0.8 })
      );
      coalLump.position.set(cx, -63.6, 20 + (Math.sin(cx) * 0.8));
      this.undergroundGroup.add(coalLump);
    }

    // 6. Underground Mine Gallery Amber Lanterns
    [-30, 0, 30].forEach(lx => {
      const lamp = new THREE.Mesh(
        new THREE.SphereGeometry(0.8, 8, 8),
        new THREE.MeshStandardMaterial({ color: 0xffa000, emissive: 0xffa000, emissiveIntensity: 1.0 })
      );
      lamp.position.set(lx, -58, 22);
      this.undergroundGroup.add(lamp);
    });

    this.worldGroup.add(this.undergroundGroup);
  }

  // --- Build Surface Village, Roads, Rails, Pithead & Nature ---
  buildSurfaceInfrastructure() {
    this.infrastructureGroup = new THREE.Group();

    // 1. Industrial Pithead Colliery Lattice Headframe
    const pitheadGroup = new THREE.Group();
    const legGeom = new THREE.CylinderGeometry(0.8, 1.2, 44, 8);
    const legMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, metalness: 0.85, roughness: 0.25 });
    [
      { x: -6, z: -6 }, { x: 6, z: -6 }, { x: -6, z: 6 }, { x: 6, z: 6 }
    ].forEach(p => {
      const leg = new THREE.Mesh(legGeom, legMat);
      leg.position.set(p.x, 22, p.z);
      pitheadGroup.add(leg);
    });

    // Horizontal & Diagonal Truss Girders
    [9, 20, 31, 42].forEach(sy => {
      const ring = new THREE.Mesh(
        new THREE.BoxGeometry(13, 1.4, 13),
        new THREE.MeshStandardMaterial({ color: 0x991b1b, metalness: 0.8 })
      );
      ring.position.y = sy;
      pitheadGroup.add(ring);
    });

    // Dual Spinning Sheave Winding Wheels
    const wheelGeom = new THREE.TorusGeometry(4.2, 0.6, 8, 24);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, metalness: 0.95, roughness: 0.1 });
    [-2.8, 2.8].forEach(wz => {
      const wheel = new THREE.Mesh(wheelGeom, wheelMat);
      wheel.position.set(0, 45, wz);
      wheel.rotation.y = Math.PI / 2;
      pitheadGroup.add(wheel);
      this.pitheadWheels.push(wheel);
    });

    // Pithead Vertical Haulage Shaft Connecting to Underground Gallery
    const shaftGeom = new THREE.CylinderGeometry(5.2, 5.2, 68, 16);
    const shaftMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      metalness: 0.8,
      roughness: 0.2,
      transparent: true,
      opacity: 0.55
    });
    const shaft = new THREE.Mesh(shaftGeom, shaftMat);
    shaft.position.set(58, -32, -35);
    this.worldGroup.add(shaft);

    pitheadGroup.position.set(58, 3.5, -35);
    this.infrastructureGroup.add(pitheadGroup);

    // 2. Village Houses with Pitched Terracotta Roofs & Chimneys
    const houses = [
      { x: -52, z: -25, w: 10, h: 6, d: 9, wall: 0xf1f5f9, roof: 0xb91c1c },
      { x: -36, z: -36, w: 11, h: 6.5, d: 9, wall: 0xfef08a, roof: 0xc2410c },
      { x: -70, z: -15, w: 9, h: 5.5, d: 8, wall: 0xe2e8f0, roof: 0x991b1b },
      { x: 32, z: 44, w: 10, h: 6, d: 9, wall: 0xf8fafc, roof: 0xdc2626 },
      { x: 55, z: 50, w: 12, h: 7, d: 10, wall: 0xfef9c3, roof: 0x9a3412 }
    ];

    houses.forEach(h => {
      const house = new THREE.Group();
      const wall = new THREE.Mesh(
        new THREE.BoxGeometry(h.w, h.h, h.d),
        new THREE.MeshStandardMaterial({ color: h.wall, roughness: 0.6 })
      );
      wall.position.y = h.h / 2;
      wall.castShadow = true;
      wall.receiveShadow = true;
      house.add(wall);

      // Glass Windows with Warm Interior Glow
      const winMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.1, metalness: 0.9 });
      const win1 = new THREE.Mesh(new THREE.BoxGeometry(2.0, 2.0, 0.2), winMat);
      win1.position.set(-h.w * 0.25, h.h * 0.55, h.d / 2 + 0.1);
      house.add(win1);
      const win2 = new THREE.Mesh(new THREE.BoxGeometry(2.0, 2.0, 0.2), winMat);
      win2.position.set(h.w * 0.25, h.h * 0.55, h.d / 2 + 0.1);
      house.add(win2);

      // Gabled Pitched Roof
      const roof = new THREE.Mesh(
        new THREE.ConeGeometry(Math.hypot(h.w, h.d) * 0.68, 4.5, 4),
        new THREE.MeshStandardMaterial({ color: h.roof, roughness: 0.45 })
      );
      roof.position.y = h.h + 2.25;
      roof.rotation.y = Math.PI / 4;
      roof.castShadow = true;
      house.add(roof);

      // Brick Chimney
      const chim = new THREE.Mesh(
        new THREE.BoxGeometry(1.4, 3.2, 1.4),
        new THREE.MeshStandardMaterial({ color: 0x78350f })
      );
      chim.position.set(h.w * 0.28, h.h + 3.2, 0);
      chim.castShadow = true;
      house.add(chim);

      house.position.set(h.x, 3.2, h.z);
      this.infrastructureGroup.add(house);
    });

    // 3. Dense Forest & Vegetation (Tiered Coniferous & Deciduous Trees)
    const treeSpots = [
      { x: -64, z: -38, s: 1.2 }, { x: -48, z: -46, s: 1.0 }, { x: -80, z: -28, s: 1.1 },
      { x: -28, z: -18, s: 0.9 }, { x: -18, z: 28, s: 1.1 }, { x: -4, z: 42, s: 1.3 },
      { x: 16, z: 32, s: 1.0 }, { x: 64, z: 38, s: 1.2 }, { x: -90, z: 12, s: 1.3 },
      { x: -84, z: 36, s: 1.0 }, { x: 80, z: -18, s: 1.2 }, { x: 94, z: 14, s: 1.1 },
      { x: -15, z: -44, s: 1.2 }, { x: 44, z: -25, s: 1.0 }, { x: -54, z: 15, s: 1.1 }
    ];

    treeSpots.forEach(t => {
      const tree = new THREE.Group();
      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.7 * t.s, 1.0 * t.s, 5.5 * t.s, 8),
        new THREE.MeshStandardMaterial({ color: 0x5c3a21, roughness: 0.9 })
      );
      trunk.position.y = 2.75 * t.s;
      trunk.castShadow = true;
      tree.add(trunk);

      const folMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.55 });
      [4.5, 6.8, 8.8].forEach((fy, idx) => {
        const foliage = new THREE.Mesh(
          new THREE.ConeGeometry((4.5 - idx * 0.9) * t.s, 3.8 * t.s, 8),
          folMat
        );
        foliage.position.y = fy * t.s;
        foliage.castShadow = true;
        tree.add(foliage);
      });

      tree.position.set(t.x, 3.0, t.z);
      this.infrastructureGroup.add(tree);
    });

    // 4. Moving Highway Vehicles
    // Red Sedan Car
    const carGroup = new THREE.Group();
    const carBody = new THREE.Mesh(
      new THREE.BoxGeometry(6.8, 2.4, 3.6),
      new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.8, roughness: 0.25 })
    );
    carBody.position.y = 1.4;
    carBody.castShadow = true;
    carGroup.add(carBody);
    carGroup.position.set(-20, 3.6, 16);
    this.carMesh = carGroup;
    this.infrastructureGroup.add(carGroup);

    // Mining Haulage Truck
    const truckGroup = new THREE.Group();
    const truckBody = new THREE.Mesh(
      new THREE.BoxGeometry(8.5, 3.8, 4.2),
      new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.7, roughness: 0.35 })
    );
    truckBody.position.y = 2.2;
    truckBody.castShadow = true;
    truckGroup.add(truckBody);
    truckGroup.position.set(35, 3.6, 18);
    this.truckMesh = truckGroup;
    this.infrastructureGroup.add(truckGroup);

    // 5. Dedicated Moving Freight Train Locomotive with Coal Wagons
    const trainGroup = new THREE.Group();
    const engine = new THREE.Mesh(
      new THREE.BoxGeometry(13, 4.5, 4.0),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.85, roughness: 0.2 })
    );
    engine.position.y = 2.6;
    engine.castShadow = true;
    trainGroup.add(engine);

    // 2 Coal Wagons
    [16, 31].forEach(wx => {
      const wagon = new THREE.Mesh(
        new THREE.BoxGeometry(12, 3.8, 4.0),
        new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.6 })
      );
      wagon.position.set(wx, 2.2, 0);
      wagon.castShadow = true;
      trainGroup.add(wagon);

      const coalLump = new THREE.Mesh(
        new THREE.BoxGeometry(10.5, 1.8, 3.4),
        new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.3, metalness: 0.7 })
      );
      coalLump.position.set(wx, 4.2, 0);
      trainGroup.add(coalLump);
    });

    trainGroup.position.set(20, 3.8, 44);
    this.trainMesh = trainGroup;
    this.infrastructureGroup.add(trainGroup);

    this.worldGroup.add(this.infrastructureGroup);
  }

  // --- Build 132 Physical Sensor Stations & LoRa Mesh Connections ---
  buildHardwareSensorsAndMesh() {
    const nodeGroup = new THREE.Group();

    // 132 Physical Smart Sensor Stations across the Surface Topography
    for (let i = 1; i <= 132; i++) {
      const angle = (i * 137.5) * (Math.PI / 180);
      const radius = 22 + Math.sqrt(i) * 16 + (Math.sin(i * 11) * 6);
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = Math.sin(x * 0.022) * 3.4 + Math.cos(z * 0.024) * 2.8 + 2.0;

      const isA17 = x > -35 && x < 65 && z > -45 && z < 25;
      const statusColor = i === 132 ? 0xef4444 : (i % 35 === 0 ? 0xf59e0b : 0x10b981);

      const station = new THREE.Group();

      // Mast Pole
      const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.35, 0.45, 4.8, 8),
        new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 })
      );
      pole.position.y = 2.4;
      station.add(pole);

      // Angled Solar Photovoltaic Panel
      const solar = new THREE.Mesh(
        new THREE.BoxGeometry(2.4, 0.2, 1.5),
        new THREE.MeshStandardMaterial({ color: 0x1e1b4b, metalness: 0.9, roughness: 0.1 })
      );
      solar.position.set(0.7, 4.5, 0);
      solar.rotation.z = -0.35;
      station.add(solar);

      // 3-Colour Status LED Head
      const mat = new THREE.MeshStandardMaterial({
        color: statusColor,
        emissive: statusColor,
        emissiveIntensity: 0.95,
        roughness: 0.2,
        metalness: 0.8
      });
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.9, 12, 12), mat);
      head.position.y = 5.2;
      station.add(head);

      station.position.set(x, y, z);
      station.userData = { id: `MSN-${String(i).padStart(3, '0')}`, isA17, baseX: x, baseY: y, baseZ: z };
      nodeGroup.add(station);
      this.nodeMeshes.push(head);
    }
    this.worldGroup.add(nodeGroup);
    this.sensorNodesGroup = nodeGroup;

    // Central Master LoRaWAN Gateway Mast
    const gwGroup = new THREE.Group();
    const mast = new THREE.Mesh(
      new THREE.CylinderGeometry(1.0, 1.5, 28, 12),
      new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 })
    );
    mast.position.y = 14;
    gwGroup.add(mast);

    const gwGeom = new THREE.OctahedronGeometry(5.4, 0);
    const gwMat = new THREE.MeshStandardMaterial({ color: 0x00f2fe, emissive: 0x00f2fe, emissiveIntensity: 0.95, roughness: 0.1 });
    this.gatewayMesh = new THREE.Mesh(gwGeom, gwMat);
    this.gatewayMesh.position.y = 29;
    gwGroup.add(this.gatewayMesh);

    gwGroup.position.set(0, 3.5, 0);
    this.worldGroup.add(gwGroup);
    this.gatewayGroup = gwGroup;

    // Wireless Mesh Signal Connection Lines
    const linePositions = [];
    const lineColors = [];
    for (let i = 0; i < this.nodeMeshes.length; i++) {
      const n1 = this.nodeMeshes[i].parent;
      const dGw = n1.position.distanceTo(new THREE.Vector3(0, 29, 0));
      if (dGw < 90) {
        linePositions.push(n1.position.x, n1.position.y + 4.8, n1.position.z);
        linePositions.push(0, 29, 0);
        lineColors.push(0, 0.95, 1, 0, 0.95, 1);
      }
      for (let j = i + 1; j < this.nodeMeshes.length; j++) {
        const n2 = this.nodeMeshes[j].parent;
        const dist = n1.position.distanceTo(n2.position);
        if (dist < 28) {
          linePositions.push(n1.position.x, n1.position.y + 4.8, n1.position.z);
          linePositions.push(n2.position.x, n2.position.y + 4.8, n2.position.z);
          lineColors.push(0.1, 0.7, 0.9, 0.1, 0.7, 0.9);
        }
      }
    }

    const lineGeom = new THREE.BufferGeometry();
    lineGeom.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    lineGeom.setAttribute('color', new THREE.Float32BufferAttribute(lineColors, 3));
    const lineMat = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.45 });
    this.meshLines = new THREE.LineSegments(lineGeom, lineMat);
    this.worldGroup.add(this.meshLines);
  }

  // --- Build 3D Geotechnical Deformation Heatmap Mesh ---
  buildDeformationHeatmap() {
    const geom = new THREE.RingGeometry(2, 52, 40);
    geom.rotateX(-Math.PI / 2);
    const mat = new THREE.MeshBasicMaterial({
      color: 0xef4444,
      transparent: true,
      opacity: 0.32,
      side: THREE.DoubleSide
    });
    this.heatmapMesh = new THREE.Mesh(geom, mat);
    this.heatmapMesh.position.set(15, 4.4, 0);
    this.worldGroup.add(this.heatmapMesh);
  }

  // --- Build 3D Movement Vectors (Deformation Arrows) ---
  buildMovementVectors() {
    const vectorGroup = new THREE.Group();
    for (let i = 0; i < 28; i++) {
      const x = -25 + (i % 7) * 14;
      const z = -35 + Math.floor(i / 7) * 14;
      const dir = new THREE.Vector3(
        -(x - 15) * 0.05,
        -1,
        -(z - 0) * 0.05
      ).normalize();
      const origin = new THREE.Vector3(x, 10, z);
      const arrow = new THREE.ArrowHelper(dir, origin, 9.0, 0xef4444, 3.0, 1.6);
      vectorGroup.add(arrow);
    }
    this.worldGroup.add(vectorGroup);
    this.movementVectorsGroup = vectorGroup;
  }

  // --- Build Statutory 45° Angle of Draw Safety Boundary Envelopes ---
  buildAngleOfDrawEnvelopes() {
    const drawGroup = new THREE.Group();

    // 45° Statutory Angle of Draw Frustum Lines from Panel A17 (-62m) to Surface (0m)
    const points = [
      new THREE.Vector3(-32, -62, -37), new THREE.Vector3(-75, 4, -75),
      new THREE.Vector3(62, -62, -37), new THREE.Vector3(105, 4, -75),
      new THREE.Vector3(62, -62, 37), new THREE.Vector3(105, 4, 75),
      new THREE.Vector3(-32, -62, 37), new THREE.Vector3(-75, 4, 75)
    ];

    const lineGeom = new THREE.BufferGeometry().setFromPoints(points);
    const lineMat = new THREE.LineDashedMaterial({ color: 0x38bdf8, dashSize: 4, gapSize: 3, transparent: true, opacity: 0.75 });
    const lines = new THREE.LineSegments(lineGeom, lineMat);
    lines.computeLineDistances();
    drawGroup.add(lines);

    this.worldGroup.add(drawGroup);
    this.drawAngleGroup = drawGroup;
  }

  // --- Build Dynamic Surface Tension Cracks & Faults ---
  buildCrackLocations() {
    const crackGroup = new THREE.Group();
    const crackCoords = [
      [[-28, 3.8, -22], [-12, 3.9, -19], [15, 3.7, -24], [40, 3.8, -28]],
      [[-24, 3.8, -6], [-8, 3.9, -5], [22, 3.7, -9], [46, 3.8, -12]],
      [[-18, 3.8, 14], [4, 3.9, 18], [28, 3.7, 12], [52, 3.8, 10]]
    ];

    crackCoords.forEach(coords => {
      const points = coords.map(c => new THREE.Vector3(c[0], c[1] + 0.4, c[2]));
      const curve = new THREE.CatmullRomCurve3(points);
      const tubeGeom = new THREE.TubeGeometry(curve, 24, 1.1, 8, false);
      const tubeMat = new THREE.MeshStandardMaterial({
        color: 0xff1744,
        emissive: 0xff1744,
        emissiveIntensity: 0.95,
        roughness: 0.2
      });
      const tubeMesh = new THREE.Mesh(tubeGeom, tubeMat);
      crackGroup.add(tubeMesh);
    });

    this.worldGroup.add(crackGroup);
    this.crackLocationsGroup = crackGroup;
  }

  // --- Build AI Prediction Horizon Grid ---
  buildPredictionEnvelope() {
    const geom = new THREE.PlaneGeometry(140, 105, 24, 24);
    geom.rotateX(-Math.PI / 2);
    const mat = new THREE.MeshStandardMaterial({
      color: 0xa855f7,
      emissive: 0xa855f7,
      emissiveIntensity: 0.45,
      transparent: true,
      opacity: 0.35,
      wireframe: true
    });
    this.predictionOverlay = new THREE.Mesh(geom, mat);
    this.predictionOverlay.position.set(15, 15, 0);
    this.worldGroup.add(this.predictionOverlay);
  }

  // --- Build 3D Stratum Depth Markers on the Cutaway Wall ---
  build3DDepthMeasurementPillars() {
    this.depthLabelsGroup = new THREE.Group();

    // Depth indicator markers at x = 126, z = 126
    const depths = [
      { label: '0m Surface', y: 0, color: 0x38bdf8 },
      { label: '-14m Topsoil', y: -14, color: 0x6e472e },
      { label: '-38m Sandstone', y: -38, color: 0x526071 },
      { label: '-52m Shale Barrier', y: -52, color: 0x334155 },
      { label: '-72m Seam #4 (Panel A17)', y: -72, color: 0xef4444 }
    ];

    depths.forEach(d => {
      const pin = new THREE.Mesh(
        new THREE.BoxGeometry(4.5, 0.8, 4.5),
        new THREE.MeshStandardMaterial({ color: d.color, emissive: d.color, emissiveIntensity: 0.6 })
      );
      pin.position.set(125, d.y, 125);
      this.depthLabelsGroup.add(pin);
    });

    this.worldGroup.add(this.depthLabelsGroup);
  }

  // --- Build Flowing Telemetry Data Particles ---
  buildTelemetryParticleStreams() {
    const count = 180;
    const geom = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      pos[i * 3 + 0] = (Math.random() - 0.5) * 180;
      pos[i * 3 + 1] = 4 + Math.random() * 26;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 180;
    }
    geom.setAttribute('position', new THREE.BufferAttribute(pos, 3));

    const mat = new THREE.PointsMaterial({
      color: 0x00f2fe,
      size: 2.4,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });

    this.particles = new THREE.Points(geom, mat);
    this.worldGroup.add(this.particles);
  }

  // --- Update State with Telemetry & 4D Time Slider ---
  updateState(telemetryData, timeValue = null) {
    if (timeValue !== null) this.timeValue = timeValue;
    this.currentStep = telemetryData.risk.step;
    this.riskScore = telemetryData.risk.score;

    const riskLevel = telemetryData.risk.level;
    const score = telemetryData.risk.score;
    const timeScale = this.timeValue / 50; 
    const sinkingMagnitude = (score * 18.0) * timeScale;

    // 1. Dynamic Parabolic Subsidence Sinkage across Surface Topography
    if (this.terrainGeometry && this.baseTerrainPositions) {
      const pos = this.terrainGeometry.attributes.position;
      const count = pos.count;

      for (let i = 0; i < count; i++) {
        const bx = this.baseTerrainPositions[i * 3 + 0];
        const by = this.baseTerrainPositions[i * 3 + 1];
        const bz = this.baseTerrainPositions[i * 3 + 2];

        const dx = bx - 15;
        const dz = bz - 0;
        const distSq = dx * dx + dz * dz;
        const radiusSq = 55 * 55;

        let sink = 0;
        if (distSq < radiusSq * 2.5) {
          const factor = Math.exp(-distSq / (2 * 32 * 32));
          sink = factor * sinkingMagnitude;
        }

        pos.setY(i, by - sink);
      }
      this.terrainGeometry.computeVertexNormals();
      this.terrainGeometry.attributes.position.needsUpdate = true;
    }

    // 2. Dynamic Convergence of Underground Longwall Cavern & Hydraulic Props
    const gallerySink = sinkingMagnitude * 0.75;
    this.panelMeshes.forEach(p => {
      if (p.userData.active) {
        p.position.y = p.userData.baseY - gallerySink;
      }
    });
    this.propMeshes.forEach(pr => {
      pr.position.y = pr.userData.baseY - gallerySink;
      pr.scale.set(1, Math.max(0.6, 1 - (gallerySink / 32)), 1);
    });
    if (this.continuousMiner) {
      this.continuousMiner.position.y = this.continuousMiner.userData.baseY - gallerySink;
    }

    // 3. Update Hardware Sensor Status LED Colors
    const keyColor = riskLevel === 'CRITICAL' ? 0xef4444 : (riskLevel === 'HIGH RISK' ? 0xf97316 : (riskLevel === 'CAUTION' ? 0xf59e0b : 0x10b981));

    this.nodeMeshes.forEach(mesh => {
      const isA17 = mesh.parent.userData.isA17;
      if (isA17 && this.currentStep >= 2) {
        mesh.material.color.setHex(keyColor);
        mesh.material.emissive.setHex(keyColor);
      } else if (!isA17) {
        mesh.material.color.setHex(0x10b981);
        mesh.material.emissive.setHex(0x10b981);
      }
    });

    // 4. Update Heatmap Pulsing & Scale
    if (this.heatmapMesh) {
      this.heatmapMesh.visible = this.layers.riskZones;
      this.heatmapMesh.material.color.setHex(keyColor);
      this.heatmapMesh.scale.set(1 + score * 0.5, 1 + score * 0.5, 1);
    }

    // 5. Update Surface Tension Cracks Visibility
    if (this.crackLocationsGroup) {
      this.crackLocationsGroup.visible = this.layers.crackLocations && (this.currentStep >= 3 || this.timeValue > 60);
      this.crackLocationsGroup.children.forEach(c => {
        c.scale.set(1, Math.min(3.0, 0.8 + score * 2.2), 1);
      });
    }

    // 6. Movement Vectors
    if (this.movementVectorsGroup) {
      this.movementVectorsGroup.visible = this.layers.movementVectors && this.currentStep >= 2;
    }

    // 7. Prediction Envelope
    if (this.predictionOverlay) {
      this.predictionOverlay.visible = this.layers.predictionLayer && this.timeValue > 50;
      this.predictionOverlay.position.y = 14 + (this.timeValue - 50) * 0.18;
    }
  }

  // --- Layer Visibility Toggle ---
  setLayerVisibility(layerKey, isVisible) {
    if (this.layers.hasOwnProperty(layerKey)) {
      this.layers[layerKey] = isVisible;
    }

    if (layerKey === 'sensorNodes' && this.sensorNodesGroup) this.sensorNodesGroup.visible = isVisible;
    if (layerKey === 'meshConnections' && this.meshLines) this.meshLines.visible = isVisible;
    if (layerKey === 'undergroundPanels' && this.undergroundGroup) this.undergroundGroup.visible = isVisible;
    if (layerKey === 'groundDeformation' && this.terrainMesh) this.terrainMesh.visible = isVisible;
    if (layerKey === 'movementVectors' && this.movementVectorsGroup) this.movementVectorsGroup.visible = isVisible;
    if (layerKey === 'crackLocations' && this.crackLocationsGroup) this.crackLocationsGroup.visible = isVisible;
    if (layerKey === 'predictionLayer' && this.predictionOverlay) this.predictionOverlay.visible = isVisible;
    if (layerKey === 'riskZones' && this.heatmapMesh) this.heatmapMesh.visible = isVisible;
    if (layerKey === 'drawAngle' && this.drawAngleGroup) this.drawAngleGroup.visible = isVisible;
  }

  // --- Camera View Presets ---
  setCameraPreset(preset) {
    if (preset === 'isometric') {
      // Signature 45° Geotechnical Cutaway Diorama
      this.targetCameraRadius = 245;
      this.targetCameraTheta = 42 * (Math.PI / 180);
      this.targetCameraPhi = 54 * (Math.PI / 180);
      this.targetTargetCenter.set(8, -22, 5);
    } else if (preset === 'underground') {
      // Close-up inside Subterranean Cavern & Continuous Miner Face
      this.targetCameraRadius = 110;
      this.targetCameraTheta = 28 * (Math.PI / 180);
      this.targetCameraPhi = 72 * (Math.PI / 180);
      this.targetTargetCenter.set(25, -58, 8);
    } else if (preset === 'surface') {
      // High Oblique Topographic Bird's Eye
      this.targetCameraRadius = 260;
      this.targetCameraTheta = 55 * (Math.PI / 180);
      this.targetCameraPhi = 28 * (Math.PI / 180);
      this.targetTargetCenter.set(0, 5, 0);
    } else if (preset === 'cross-section') {
      // Front Orthogonal Geotechnical Strata Cross-Section
      this.targetCameraRadius = 230;
      this.targetCameraTheta = 0;
      this.targetCameraPhi = 82 * (Math.PI / 180);
      this.targetTargetCenter.set(0, -35, 0);
    }
  }

  // --- Toggle Geological X-Ray Strata Transparency Mode ---
  toggleXRay() {
    this.isXRayMode = !this.isXRayMode;
    this.strataMaterials.forEach(m => {
      m.transparent = this.isXRayMode;
      m.opacity = this.isXRayMode ? 0.35 : 1.0;
    });
    return this.isXRayMode;
  }

  resetView() {
    this.setCameraPreset('isometric');
  }

  zoomIn() {
    this.targetCameraRadius = Math.max(60, this.cameraRadius - 35);
  }

  zoomOut() {
    this.targetCameraRadius = Math.min(550, this.cameraRadius + 35);
  }

  toggleAutoRotate() {
    this.isAutoRotating = !this.isAutoRotating;
    return this.isAutoRotating;
  }

  setTimeSlider(value) {
    this.timeValue = Number(value);
  }

  updateCameraPosition() {
    const x = this.targetCenter.x + this.cameraRadius * Math.sin(this.cameraPhi) * Math.sin(this.cameraTheta);
    const y = this.targetCenter.y + this.cameraRadius * Math.cos(this.cameraPhi);
    const z = this.targetCenter.z + this.cameraRadius * Math.sin(this.cameraPhi) * Math.cos(this.cameraTheta);
    this.camera.position.set(x, y, z);
    this.camera.lookAt(this.targetCenter);
  }

  setupInteractions() {
    const el = this.renderer.domElement;

    el.addEventListener('mousedown', (e) => {
      if (e.button === 0) this.isMouseDown = true;
      if (e.button === 2) this.isRightMouseDown = true;
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
    });

    window.addEventListener('mouseup', () => {
      this.isMouseDown = false;
      this.isRightMouseDown = false;
    });

    el.addEventListener('mousemove', (e) => {
      const dx = e.clientX - this.mouseX;
      const dy = e.clientY - this.mouseY;
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;

      if (this.isMouseDown) {
        this.targetCameraTheta -= dx * 0.008;
        this.targetCameraPhi = Math.max(0.12, Math.min(Math.PI / 2 + 0.35, this.targetCameraPhi - dy * 0.008));
      } else if (this.isRightMouseDown) {
        this.targetTargetCenter.x -= dx * 0.24;
        this.targetTargetCenter.z -= dy * 0.24;
      }
    });

    el.addEventListener('wheel', (e) => {
      e.preventDefault();
      this.targetCameraRadius = Math.max(60, Math.min(550, this.targetCameraRadius + e.deltaY * 0.18));
    }, { passive: false });

    el.addEventListener('contextmenu', (e) => e.preventDefault());

    el.addEventListener('click', (e) => {
      const rect = el.getBoundingClientRect();
      this.mouseVec.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouseVec.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      this.raycaster.setFromCamera(this.mouseVec, this.camera);
      const intersects = this.raycaster.intersectObjects(this.nodeMeshes);

      if (intersects.length > 0 && this.onNodeSelect) {
        const hit = intersects[0].object;
        this.onNodeSelect(hit.parent.userData.id);
      }
    });

    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    if (!this.container || !this.renderer || !this.camera) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    if (width === 0 || height === 0) return;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  animate() {
    this.animationFrameId = requestAnimationFrame(this.animate);

    const time = this.clock.getElapsedTime();

    // Smooth Camera Interpolation
    this.cameraRadius += (this.targetCameraRadius - this.cameraRadius) * 0.1;
    this.cameraTheta += (this.targetCameraTheta - this.cameraTheta) * 0.1;
    this.cameraPhi += (this.targetCameraPhi - this.cameraPhi) * 0.1;
    this.targetCenter.lerp(this.targetTargetCenter, 0.1);

    // Auto rotate
    if (this.isAutoRotating) {
      this.targetCameraTheta += 0.004;
    }

    this.updateCameraPosition();

    // Pithead winder wheels continuous spinning
    this.pitheadWheels.forEach(w => {
      w.rotation.x += 0.08;
    });

    // Continuous Miner Carbide Cutter Drum
    if (this.minerDrum) {
      this.minerDrum.rotation.x += 0.08;
    }

    // Moving Highway Vehicles
    if (this.carMesh && this.currentStep < 3) {
      this.carMesh.position.x = -80 + ((time * 18) % 160);
      this.carMesh.position.z = 16 + Math.sin(this.carMesh.position.x * 0.02) * 8;
    }
    if (this.truckMesh && this.currentStep < 3) {
      this.truckMesh.position.x = 80 - ((time * 12) % 160);
      this.truckMesh.position.z = 18 + Math.sin(this.truckMesh.position.x * 0.02) * 8;
    }

    // Moving Freight Train
    if (this.trainMesh && this.currentStep < 3) {
      this.trainMesh.position.x = 80 - ((time * 14) % 160);
    }

    // Master Gateway Diamond Pulse & Hover
    if (this.gatewayMesh) {
      this.gatewayMesh.rotation.y += 0.02;
      this.gatewayMesh.position.y = 29 + Math.sin(time * 2.5) * 1.4;
    }

    // Telemetry Particle Streams
    if (this.particles) {
      const pos = this.particles.geometry.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        let y = pos.getY(i) + 0.12;
        if (y > 34) y = 4;
        pos.setY(i, y);
      }
      this.particles.geometry.attributes.position.needsUpdate = true;
    }

    this.renderer.render(this.scene, this.camera);
  }

  destroy() {
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    if (this.renderer && this.renderer.domElement) {
      this.renderer.domElement.remove();
    }
  }
}
