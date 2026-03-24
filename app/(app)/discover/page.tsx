'use client';

import { useEffect, useState } from 'react';
import { SwipeDeck } from '@/components/seedr/SwipeDeck';
import type { MockProject } from '@/lib/mock-data';
import { Loader2 } from 'lucide-react';

export default function DiscoverPage() {
  const [projects, setProjects] = useState<MockProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/projects')
      .then((r) => r.json())
      .then((data) => { const p = data.projects || data || []; setProjects([...p].sort(() => Math.random() - 0.5)); })
      .catch(() => setProjects([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Discover</h1>
        <p className="text-sm text-gray-400">
          Swipe through projects. Find what inspires you.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-[50vh]">
          <Loader2 className="w-6 h-6 text-seedGreen animate-spin" />
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          No projects found
        </div>
      ) : (
        <SwipeDeck projects={projects} />
      )}
    </div>
  );
}
