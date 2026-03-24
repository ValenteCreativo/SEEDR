'use client';

import { useState } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { ProjectCard } from './ProjectCard';
import { ProjectDetailModal } from './ProjectDetailModal';
import { ThumbsUp, ThumbsDown, RotateCcw } from 'lucide-react';
import type { MockProject } from '@/lib/mock-data';

export function SwipeDeck({ projects }: { projects: MockProject[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [detailProject, setDetailProject] = useState<MockProject | null>(null);
  const [saved, setSaved] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const leftOpacity = useTransform(x, [-100, 0], [1, 0]);
  const rightOpacity = useTransform(x, [0, 100], [0, 1]);

  const currentProject = projects[currentIndex];
  const isFinished = currentIndex >= projects.length;

  function handleNext(direction: 'left' | 'right') {
    if (direction === 'right' && currentProject) {
      setSaved((prev) => [...prev, currentProject.id]);
    }
    animate(x, direction === 'left' ? -300 : 300, {
      duration: 0.3,
      onComplete: () => {
        setCurrentIndex((i) => i + 1);
        x.set(0);
      },
    });
  }

  function handleDragStart() {
    setIsDragging(false);
  }

  function handleDragEnd(_: any, info: { offset: { x: number }; velocity: { x: number } }) {
    if (Math.abs(info.offset.x) > 100 || Math.abs(info.velocity.x) > 500) {
      setIsDragging(true);
      handleNext(info.offset.x < 0 ? 'left' : 'right');
    } else {
      animate(x, 0, { type: 'spring', stiffness: 500, damping: 30 });
    }
  }

  if (isFinished) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center px-4">
        <p className="text-2xl font-bold text-white mb-2">
          You&apos;ve seen them all!
        </p>
        <p className="text-gray-400 mb-2">
          {saved.length} project{saved.length !== 1 ? 's' : ''} saved
        </p>
        <button
          onClick={() => {
            setCurrentIndex(0);
            setSaved([]);
          }}
          className="mt-4 px-5 py-2.5 rounded-xl bg-white/10 text-white text-sm hover:bg-white/15 transition-colors inline-flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" /> Start Over
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="relative w-full max-w-sm mx-auto h-[420px]">
        {/* Next card preview */}
        {currentIndex + 1 < projects.length && (
          <div className="absolute inset-0 scale-[0.95] opacity-50">
            <ProjectCard
              project={projects[currentIndex + 1]}
              index={currentIndex + 1}
            />
          </div>
        )}

        {/* Current card */}
        <motion.div
          className="absolute inset-0 touch-none"
          style={{ x, rotate }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.7}
          onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
          {/* Swipe indicators */}
          <motion.div
            className="absolute top-6 left-6 z-10 px-3 py-1 rounded-lg border-2 border-red-500 text-red-500 font-bold text-sm -rotate-12"
            style={{ opacity: leftOpacity }}
          >
            SKIP
          </motion.div>
          <motion.div
            className="absolute top-6 right-6 z-10 px-3 py-1 rounded-lg border-2 border-seedGreen text-seedGreen font-bold text-sm rotate-12"
            style={{ opacity: rightOpacity }}
          >
            SAVE
          </motion.div>

          <ProjectCard
            project={currentProject}
            index={currentIndex}
            onTap={() => { if (!isDragging) setDetailProject(currentProject); }}
          />
        </motion.div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-center gap-6 mt-6">
        <button
          onClick={() => handleNext('left')}
          className="w-14 h-14 rounded-full border border-red-500/30 text-red-400 flex items-center justify-center hover:bg-red-500/10 transition-colors"
        >
          <ThumbsDown className="w-5 h-5" />
        </button>
        <button
          onClick={() => handleNext('right')}
          className="w-14 h-14 rounded-full border border-seedGreen/30 text-seedGreen flex items-center justify-center hover:bg-seedGreen/10 transition-colors"
        >
          <ThumbsUp className="w-5 h-5" />
        </button>
      </div>

      <p className="text-center text-xs text-gray-500 mt-3">
        Swipe right to save, left to skip, tap to view details
      </p>

      {detailProject && (
        <ProjectDetailModal
          project={detailProject}
          onClose={() => setDetailProject(null)}
        />
      )}
    </>
  );
}
