'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface Props {
  scrollProgress: number;
}

export default function NorthStarScene({ scrollProgress }: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(scrollProgress);

  useEffect(() => {
    progressRef.current = scrollProgress;
  }, [scrollProgress]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // ── Renderer ────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setClearColor(0x0b1026, 1);
    mount.appendChild(renderer.domElement);

    // ── Scene / Camera ──────────────────────────────────────────────
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 500);
    camera.position.set(0, 8, 30);
    camera.lookAt(0, 2, 0);

    // ── Lights ──────────────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0xc8d8ff, 0.9));
    const moonLight = new THREE.DirectionalLight(0xddeeff, 0.6);
    moonLight.position.set(-10, 20, 10);
    scene.add(moonLight);

    // ── Sky gradient background (canvas texture) ────────────────────
    const bgCanvas = document.createElement('canvas');
    bgCanvas.width = 2; bgCanvas.height = 256;
    const bgCtx = bgCanvas.getContext('2d')!;
    const grad = bgCtx.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, '#060d1f');   // near-black top
    grad.addColorStop(0.5, '#0b1a3a'); // deep blue mid
    grad.addColorStop(1, '#112244');   // slightly lighter at horizon
    bgCtx.fillStyle = grad;
    bgCtx.fillRect(0, 0, 2, 256);
    scene.background = new THREE.CanvasTexture(bgCanvas);

    // ── Stars ───────────────────────────────────────────────────────
    const starCount = 280;
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      starPos[i * 3]     = (Math.random() - 0.5) * 200;
      starPos[i * 3 + 1] = Math.random() * 40 + 5;
      starPos[i * 3 + 2] = (Math.random() - 0.5) * 80 - 20;
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.18, sizeAttenuation: true, transparent: true, opacity: 0.85 }));
    scene.add(stars);

    // ── North Star ──────────────────────────────────────────────────
    const northStarGeo = new THREE.BufferGeometry();
    northStarGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([18, 22, -40]), 3));
    const northStar = new THREE.Points(northStarGeo, new THREE.PointsMaterial({ color: 0xfff8d0, size: 1.2, sizeAttenuation: true }));
    scene.add(northStar);

    // ── Ocean waves (low poly, stays at bottom) ─────────────────────
    const waveW = 80, waveD = 20, wSeg = 40, dSeg = 10;
    const waveGeo = new THREE.PlaneGeometry(waveW, waveD, wSeg, dSeg);
    waveGeo.rotateX(-Math.PI / 2);
    const waveMat = new THREE.MeshStandardMaterial({
      color: 0x1a3a6e,
      metalness: 0.05,
      roughness: 0.85,
      transparent: true,
      opacity: 0.92,
    });
    const ocean = new THREE.Mesh(waveGeo, waveMat);
    ocean.position.y = -3;
    scene.add(ocean);

    // Store original vertex Y positions
    const posAttr = waveGeo.attributes.position as THREE.BufferAttribute;
    const baseY = new Float32Array(posAttr.count);
    for (let i = 0; i < posAttr.count; i++) baseY[i] = posAttr.getY(i);

    // ── Paper Boat (origami-style, flat shading) ────────────────────
    const boatGroup = new THREE.Group();
    const paperMat = new THREE.MeshStandardMaterial({
      color: 0xf5f0e8,
      flatShading: true,
      roughness: 0.95,
      metalness: 0,
    });
    const foldMat = new THREE.MeshStandardMaterial({
      color: 0xddd8cc,
      flatShading: true,
      roughness: 0.95,
    });

    // Hull — flat folded paper shape (two triangular wedges)
    const hullGeo = new THREE.BufferGeometry();
    const hullVerts = new Float32Array([
      // bottom center crease
       0,  0,  0,
      // port side
      -2, 0.6, -1.2,
      -2, 0.6,  1.2,
      // starboard side
       2, 0.6, -1.2,
       2, 0.6,  1.2,
      // bow point
       0, 0.3,  2,
      // stern point
       0, 0.3, -2,
    ]);
    const hullIdx = new Uint16Array([
      0,1,2,  // port face
      0,3,4,  // starboard face
      0,2,4,  // bottom
      0,1,3,  // back crease
      1,2,5,  // port bow
      3,4,5,  // starboard bow
      1,3,6,  // stern port
      2,4,6,  // stern starboard (unused, ok)
    ]);
    hullGeo.setAttribute('position', new THREE.BufferAttribute(hullVerts, 3));
    hullGeo.setIndex(new THREE.BufferAttribute(hullIdx, 1));
    hullGeo.computeVertexNormals();
    boatGroup.add(new THREE.Mesh(hullGeo, paperMat));

    // Sail — single folded triangle
    const sailGeo = new THREE.BufferGeometry();
    sailGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([
       0, 0,    0,   // base left
       0, 2.4,  0,   // peak
       0, 0,    1.0, // base right
    ]), 3));
    sailGeo.setIndex(new THREE.BufferAttribute(new Uint16Array([0,1,2, 2,1,0]), 1));
    sailGeo.computeVertexNormals();
    const sailMesh = new THREE.Mesh(sailGeo, foldMat);
    sailMesh.position.set(0, 0.65, -0.2);
    boatGroup.add(sailMesh);

    // Crease line on sail
    const creaseGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0.65, -0.2),
      new THREE.Vector3(0, 3.1, -0.2),
    ]);
    boatGroup.add(new THREE.Line(creaseGeo, new THREE.LineBasicMaterial({ color: 0xbbaa99, transparent: true, opacity: 0.5 })));

    boatGroup.scale.setScalar(0.55);
    boatGroup.position.set(-18, -1.5, 8);
    scene.add(boatGroup);

    // ── Land silhouette (second page "arrival") ──────────────────────
    const landGeo = new THREE.BufferGeometry();
    landGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([
      12, -3, -5,   18, 2, -5,   24, -1, -5,
      28, -3, -5,   12, -3, -5,
      18, 2,  -5,   22, 3.5, -5, 26, 1, -5,
    ]), 3));
    const landMat = new THREE.LineBasicMaterial({ color: 0x1a3320, transparent: true, opacity: 0.0 });
    const land = new THREE.Line(landGeo, landMat);
    scene.add(land);

    // ── Foam particles near boat ─────────────────────────────────────
    const foamCount = 24;
    const foamPos = new Float32Array(foamCount * 3);
    for (let i = 0; i < foamCount; i++) {
      foamPos[i * 3]     = (Math.random() - 0.5) * 6;
      foamPos[i * 3 + 1] = 0;
      foamPos[i * 3 + 2] = (Math.random() - 0.5) * 4 + 8;
    }
    const foamGeo = new THREE.BufferGeometry();
    foamGeo.setAttribute('position', new THREE.BufferAttribute(foamPos, 3));
    const foam = new THREE.Points(foamGeo, new THREE.PointsMaterial({ color: 0xaaccff, size: 0.12, transparent: true, opacity: 0.5 }));
    scene.add(foam);

    // ── Animation loop ───────────────────────────────────────────────
    const clock = new THREE.Clock();
    let frameId: number;

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      const p = progressRef.current;

      // Animate ocean vertices
      for (let i = 0; i < posAttr.count; i++) {
        const x = posAttr.getX(i);
        const z = posAttr.getZ(i);
        posAttr.setY(i, baseY[i] + Math.sin(x * 0.4 + t * 1.2) * 0.25 + Math.sin(z * 0.6 + t * 0.8) * 0.15);
      }
      posAttr.needsUpdate = true;
      waveGeo.computeVertexNormals();

      // Boat position — moves right as scroll progresses
      const targetX = THREE.MathUtils.lerp(-18, 14, p);
      boatGroup.position.x += (targetX - boatGroup.position.x) * 0.08;

      // Gentle rocking
      boatGroup.rotation.z = Math.sin(t * 0.9) * 0.04;
      boatGroup.rotation.x = Math.sin(t * 0.6) * 0.02;
      boatGroup.position.y = -1.5 + Math.sin(t * 0.7) * 0.12;

      // Foam follows boat
      foam.position.x = boatGroup.position.x;
      foam.position.y = boatGroup.position.y + 1.5;

      // North star pulse
      (northStar.material as THREE.PointsMaterial).size = 1.2 + Math.sin(t * 1.5) * 0.3 + p * 0.6;
      (northStar.material as THREE.PointsMaterial).opacity = 0.7 + p * 0.3;

      // Land fades in on scroll progress
      (land.material as THREE.LineBasicMaterial).opacity = Math.max(0, (p - 0.6) * 2.5);

      // Stars subtle parallax
      stars.position.x = p * -3;

      renderer.render(scene, camera);
    };
    animate();

    // ── Resize ───────────────────────────────────────────────────────
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}
    />
  );
}
