'use client';

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { Loader2, Plus, Trash2 } from 'lucide-react';

interface MilestoneInput {
  title: string;
  description: string;
}

interface BenefitInput {
  title: string;
  description: string;
}

export function CreateProjectForm({ onCreated }: { onCreated?: () => void }) {
  const wallet = useWallet();
  const { setVisible } = useWalletModal();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [title, setTitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [fundingGoalSol, setFundingGoalSol] = useState('10');
  const [milestones, setMilestones] = useState<MilestoneInput[]>([
    { title: '', description: '' },
  ]);
  const [benefits, setBenefits] = useState<BenefitInput[]>([
    { title: '', description: '' },
  ]);

  function addMilestone() {
    setMilestones((m) => [...m, { title: '', description: '' }]);
  }
  function removeMilestone(i: number) {
    setMilestones((m) => m.filter((_, idx) => idx !== i));
  }
  function addBenefit() {
    setBenefits((b) => [...b, { title: '', description: '' }]);
  }
  function removeBenefit(i: number) {
    setBenefits((b) => b.filter((_, idx) => idx !== i));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!wallet.connected || !wallet.publicKey) {
      setVisible(true);
      return;
    }
    if (!title || !tagline || !description) {
      setError('Please fill in title, tagline, and description');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          tagline,
          description,
          category,
          fundingGoalSol: parseFloat(fundingGoalSol) || 10,
          milestones: milestones.filter((m) => m.title),
          benefits: benefits.filter((b) => b.title),
          creatorWalletAddress: wallet.publicKey!.toBase58(),
        }),
      });

      if (!res.ok) throw new Error('Failed to create project');
      setSuccess(true);
      onCreated?.();
    } catch (e: any) {
      setError(e?.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="text-center py-10">
        <h3 className="text-xl font-bold text-white mb-2">Project Created!</h3>
        <p className="text-gray-400 text-sm mb-4">
          Your project is now live for backers to discover.
        </p>
        <button
          onClick={() => {
            setSuccess(false);
            setTitle('');
            setTagline('');
            setDescription('');
            setCategory('');
            setFundingGoalSol('10');
            setMilestones([{ title: '', description: '' }]);
            setBenefits([{ title: '', description: '' }]);
          }}
          className="px-5 py-2.5 rounded-xl bg-white/10 text-white text-sm hover:bg-white/15 transition-colors"
        >
          Create Another
        </button>
      </div>
    );
  }

  const inputCls =
    'w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-seedGreen placeholder:text-gray-600';

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-xs text-gray-400 mb-1.5">
          Project Title *
        </label>
        <input
          className={inputCls}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. My Awesome Project"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1.5">
          Tagline *
        </label>
        <input
          className={inputCls}
          value={tagline}
          onChange={(e) => setTagline(e.target.value)}
          placeholder="One-line description"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1.5">
          Description *
        </label>
        <textarea
          className={inputCls + ' h-28 resize-none'}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Tell backers about your project..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-gray-400 mb-1.5">
            Category
          </label>
          <select
            className={inputCls}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">Select</option>
            <option>EdTech</option>
            <option>Marketplace</option>
            <option>Climate/IoT</option>
            <option>Creative/AI</option>
            <option>Hardware</option>
            <option>Productivity</option>
            <option>DeFi</option>
            <option>Social</option>
            <option>Other</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1.5">
            Funding Goal (SOL)
          </label>
          <input
            type="number"
            className={inputCls}
            value={fundingGoalSol}
            onChange={(e) => setFundingGoalSol(e.target.value)}
            min="1"
            step="1"
          />
        </div>
      </div>

      {/* Milestones */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
            Milestones
          </label>
          <button
            type="button"
            onClick={addMilestone}
            className="text-xs text-seedGreen hover:underline inline-flex items-center gap-1"
          >
            <Plus className="w-3 h-3" /> Add
          </button>
        </div>
        {milestones.map((ms, i) => (
          <div key={i} className="flex gap-2 mb-2">
            <input
              className={inputCls + ' flex-1'}
              placeholder={`Milestone ${i + 1} title`}
              value={ms.title}
              onChange={(e) => {
                const next = [...milestones];
                next[i] = { ...next[i], title: e.target.value };
                setMilestones(next);
              }}
            />
            {milestones.length > 1 && (
              <button
                type="button"
                onClick={() => removeMilestone(i)}
                className="text-gray-500 hover:text-red-400"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Benefits */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
            Supporter Benefits
          </label>
          <button
            type="button"
            onClick={addBenefit}
            className="text-xs text-seedGreen hover:underline inline-flex items-center gap-1"
          >
            <Plus className="w-3 h-3" /> Add
          </button>
        </div>
        {benefits.map((b, i) => (
          <div key={i} className="flex gap-2 mb-2">
            <input
              className={inputCls + ' flex-1'}
              placeholder={`Benefit ${i + 1} title`}
              value={b.title}
              onChange={(e) => {
                const next = [...benefits];
                next[i] = { ...next[i], title: e.target.value };
                setBenefits(next);
              }}
            />
            {benefits.length > 1 && (
              <button
                type="button"
                onClick={() => removeBenefit(i)}
                className="text-gray-500 hover:text-red-400"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 rounded-xl bg-seedGreen text-black font-semibold text-sm hover:bg-green-400 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" /> Creating...
          </>
        ) : wallet.connected ? (
          'Create Project'
        ) : (
          'Connect Wallet to Create'
        )}
      </button>
    </form>
  );
}
