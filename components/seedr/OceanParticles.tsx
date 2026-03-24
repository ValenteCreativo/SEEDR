'use client';

import { useEffect, useState } from 'react';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';

export function StarParticles() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    initParticlesEngine(async (e) => { await loadSlim(e); }).then(() => setReady(true));
  }, []);
  if (!ready) return null;
  return (
    <Particles
      id="star-particles"
      style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}
      options={{
        fullScreen: false,
        background: { color: { value: '#000000' } },
        fpsLimit: 60,
        particles: {
          number: { value: 220, density: { enable: true } },
          color: { value: ['#ffffff', '#cce8ff', '#ffffee'] },
          shape: { type: 'circle' },
          opacity: {
            value: { min: 0.2, max: 0.9 },
            animation: { enable: true, speed: 0.3, sync: false },
          },
          size: { value: { min: 0.5, max: 1.8 } },
          move: {
            enable: true,
            speed: 0.08,
            direction: 'none' as const,
            random: true,
            straight: false,
            outModes: { default: 'out' as const },
          },
          links: { enable: false },
          // Constrain to upper 55% by position initialization
          position: { x: { min: 0, max: 100 }, y: { min: 0, max: 55 } },
        },
        detectRetina: true,
      }}
    />
  );
}

// North star — single bright point
export function NorthStar() {
  return (
    <div style={{
      position: 'fixed',
      top: '8%',
      right: '12%',
      zIndex: 2,
      pointerEvents: 'none',
      width: 6,
      height: 6,
      borderRadius: '50%',
      background: '#fff8c0',
      boxShadow: '0 0 12px 4px rgba(255,248,180,0.8), 0 0 40px 12px rgba(255,248,180,0.3)',
      animation: 'starPulse 2.4s ease-in-out infinite',
    }} />
  );
}

export function OceanParticles() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    initParticlesEngine(async (e) => { await loadSlim(e); }).then(() => setReady(true));
  }, []);
  if (!ready) return null;
  return (
    <Particles
      id="ocean-particles"
      style={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: '55%', zIndex: 2, pointerEvents: 'none' }}
      options={{
        fullScreen: false,
        background: { color: { value: 'transparent' } },
        fpsLimit: 60,
        particles: {
          number: { value: 80, density: { enable: true } },
          color: { value: ['#00e5b0', '#00c896', '#14F195', '#22d3a8', '#7fffdf'] },
          shape: { type: 'circle' },
          opacity: {
            value: { min: 0.3, max: 0.85 },
            animation: { enable: true, speed: 0.6, sync: false },
          },
          size: { value: { min: 1, max: 2.5 } },
          move: {
            enable: true,
            speed: { min: 0.4, max: 1.2 },
            direction: 'right' as const,
            random: true,
            straight: false,
            outModes: { default: 'out' as const },
            warp: false,
          },
          links: {
            enable: true,
            distance: 90,
            color: '#00e5b0',
            opacity: 0.2,
            width: 0.8,
          },
        },
        detectRetina: true,
      }}
    />
  );
}
