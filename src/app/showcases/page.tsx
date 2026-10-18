'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { WorkspaceShell } from '@/components/WorkspaceShell';
import { LayoutGrid, Plus, Play, Edit3, Eye } from 'lucide-react';

interface ShowcaseSummary {
  id: string;
  title: string;
  description: string;
  layoutStyle: string;
  viewsCount: number;
  status: string;
}

export default function ShowcasesLibraryPage() {
  const router = useRouter();
  const [showcases, setShowcases] = useState<ShowcaseSummary[]>([]);

  async function loadShowcases() {
    const res = await fetch('/api/showcases');
    const data = await res.json();
    setShowcases(data.showcases || []);
  }

  useEffect(() => {
    loadShowcases();
  }, []);

  async function handleCreateShowcase() {
    const res = await fetch('/api/showcases', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'New Buyer Enablement Kit',
        description: 'Curated multi-demo collection for enterprise prospects.',
      }),
    });
    const data = await res.json();
    if (data.showcase?.id) {
      router.push(`/showcase/${data.showcase.id}/edit`);
    }
  }

  return (
    <WorkspaceShell
      title="Showcases"
      subtitle="Bundle multiple interactive Supademos and videos into a single shareable buyer kit"
      actions={
        <button
          type="button"
          onClick={handleCreateShowcase}
          className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold inline-flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" /> Create Showcase
        </button>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {showcases.map((sc) => (
          <div
            key={sc.id}
            data-testid={`showcase-card-${sc.id}`}
            className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold">
                  Layout: {sc.layoutStyle}
                </span>
                <span className="text-xs text-slate-500 inline-flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" /> {sc.viewsCount} views
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900">{sc.title}</h3>
              <p className="text-xs text-slate-500 mt-1">{sc.description}</p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <Link
                href={`/showcase/${sc.id}`}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 inline-flex items-center gap-1"
              >
                <Play className="w-3 h-3" /> View Showcase
              </Link>
              <Link
                href={`/showcase/${sc.id}/edit`}
                className="px-3.5 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold inline-flex items-center gap-1"
              >
                <Edit3 className="w-3 h-3" /> Edit Showcase
              </Link>
            </div>
          </div>
        ))}
      </div>
    </WorkspaceShell>
  );
}
