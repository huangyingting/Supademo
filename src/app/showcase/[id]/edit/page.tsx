'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { WorkspaceShell } from '@/components/WorkspaceShell';
import { Play, Plus, ArrowLeft } from 'lucide-react';

interface ShowcaseSection {
  id: string;
  title: string;
  items: Array<{ type: string; id: string; title: string }>;
}

interface ShowcaseDetail {
  id: string;
  title: string;
  description: string;
  layoutStyle: string;
  themeMode: string;
  ctaLabel: string;
  ctaUrl: string;
  sectionsJson: string;
}

export default function ShowcaseEditorPage() {
  const params = useParams<{ id: string }>();
  const showcaseId = params.id;
  const [showcase, setShowcase] = useState<ShowcaseDetail | null>(null);
  const [sections, setSections] = useState<ShowcaseSection[]>([]);
  const [savedNotice, setSavedNotice] = useState('');

  useEffect(() => {
    fetch(`/api/showcases/${showcaseId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.showcase) {
          setShowcase(d.showcase);
          try {
            setSections(JSON.parse(d.showcase.sectionsJson || '[]'));
          } catch {
            setSections([]);
          }
        }
      });
  }, [showcaseId]);

  async function saveShowcase(patch: Partial<ShowcaseDetail>, nextSections?: ShowcaseSection[]) {
    if (!showcase) return;
    const updated = {
      ...showcase,
      ...patch,
      sectionsJson: nextSections ? JSON.stringify(nextSections) : showcase.sectionsJson,
    };
    setShowcase(updated);
    if (nextSections) setSections(nextSections);

    await fetch(`/api/showcases/${showcase.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    });
    setSavedNotice('Saved Showcase!');
    setTimeout(() => setSavedNotice(''), 2000);
  }

  function addSection() {
    const next = [
      ...sections,
      {
        id: `sec-${Date.now()}`,
        title: `${sections.length + 1}. New Enablement Section`,
        items: [
          {
            type: 'DEMO',
            id: 'cmvdpmcll02wb090j10dbikms',
            title: 'Build & Share Interactive Product Demos with Supademo',
          },
        ],
      },
    ];
    saveShowcase({}, next);
  }

  if (!showcase) {
    return (
      <WorkspaceShell title="Showcase Editor">
        <div className="p-8 text-sm text-slate-500">Loading Showcase...</div>
      </WorkspaceShell>
    );
  }

  return (
    <WorkspaceShell
      title={`Showcase Editor: ${showcase.title}`}
      subtitle="Organize multi-demo sections, choose Top Bar or Sidebar layout, and customize buyer CTAs"
      actions={
        <div className="flex items-center gap-2">
          <Link
            href="/showcases"
            className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </Link>
          <Link
            href={`/showcase/${showcase.id}`}
            className="px-3.5 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold inline-flex items-center gap-1.5"
          >
            <Play className="w-3.5 h-3.5" /> Preview Showcase
          </Link>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">
              Showcase Settings &amp; Layout
            </h2>
            {savedNotice && (
              <span className="text-xs font-semibold text-emerald-600">
                {savedNotice}
              </span>
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Showcase Title
            </label>
            <input
              type="text"
              value={showcase.title}
              onChange={(e) => saveShowcase({ title: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Navigation Layout Style
            </label>
            <select
              value={showcase.layoutStyle}
              onChange={(e) => saveShowcase({ layoutStyle: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
            >
              <option value="SIDEBAR">Sidebar Checklist Layout</option>
              <option value="TOP_BAR">Top Bar Horizontal Tabs</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Header CTA Label
            </label>
            <input
              type="text"
              value={showcase.ctaLabel}
              onChange={(e) => saveShowcase({ ctaLabel: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
            />
          </div>
          <button
            type="button"
            onClick={addSection}
            className="w-full py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold inline-flex items-center justify-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Add Showcase Section
          </button>
        </div>

        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <h2 className="text-sm font-bold text-slate-900">
            Curated Sections &amp; Attached Resources ({sections.length})
          </h2>
          <div className="space-y-4">
            {sections.map((sec) => (
              <div
                key={sec.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2"
              >
                <div className="text-xs font-bold text-slate-900">{sec.title}</div>
                <div className="space-y-1.5">
                  {sec.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-white border border-slate-200 flex items-center justify-between text-xs"
                    >
                      <span className="font-medium text-slate-800">
                        [{item.type}] {item.title}
                      </span>
                      <Link
                        href={`/demo/${item.id}`}
                        className="text-indigo-600 font-semibold"
                      >
                        Open Demo →
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </WorkspaceShell>
  );
}
