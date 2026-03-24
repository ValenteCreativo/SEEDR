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
    renderer.setClearColor(0x000000, 0); // fully transparent — particles handle bg
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 200);
    camera.position.set(0, 3, 18);
    camera.lookAt(0, 1, 0);

    scene.add(new THREE.AmbientLight(0xffffff, 1.1));
    const key = new THREE.DirectionalLight(0xaaddff, 0.8);
    key.position.set(-4, 8, 6);
    scene.add(key);

    // ── Paper boat (origami, flat shading) ─────────────────────────
    const boat = new THREE.Group();

    const white = new THREE.MeshStandardMaterial({ color: 0xf5f2ee, flatShading: true, roughness: 0.9 });
    const shadow = new THREE.MeshStandardMaterial({ color: 0xdad5cc, flatShading: true, roughness: 0.95 });

    // Hull — two wedge faces meeting at a keel
    const hullGeo = new THREE.BufferGeometry();
    hullGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([
       0,  0,    0,   // keel center
      -1.6, 0.55, -1.0,  // port stern
      -1.6, 0.55,  1.0,  // port bow
       1.6, 0.55, -1.0,  // starboard stern
       1.6, 0.55,  1.0,  // starboard bow
       0,   0.35,  1.8,  // bow tip
       0,   0.35, -1.8,  // stern tip
    ]), 3));
    hullGeo.setIndex(new THREE.BufferAttribute(new Uint16Array([
      0,2,1,  0,3,4,  0,4,2,
      0,1,3,  1,2,5,  3,4,5,
      1,3,6,  2,4,6,
    ]), 1));
    hullGeo.computeVertexNormals();
    boat.add(new THREE.Mesh(hullGeo, white));

    // Sail — origami triangle, slightly bent
    const sailGeo = new THREE.BufferGeometry();
    sailGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([
       0.05, 0.55, -0.1,  // base left
       0.05, 2.6,   0.1,  // peak
       0.05, 0.55,  1.0,  // base right
    ]), 3));
    sailGeo.setIndex(new THREE.BufferAttribute(new Uint16Array([0,1,2,2,1,0]), 1));
    sailGeo.computeVertexNormals();
    boat.add(new THREE.Mesh(sailGeo, shadow));

    // Second sail panel (fold)
    const sail2Geo = new THREE.BufferGeometry();
    sail2Geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([
      -0.05, 0.55, -0.1,
      -0.05, 2.6,   0.1,
      -0.05, 0.55,  1.0,
    ]), 3));
    sail2Geo.setIndex(new THREE.BufferAttribute(new Uint16Array([0,2,1,1,2,0]), 1));
    sail2Geo.computeVertexNormals();
    boat.add(new THREE.Mesh(sail2Geo, white));

    boat.scale.setScalar(0.7);
    boat.position.set(-10, -3.2, 0);
    scene.add(boat);

    // ── Animation ──────────────────────────────────────────────────
    const clock = new THREE.Clock();
    let raf: number;

    const animate = () => {
      raf = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      const p = progressRef.current;

      // Sail toward north star
      const tx = THREE.MathUtils.lerp(-10, 10, p);
      boat.position.x += (tx - boat.position.x) * 0.06;
      boat.rotation.z = Math.sin(t * 0.8) * 0.04;
      boat.rotation.x = Math.sin(t * 0.55) * 0.02;
      boat.position.y = -3.2 + Math.sin(t * 0.7) * 0.15;

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
