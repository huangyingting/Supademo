'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { WorkspaceShell } from '@/components/WorkspaceShell';
import { HelpCircle, Search, Play, Code, Palette, Layers, ArrowLeft } from 'lucide-react';

interface HubDetail {
  id: string;
  name: string;
  title: string;
  subtitle: string;
  theme: string;
  accentColor: string;
  launcherPosition: string;
  launcherStyle: string;
  launcherText: string;
  cardsJson: string;
  installSnippet: string;
}

export default function HubEditorPage() {
  const params = useParams<{ id: string }>();
  const hubId = params.id;

  const [hub, setHub] = useState<HubDetail | null>(null);
  const [activeTab, setActiveTab] = useState<'APPEARANCE' | 'CONTENT' | 'INSTALL'>('APPEARANCE');
  const [widgetQuery, setWidgetQuery] = useState('');
  const [widgetOpen, setWidgetOpen] = useState(true);

  useEffect(() => {
    fetch(`/api/hubs/${hubId}`)
      .then((r) => r.json())
      .then((d) => setHub(d.hub));
  }, [hubId]);

  async function updateHub(patch: Partial<HubDetail>) {
    if (!hub) return;
    const next = { ...hub, ...patch };
    setHub(next);
    await fetch(`/api/hubs/${hub.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    });
  }

  if (!hub) {
    return (
      <WorkspaceShell title="In-App Demo Hub Editor">
        <div className="p-8 text-sm text-slate-500">Loading In-App Hub...</div>
      </WorkspaceShell>
    );
  }

  let cards: Array<{ id: string; title: string; category: string; demoId: string }> = [];
  try {
    cards = JSON.parse(hub.cardsJson || '[]');
  } catch {
    cards = [];
  }

  const filteredCards = cards.filter((c) =>
    c.title.toLowerCase().includes(widgetQuery.toLowerCase())
  );

  return (
    <WorkspaceShell
      title={`In-App Hub: ${hub.name}`}
      subtitle="Customize Appearance, Content, and JavaScript SDK snippet for your embedded help center widget"
      actions={
        <Link
          href="/hubs"
          className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 inline-flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> All Hubs
        </Link>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 3-Tab Configuration Panel matching app.supademo.com/hub/[id] */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
          <div
            data-testid="hub-editor-tabs"
            className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl"
          >
            {[
              { id: 'APPEARANCE', label: 'Appearance', icon: Palette },
              { id: 'CONTENT', label: 'Content', icon: Layers },
              { id: 'INSTALL', label: 'Install', icon: Code },
            ].map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  type="button"
                  data-testid={`hub-tab-${t.id.toLowerCase()}`}
                  onClick={() => setActiveTab(t.id as typeof activeTab)}
                  className={`py-2 rounded-lg text-xs font-bold inline-flex items-center justify-center gap-1.5 ${
                    activeTab === t.id
                      ? 'bg-white text-indigo-600 shadow-sm'
                      : 'text-slate-600'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" /> {t.label}
                </button>
              );
            })}
          </div>

          {activeTab === 'APPEARANCE' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Header Title
                </label>
                <input
                  type="text"
                  value={hub.title}
                  onChange={(e) => updateHub({ title: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Subtitle
                </label>
                <input
                  type="text"
                  value={hub.subtitle}
                  onChange={(e) => updateHub({ subtitle: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Launcher Pill Text
                </label>
                <input
                  type="text"
                  value={hub.launcherText}
                  onChange={(e) => updateHub({ launcherText: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Launcher Position
                </label>
                <select
                  value={hub.launcherPosition}
                  onChange={(e) =>
                    updateHub({ launcherPosition: e.target.value })
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs"
                >
                  <option value="BOTTOM_RIGHT">Bottom Right</option>
                  <option value="BOTTOM_LEFT">Bottom Left</option>
                </select>
              </div>
            </div>
          )}

          {activeTab === 'CONTENT' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500">
                Interactive guides and walkthroughs published inside this Hub:
              </p>
              {cards.map((c) => (
                <div
                  key={c.id}
                  className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-bold text-slate-900">{c.title}</div>
                    <div className="text-[11px] text-slate-500">
                      Category: {c.category}
                    </div>
                  </div>
                  <Link
                    href={`/demo/${c.demoId}`}
                    className="text-indigo-600 font-semibold"
                  >
                    Preview →
                  </Link>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'INSTALL' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-600">
                Paste this JavaScript snippet before your closing{' '}
                <code>&lt;/body&gt;</code> tag or trigger programmatically via{' '}
                <code>Supademo.openHub(&apos;{hub.id}&apos;)</code>:
              </p>
              <pre
                data-testid="hub-install-snippet"
                className="p-3.5 rounded-xl bg-slate-950 text-emerald-300 text-[11px] font-mono overflow-x-auto"
              >
                {hub.installSnippet}
              </pre>
            </div>
          )}
        </div>

        {/* Right Live Interactive Floating Widget Preview */}
        <div className="lg:col-span-7 bg-slate-900 rounded-2xl p-6 relative min-h-[500px] flex flex-col justify-end items-end overflow-hidden">
          <div className="absolute top-5 left-5 text-xs font-semibold text-slate-400">
            Live Customer Application Preview
          </div>

          {widgetOpen && (
            <div
              data-testid="hub-live-widget-modal"
              className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden mb-4"
            >
              <div
                style={{ backgroundColor: hub.accentColor || '#4F46E5' }}
                className="p-5 text-white"
              >
                <h3 className="text-base font-bold">{hub.title}</h3>
                <p className="text-xs text-indigo-100 mt-0.5">{hub.subtitle}</p>
                <div className="mt-3 relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={widgetQuery}
                    onChange={(e) => setWidgetQuery(e.target.value)}
                    placeholder="Search interactive guides..."
                    className="w-full pl-8 pr-3 py-2 rounded-xl bg-white text-slate-900 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="p-4 space-y-2.5 max-h-64 overflow-y-auto">
                {filteredCards.map((c) => (
                  <Link
                    key={c.id}
                    href={`/demo/${c.demoId}`}
                    className="p-3 rounded-xl border border-slate-200 hover:border-indigo-400 flex items-center justify-between transition-colors"
                  >
                    <div>
                      <span className="text-[10px] font-bold uppercase text-indigo-600">
                        {c.category}
                      </span>
                      <div className="text-xs font-bold text-slate-900 mt-0.5">
                        {c.title}
                      </div>
                    </div>
                    <Play className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={() => setWidgetOpen(!widgetOpen)}
            style={{ backgroundColor: hub.accentColor || '#4F46E5' }}
            className="px-4 py-2.5 rounded-full text-white text-xs font-bold shadow-xl inline-flex items-center gap-2"
          >
            <HelpCircle className="w-4 h-4" />
            <span>{hub.launcherText}</span>
          </button>
        </div>
      </div>
    </WorkspaceShell>
  );
}
