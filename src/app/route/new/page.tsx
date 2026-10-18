'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { WorkspaceShell } from '@/components/WorkspaceShell';
import { Sparkles, LayoutTemplate, GitBranch } from 'lucide-react';

export default function NewRouteWizardPage() {
  const router = useRouter();
  const [name, setName] = useState('Enterprise Demo Qualification Router');
  const [mode, setMode] = useState<'TEMPLATE' | 'SCRATCH' | 'AI'>('TEMPLATE');
  const [loading, setLoading] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/routes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          creationMode: mode,
          description: `Created via ${mode} wizard`,
        }),
      });
      const data = await res.json();
      if (data.route?.id) {
        router.push(`/route/${data.route.id}/edit`);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <WorkspaceShell
      title="Create Route Hub"
      subtitle="Choose how you want to build your buyer qualification and conditional demo routing flow"
    >
      <form
        onSubmit={handleCreate}
        className="max-w-3xl bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              id: 'TEMPLATE',
              icon: LayoutTemplate,
              title: 'Start from Template',
              desc: 'Pre-built B2B qualification form + Role/Size routing branches',
            },
            {
              id: 'SCRATCH',
              icon: GitBranch,
              title: 'Start from Scratch',
              desc: 'Blank visual canvas to wire FORM, ROUTE, and SHOWCASE nodes',
            },
            {
              id: 'AI',
              icon: Sparkles,
              title: 'Start with AI',
              desc: 'Generate qualification questions and routing rules from your ICP',
            },
          ].map((opt) => {
            const Icon = opt.icon;
            const selected = mode === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                data-testid={`route-wizard-mode-${opt.id.toLowerCase()}`}
                onClick={() => setMode(opt.id as typeof mode)}
                className={`p-4 rounded-xl border text-left transition-all ${
                  selected
                    ? 'border-indigo-600 bg-indigo-50/40 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 w-fit mb-3">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="text-sm font-bold text-slate-900">
                  {opt.title}
                </div>
                <p className="text-xs text-slate-500 mt-1">{opt.desc}</p>
              </button>
            );
          })}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Route Hub Name
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold"
        >
          {loading ? 'Creating Route Hub...' : 'Create & Open Node Canvas →'}
        </button>
      </form>
    </WorkspaceShell>
  );
}
