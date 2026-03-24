'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface NorthStarSceneProps {
  scrollProgress?: number; // 0 to 1
}

export function NorthStarScene({ scrollProgress = 0 }: NorthStarSceneProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef(scrollProgress);

  // Keep scroll ref in sync without triggering re-render
  useEffect(() => {
    scrollRef.current = scrollProgress;
  }, [scrollProgress]);

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;

    // ─── Renderer ───────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = false;
    container.appendChild(renderer.domElement);

    // ─── Scene & Camera ─────────────────────────────────────────
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 12, 55);
    camera.lookAt(0, 0, 0);

    // ─── Sky gradient background ─────────────────────────────────
    function makeSkyTexture() {
      const canvas = document.createElement('canvas');
      canvas.width = 2;
      canvas.height = 512;
      const ctx = canvas.getContext('2d')!;
      const grad = ctx.createLinearGradient(0, 0, 0, 512);
      grad.addColorStop(0, '#050810');   // top — near-black deep night
      grad.addColorStop(0.45, '#080c1a');
      grad.addColorStop(0.75, '#0a0f1a');
      grad.addColorStop(1, '#0a0f2e');   // bottom — deep ocean blue-purple
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 2, 512);
      const tex = new THREE.CanvasTexture(canvas);
      return tex;
    }
    scene.background = makeSkyTexture();

    // ─── Lighting ────────────────────────────────────────────────
    const ambientLight = new THREE.AmbientLight(0x1a1a3e, 0.6);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.2);
    dirLight.position.set(30, 40, 20);
    scene.add(dirLight);

    // North star point light — intensity updated in animation loop
    const starLight = new THREE.PointLight(0xfff8e0, 0.5, 200);
    starLight.position.set(35, 10, -30);
    scene.add(starLight);

    // ─── Ocean plane (animated waves) ───────────────────────────
    const oceanGeo = new THREE.PlaneGeometry(300, 300, 80, 80);
    oceanGeo.rotateX(-Math.PI / 2);
    const oceanMat = new THREE.MeshStandardMaterial({
      color: 0x0a0f2e,
      metalness: 0.35,
      roughness: 0.65,
      side: THREE.FrontSide,
    });
    const ocean = new THREE.Mesh(oceanGeo, oceanMat);
    ocean.position.y = 0;
    scene.add(ocean);

    // Store original Y positions for wave animation
    const posAttr = oceanGeo.attributes.position as THREE.BufferAttribute;
    const originalY = new Float32Array(posAttr.count);
    for (let i = 0; i < posAttr.count; i++) {
      originalY[i] = posAttr.getY(i);
    }

    // ─── Starfield ───────────────────────────────────────────────
    const starCount = 400;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      starPositions[i * 3]     = (Math.random() - 0.5) * 300;    // x
      starPositions[i * 3 + 1] = Math.random() * 60 + 8;         // y — upper half
      starPositions[i * 3 + 2] = (Math.random() - 0.5) * 150 - 20; // z — mostly behind camera
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0xd0e8ff,
      size: 0.4,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.85,
    });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    // ─── North Star (sprite / glowing point) ─────────────────────
    const northStarGeo = new THREE.BufferGeometry();
    northStarGeo.setAttribute(
      'position',
      new THREE.BufferAttribute(new Float32Array([35, 10, -30]), 3)
    );
    const northStarMat = new THREE.PointsMaterial({
      color: 0xfff8e0,
      size: 3.5,
      sizeAttenuation: true,
      transparent: true,
      opacity: 1,
    });
    const northStar = new THREE.Points(northStarGeo, northStarMat);
    scene.add(northStar);

    // ─── Boat group ──────────────────────────────────────────────
    const boat = new THREE.Group();

    // Hull
    const hullGeo = new THREE.BoxGeometry(4, 1, 2);
    const hullMat = new THREE.MeshStandardMaterial({ color: 0x8b5e3c });
    const hull = new THREE.Mesh(hullGeo, hullMat);
    hull.position.y = 0.5;
    boat.add(hull);

    // Mast
    const mastGeo = new THREE.CylinderGeometry(0.08, 0.08, 6, 8);
    const mastMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const mast = new THREE.Mesh(mastGeo, mastMat);
    mast.position.set(0, 4, 0);
    boat.add(mast);

    // Sail — triangle BufferGeometry
    const sailGeo = new THREE.BufferGeometry();
    const sailVerts = new Float32Array([
      0,   1,  0.1,   // bottom of mast
      0,   6.5, 0.1,  // top of mast
      2.2, 1.5, 0.1,  // outward billow
    ]);
    sailGeo.setAttribute('position', new THREE.BufferAttribute(sailVerts, 3));
    sailGeo.setIndex([0, 1, 2]);
    sailGeo.computeVertexNormals();
    const sailMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide,
    });
    const sail = new THREE.Mesh(sailGeo, sailMat);
    sail.position.set(-0.3, 1, 0);
    boat.add(sail);

    // Initial boat position (left side of scene)
    boat.position.set(-60, 0.5, 0);
    scene.add(boat);

    // ─── Wake particles ──────────────────────────────────────────
    const wakeParticles: THREE.Mesh[] = [];
    const wakeMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
    });
    for (let i = 0; i < 20; i++) {
      const wakeGeo = new THREE.SphereGeometry(0.12, 4, 4);
      const wake = new THREE.Mesh(wakeGeo, wakeMat.clone());
      scene.add(wake);
      wakeParticles.push(wake);
    }

    // ─── Bioluminescent glow (teal/cyan points near boat) ────────
    const bioCount = 30;
    const bioPosArr = new Float32Array(bioCount * 3);
    for (let i = 0; i < bioCount; i++) {
      bioPosArr[i * 3]     = (Math.random() - 0.5) * 12;
      bioPosArr[i * 3 + 1] = 0.05;
      bioPosArr[i * 3 + 2] = (Math.random() - 0.5) * 6;
    }
    const bioGeo = new THREE.BufferGeometry();
    bioGeo.setAttribute('position', new THREE.BufferAttribute(bioPosArr, 3));
    const bioMat = new THREE.PointsMaterial({
      color: 0x00ffe0,
      size: 0.3,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.7,
    });
    const bio = new THREE.Points(bioGeo, bioMat);
    scene.add(bio);

    // ─── Animation loop ──────────────────────────────────────────
    const clock = new THREE.Clock();
    let animId: number;

    function lerp(a: number, b: number, t: number) {
      return a + (b - a) * t;
    }

    function animate() {
      animId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      const sp = scrollRef.current;

      // Wave animation
      for (let i = 0; i < posAttr.count; i++) {
        const x = posAttr.getX(i);
        const z = posAttr.getZ(i);
        const wave =
          Math.sin(x * 0.15 + t * 0.7) * 0.6 +
          Math.sin(z * 0.1  + t * 0.5) * 0.4 +
          Math.sin((x + z) * 0.08 + t * 0.9) * 0.25;
        posAttr.setY(i, originalY[i] + wave);
      }
      posAttr.needsUpdate = true;
      oceanGeo.computeVertexNormals();

      // North star pulse
      const pulse = 0.8 + Math.sin(t * 1.2) * 0.2;
      northStarMat.size = 3.5 * pulse + sp * 2;
      northStarMat.opacity = lerp(0.85, 1, sp);

      // Star light intensity with scroll
      starLight.intensity = lerp(0.3, 1.4, sp);

      // Stars parallax
      stars.position.x = sp * -6;
      stars.position.y = sp * -2;

      // Boat advance: lerp x from -60 to +20
      const targetX = lerp(-60, 20, sp);
      boat.position.x += (targetX - boat.position.x) * 0.08;
      // Gentle rocking
      boat.rotation.z = Math.sin(t * 0.8) * 0.03;
      boat.rotation.x = Math.sin(t * 0.5) * 0.012;

      // Wake particles trail behind boat
      for (let i = 0; i < wakeParticles.length; i++) {
        const offset = i * 0.7 + 1;
        wakeParticles[i].position.set(
          boat.position.x - offset,
          0.08 + Math.sin(t * 2 + i) * 0.05,
          boat.position.z + (Math.random() - 0.5) * 0.04
        );
        const dist = offset / (wakeParticles.length * 0.7);
        (wakeParticles[i].material as THREE.MeshBasicMaterial).opacity =
          Math.max(0, 0.55 - dist * 0.5);
      }

      // Bioluminescence follows boat
      bio.position.x = boat.position.x;
      bio.position.z = boat.position.z;
      bioMat.opacity = 0.4 + Math.sin(t * 1.5) * 0.3;

      renderer.render(scene, camera);
    }

    animate();

    // ─── Resize handler ──────────────────────────────────────────
    function onResize() {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    }
    window.addEventListener('resize', onResize);

    // ─── Cleanup ─────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      // dispose geometries / materials
      [oceanGeo, starGeo, northStarGeo, hullGeo, mastGeo, sailGeo, bioGeo].forEach(g => g.dispose());
      [oceanMat, starMat, northStarMat, hullMat, mastMat, sailMat, bioMat, wakeMat].forEach(m => m.dispose());
      wakeParticles.forEach(w => {
        w.geometry.dispose();
        (w.material as THREE.Material).dispose();
      });
    };
  }, []); // run once

  return (
    <div
      ref={mountRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: -1,
        pointerEvents: 'none',
        width: '100%',
        height: '100%',
      }}
    />
  );
}
