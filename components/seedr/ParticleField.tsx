'use client';

import { useCallback, useEffect, useState } from 'react';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';

export function ParticleField() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => setReady(true));
  }, []);

  if (!ready) return null;

  return (
    <Particles
      id="seedr-particles"
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
      options={{
        fullScreen: false,
        fpsLimit: 60,
        background: { color: { value: 'transparent' } },
        particles: {
          number: { value: 90, density: { enable: true } },
          color: {
            value: ['#22c55e', '#86efac', '#ffffff', '#4ade80'],
          },
          shape: { type: 'circle' },
          opacity: {
            value: { min: 0.1, max: 0.55 },
            animation: { enable: true, speed: 0.5, sync: false },
          },
          size: {
            value: { min: 0.8, max: 2.5 },
          },
          move: {
            enable: true,
            direction: 'top' as const,
            speed: { min: 0.2, max: 1.0 },
            random: true,
            straight: false,
            outModes: { default: 'out' as const },
          },
          links: {
            enable: true,
            distance: 130,
            color: '#22c55e',
            opacity: 0.07,
            width: 1,
          },
        },
        interactivity: {
          events: {
            onHover: { enable: true, mode: 'grab' },
          },
          modes: {
            grab: {
              distance: 180,
              links: { opacity: 0.4, color: '#22c55e' },
            },
          },
        },
        detectRetina: true,
      }}
    />
  );
}
