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

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 200);
    camera.position.set(0, 2, 14);
    camera.lookAt(0, 0, 0);

    scene.add(new THREE.AmbientLight(0xffffff, 1.2));
    const sun = new THREE.DirectionalLight(0xfff0dd, 0.9);
    sun.position.set(3, 6, 5);
    scene.add(sun);
    const fill = new THREE.DirectionalLight(0xaaccff, 0.4);
    fill.position.set(-3, 2, -2);
    scene.add(fill);

    const paper = new THREE.MeshStandardMaterial({ color: 0xf8f4ec, flatShading: true, roughness: 0.9, metalness: 0 });
    const fold  = new THREE.MeshStandardMaterial({ color: 0xe0dac8, flatShading: true, roughness: 0.9, metalness: 0 });

    const boat = new THREE.Group();

    // ── Hull — proper boat shape (tapered at bow & stern) ──────────
    const hGeo = new THREE.BufferGeometry();
    // 12 vertices: 6 top (rim), 6 bottom (keel)
    const hv = new Float32Array([
      // top rim (6 points — hex-ish, pointed bow/stern)
       0,    0.9,  2.4,   // 0 bow tip
       1.1,  0.9,  1.0,   // 1 bow-port
       1.1,  0.9, -1.0,   // 2 stern-port
       0,    0.9, -2.4,   // 3 stern tip
      -1.1,  0.9, -1.0,   // 4 stern-starboard
      -1.1,  0.9,  1.0,   // 5 bow-starboard
      // bottom keel (narrower)
       0,    0,    1.8,   // 6
       0.5,  0,    0.7,   // 7
       0.5,  0,   -0.7,   // 8
       0,    0,   -1.8,   // 9
      -0.5,  0,   -0.7,   // 10
      -0.5,  0,    0.7,   // 11
    ]);
    const hi = new Uint16Array([
      // top face (deck — open boat, no deck needed)
      // sides: each quad as 2 triangles
      0,1,6,   1,7,6,
      1,2,7,   2,8,7,
      2,3,8,   3,9,8,
      3,4,9,   4,10,9,
      4,5,10,  5,11,10,
      5,0,11,  0,6,11,
      // bottom keel
      6,7,11,  7,10,11,
      7,8,10,  8,9,10,
    ]);
    hGeo.setAttribute('position', new THREE.BufferAttribute(hv, 3));
    hGeo.setIndex(new THREE.BufferAttribute(hi, 1));
    hGeo.computeVertexNormals();
    boat.add(new THREE.Mesh(hGeo, paper));

    // ── Sail — tall clean triangle ──────────────────────────────────
    const sGeo = new THREE.BufferGeometry();
    sGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([
       0.05, 0.9,  0.8,  // base front
       0.05, 0.9, -0.6,  // base back
       0.05, 3.2,  0.1,  // peak
    ]), 3));
    sGeo.setIndex(new THREE.BufferAttribute(new Uint16Array([0,2,1, 1,2,0]), 1));
    sGeo.computeVertexNormals();
    boat.add(new THREE.Mesh(sGeo, fold));

    // Sail back face
    const sGeo2 = new THREE.BufferGeometry();
    sGeo2.setAttribute('position', new THREE.BufferAttribute(new Float32Array([
      -0.05, 0.9,  0.8,
      -0.05, 0.9, -0.6,
      -0.05, 3.2,  0.1,
    ]), 3));
    sGeo2.setIndex(new THREE.BufferAttribute(new Uint16Array([0,1,2, 2,1,0]), 1));
    sGeo2.computeVertexNormals();
    boat.add(new THREE.Mesh(sGeo2, paper));

    // Mast line
    const mastGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0.9, 0.1),
      new THREE.Vector3(0, 3.3, 0.1),
    ]);
    boat.add(new THREE.Line(mastGeo, new THREE.LineBasicMaterial({ color: 0xccbba0 })));

    boat.scale.setScalar(0.5);
    boat.rotation.y = Math.PI / 2;   // face sideways — sailing left → right
    boat.position.set(-7, -3.6, 0);
    scene.add(boat);

    // ── Animate ──────────────────────────────────────────────────────
    const clock = new THREE.Clock();
    let raf: number;
    const animate = () => {
      raf = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      const p = progressRef.current;

      const tx = THREE.MathUtils.lerp(-7, 13, p);
      boat.position.x += (tx - boat.position.x) * 0.05;
      boat.rotation.z = Math.sin(t * 0.7) * 0.05;
      boat.rotation.x = Math.sin(t * 0.5) * 0.015;
      boat.position.y = -3.6 + Math.sin(t * 0.8) * 0.12;

      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} style={{ position: 'fixed', inset: 0, zIndex: 1, pointerEvents: 'none' }} />;
}
