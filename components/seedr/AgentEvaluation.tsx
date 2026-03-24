'use client';

import { useState } from 'react';
import { Bot, CheckCircle, AlertCircle, XCircle, Clock, Loader2 } from 'lucide-react';
import type { ProjectMilestone } from '@/lib/mock-data';

interface MilestoneEval {
  milestone_title: string;
  status: 'delivered' | 'partial' | 'missed' | 'pending';
  confidence: number;
  evidence_found: string;
  agent_note: string;
}

interface EvalResult {
  overall_score: number;
  seed_score_delta: number;
  milestones: MilestoneEval[];
  verdict: string;
  recommendation: 'continue_backing' | 'hold' | 'withdraw';
  evaluated_at: string;
  model_used: string;
}

interface Props {
  project: {
    id: string;
    title: string;
    tagline: string;
    category: string;
    current_backed_sol: number;
    funding_goal_sol: number;
    agent_milestones?: ProjectMilestone[];
  };
}

const statusIcon = {
  delivered: <CheckCircle className="w-4 h-4 text-emerald-400" />,
  partial:   <AlertCircle className="w-4 h-4 text-yellow-400" />,
  missed:    <XCircle className="w-4 h-4 text-red-400" />,
  pending:   <Clock className="w-4 h-4 text-gray-400" />,
};
const statusColor = {
  delivered: 'text-emerald-400',
  partial:   'text-yellow-400',
  missed:    'text-red-400',
  pending:   'text-gray-400',
};
const recColor = {
  continue_backing: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  hold:             'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  withdraw:         'bg-red-500/20 text-red-400 border-red-500/30',
};
const recLabel = {
  continue_backing: '✅ Continue Backing',
  hold:             '⚠️ Hold',
  withdraw:         '🚨 Consider Withdrawing',
};

export function AgentEvaluation({ project }: Props) {
  const [result, setResult] = useState<EvalResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!project.agent_milestones?.length) return null;

  async function runEvaluation() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/agent/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-4 border-t border-white/5 pt-4">
      <div className="flex items-center gap-2 mb-3">
        <Bot className="w-4 h-4 text-seedGreen" />
        <span className="text-white text-sm font-semibold">Agent Evaluation</span>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-seedGreen/10 text-seedGreen border border-seedGreen/20">
          Venice LLM
        </span>
      </div>

      {/* Milestones preview */}
      {!result && (
        <div className="space-y-2 mb-3">
          {project.agent_milestones!.map((m, i) => (
            <div key={i} className="flex items-start gap-2 text-xs">
              <Clock className="w-3 h-3 text-gray-500 mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-gray-300">{m.title}</span>
                <span className="text-gray-600"> · due {m.due_date}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {!result && !loading && (
        <button onClick={runEvaluation}
          className="w-full py-2.5 rounded-xl border border-seedGreen/30 text-seedGreen text-xs font-semibold hover:bg-seedGreen/10 transition-all flex items-center justify-center gap-2">
          <Bot className="w-3.5 h-3.5" />
          Run Agent Evaluation
        </button>
      )}

      {loading && (
        <div className="flex items-center justify-center gap-2 py-4 text-xs text-gray-400">
          <Loader2 className="w-4 h-4 animate-spin text-seedGreen" />
          Agent analyzing milestones via Venice...
        </div>
      )}

      {error && (
        <p className="text-red-400 text-xs text-center py-2">{error}</p>
      )}

      {result && (
        <div className="space-y-3">
          {/* Score */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5">
            <div>
              <p className="text-white font-bold text-2xl">{result.overall_score}<span className="text-gray-500 text-sm">/100</span></p>
              <p className="text-gray-500 text-xs">Delivery Score</p>
            </div>
            <div className="text-right">
              <p className={`font-semibold text-sm ${result.seed_score_delta >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {result.seed_score_delta >= 0 ? '+' : ''}{result.seed_score_delta} Seed Score
              </p>
              <span className={`text-[10px] px-2 py-0.5 rounded-full border ${recColor[result.recommendation]}`}>
                {recLabel[result.recommendation]}
              </span>
            </div>
          </div>

          {/* Milestones */}
          <div className="space-y-2">
            {result.milestones.map((m, i) => (
              <div key={i} className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                <div className="flex items-center gap-2 mb-1">
                  {statusIcon[m.status]}
                  <span className="text-white text-xs font-medium">{m.milestone_title}</span>
                  <span className={`text-[10px] ml-auto capitalize ${statusColor[m.status]}`}>{m.status}</span>
                </div>
                <p className="text-gray-500 text-[10px] leading-relaxed">{m.agent_note}</p>
              </div>
            ))}
          </div>

          {/* Verdict */}
          <p className="text-gray-400 text-xs italic border-t border-white/5 pt-3">&ldquo;{result.verdict}&rdquo;</p>
          <p className="text-gray-700 text-[10px]">Evaluated by SeedrAgent · {result.model_used} · {new Date(result.evaluated_at).toLocaleString()}</p>
        </div>
      )}
    </div>
  );
}
