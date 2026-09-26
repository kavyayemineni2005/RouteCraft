import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const Hero3DVisual = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 480;
    const height = container.clientHeight || 420;

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050508, 0.04);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 10, 22);
    camera.lookAt(0, 0, 0);

    // 2. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // 3. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0x10b981, 2.5);
    mainLight.position.set(10, 20, 15);
    scene.add(mainLight);

    const amberLight = new THREE.PointLight(0xf59e0b, 3, 30);
    amberLight.position.set(-8, 6, 8);
    scene.add(amberLight);

    const cyanLight = new THREE.PointLight(0x06b6d4, 3, 30);
    cyanLight.position.set(8, 4, -5);
    scene.add(cyanLight);

    // 4. Curved Road Curve & Geometry
    const curvePoints = [
      new THREE.Vector3(-10, -1.5, -8),
      new THREE.Vector3(-6, -0.5, -2),
      new THREE.Vector3(-2, 0.5, 4),
      new THREE.Vector3(3, 0, 1),
      new THREE.Vector3(7, -0.8, -4),
      new THREE.Vector3(11, -1.2, -7),
    ];
    const roadCurve = new THREE.CatmullRomCurve3(curvePoints);
    roadCurve.curveType = 'centripetal';

    // Road Ribbon
    const roadGeometry = new THREE.TubeGeometry(roadCurve, 100, 0.9, 12, false);
    const roadMaterial = new THREE.MeshStandardMaterial({
      color: 0x18181b,
      roughness: 0.4,
      metalness: 0.6,
    });
    const roadMesh = new THREE.Mesh(roadGeometry, roadMaterial);
    scene.add(roadMesh);

    // Glowing Neon Center Line
    const centerLineGeometry = new THREE.TubeGeometry(roadCurve, 100, 0.08, 8, false);
    const centerLineMaterial = new THREE.MeshBasicMaterial({
      color: 0x10b981,
    });
    const centerLineMesh = new THREE.Mesh(centerLineGeometry, centerLineMaterial);
    centerLineMesh.position.y += 0.05;
    scene.add(centerLineMesh);

    // 5. Stylized Road Trip Vehicle (Car & Glow)
    const carGroup = new THREE.Group();
    
    // Vehicle Body
    const bodyGeo = new THREE.BoxGeometry(1.2, 0.45, 0.7);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      roughness: 0.2,
      metalness: 0.8,
    });
    const carBody = new THREE.Mesh(bodyGeo, bodyMat);
    carGroup.add(carBody);

    // Vehicle Cabin / Windshield
    const cabinGeo = new THREE.BoxGeometry(0.65, 0.35, 0.55);
    const cabinMat = new THREE.MeshStandardMaterial({
      color: 0x09090b,
      roughness: 0.1,
      metalness: 0.9,
    });
    const cabin = new THREE.Mesh(cabinGeo, cabinMat);
    cabin.position.set(-0.05, 0.35, 0);
    carGroup.add(cabin);

    // Headlights (Cyan/Emerald Glow)
    const headLightGeo = new THREE.SphereGeometry(0.1, 8, 8);
    const headLightMat = new THREE.MeshBasicMaterial({ color: 0x34d399 });
    const hlLeft = new THREE.Mesh(headLightGeo, headLightMat);
    hlLeft.position.set(0.6, 0.05, 0.25);
    const hlRight = new THREE.Mesh(headLightGeo, headLightMat);
    hlRight.position.set(0.6, 0.05, -0.25);
    carGroup.add(hlLeft, hlRight);

    // Taillights (Vibrant Amber/Red)
    const tailLightGeo = new THREE.SphereGeometry(0.08, 8, 8);
    const tailLightMat = new THREE.MeshBasicMaterial({ color: 0xf43f5e });
    const tlLeft = new THREE.Mesh(tailLightGeo, tailLightMat);
    tlLeft.position.set(-0.6, 0.05, 0.22);
    const tlRight = new THREE.Mesh(tailLightGeo, tailLightMat);
    tlRight.position.set(-0.6, 0.05, -0.22);
    carGroup.add(tlLeft, tlRight);

    scene.add(carGroup);

    // 6. Floating Waypoint Location Pins
    const pinGroup = new THREE.Group();
    const pinPositions = [0.15, 0.45, 0.75, 0.95];
    const pinColors = [0x10b981, 0xf59e0b, 0x06b6d4, 0xec4899];
    const pins = [];

    pinPositions.forEach((t, i) => {
      const pinSubGroup = new THREE.Group();
      const pt = roadCurve.getPointAt(t);

      // Pin Head (Octahedron crystal)
      const pinHeadGeo = new THREE.OctahedronGeometry(0.45, 0);
      const pinHeadMat = new THREE.MeshStandardMaterial({
        color: pinColors[i],
        emissive: pinColors[i],
        emissiveIntensity: 0.6,
        roughness: 0.1,
        metalness: 0.8,
      });
      const pinHead = new THREE.Mesh(pinHeadGeo, pinHeadMat);
      pinHead.position.set(0, 1.2, 0);
      pinSubGroup.add(pinHead);

      // Pin Stalk / Beam
      const stalkGeo = new THREE.CylinderGeometry(0.02, 0.02, 1.2, 8);
      const stalkMat = new THREE.MeshBasicMaterial({ color: pinColors[i], transparent: true, opacity: 0.7 });
      const stalk = new THREE.Mesh(stalkGeo, stalkMat);
      stalk.position.set(0, 0.6, 0);
      pinSubGroup.add(stalk);

      // Ground Ripple Ring
      const ringGeo = new THREE.RingGeometry(0.2, 0.35, 16);
      const ringMat = new THREE.MeshBasicMaterial({ color: pinColors[i], side: THREE.DoubleSide, transparent: true, opacity: 0.5 });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.set(0, 0.02, 0);
      pinSubGroup.add(ring);

      pinSubGroup.position.copy(pt);
      pinGroup.add(pinSubGroup);
      pins.push({ group: pinSubGroup, head: pinHead, initialY: pt.y, baseT: t });
    });
    scene.add(pinGroup);

    // 7. Futuristic Orbit Compass Rings
    const compassGroup = new THREE.Group();
    const outerRingGeo = new THREE.TorusGeometry(8.5, 0.04, 16, 80);
    const outerRingMat = new THREE.MeshBasicMaterial({ color: 0x3f3f46, transparent: true, opacity: 0.4 });
    const outerRing = new THREE.Mesh(outerRingGeo, outerRingMat);
    outerRing.rotation.x = Math.PI / 2.2;
    compassGroup.add(outerRing);

    const innerRingGeo = new THREE.TorusGeometry(6.5, 0.03, 16, 60);
    const innerRingMat = new THREE.MeshBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.3 });
    const innerRing = new THREE.Mesh(innerRingGeo, innerRingMat);
    innerRing.rotation.x = Math.PI / 2.4;
    compassGroup.add(innerRing);

    scene.add(compassGroup);

    // 8. Particle Stars / Waypoint Dust
    const particleCount = 180;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 35;
      particlePositions[i + 1] = (Math.random() - 0.5) * 20;
      particlePositions[i + 2] = (Math.random() - 0.5) * 25;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    const particleMat = new THREE.PointsMaterial({
      color: 0x10b981,
      size: 0.12,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // 9. Interactive Mouse Parallax
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (event) => {
      const rect = container.getBoundingClientRect();
      const x = event.clientX - rect.left - width / 2;
      const y = event.clientY - rect.top - height / 2;
      targetX = (x / width) * 2.5;
      targetY = (y / height) * 2.5;
    };

    container.addEventListener('mousemove', handleMouseMove);

    // 10. Animation Loop
    let carProgress = 0;
    let animationFrameId;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth mouse lerp
      mouseX += (targetX - mouseX) * 0.05;
      mouseY += (targetY - mouseY) * 0.05;

      camera.position.x = mouseX * 3;
      camera.position.y = 10 - mouseY * 2;
      camera.lookAt(0, 0, 0);

      // Car along road path
      carProgress = (carProgress + 0.0022) % 1;
      const carPos = roadCurve.getPointAt(carProgress);
      const carTangent = roadCurve.getTangentAt(carProgress).normalize();

      carGroup.position.copy(carPos);
      carGroup.position.y += 0.35; // slight hover over tube

      // Orient car facing direction of travel
      const targetVec = carPos.clone().add(carTangent);
      carGroup.lookAt(targetVec);

      // Pins hover & rotate
      pins.forEach((pin, idx) => {
        pin.head.rotation.y += 0.03;
        pin.head.rotation.x = Math.sin(elapsedTime * 2 + idx) * 0.2;
        pin.group.position.y = pin.initialY + Math.sin(elapsedTime * 2.5 + idx * 1.5) * 0.15;
      });

      // Compass rings subtle rotation
      outerRing.rotation.z += 0.0015;
      innerRing.rotation.z -= 0.002;

      // Particle subtle wave
      particles.rotation.y = elapsedTime * 0.02;

      renderer.render(scene, camera);
    };

    animate();

    // 11. Responsive Resize
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      container.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-[380px] sm:h-[440px] md:h-[480px] rounded-3xl overflow-hidden bg-gradient-to-b from-zinc-950/80 via-zinc-900/40 to-black/90 border border-zinc-800/80 shadow-2xl backdrop-blur-xl flex items-center justify-center group">
      {/* 3D Canvas Mount */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Floating UI Badges */}
      <div className="absolute top-4 left-4 pointer-events-none flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/80 backdrop-blur-md border border-emerald-500/30 text-emerald-400 text-[11px] font-bold shadow-lg">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          Live 3D Route Engine
        </span>
      </div>

      <div className="absolute bottom-4 right-4 pointer-events-none flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/80 backdrop-blur-md border border-zinc-800 text-zinc-400 text-[10px] font-semibold shadow-lg">
          Interactive Parallax • 60 FPS
        </span>
      </div>
    </div>
  );
};

export default Hero3DVisual;
