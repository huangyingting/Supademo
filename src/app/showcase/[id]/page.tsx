'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Layers, ExternalLink, Play } from 'lucide-react';

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
  ctaLabel: string;
  ctaUrl: string;
  sectionsJson: string;
}

export default function ShowcasePlayerPage() {
  const params = useParams<{ id: string }>();
  const showcaseId = params.id;
  const [showcase, setShowcase] = useState<ShowcaseDetail | null>(null);
  const [sections, setSections] = useState<ShowcaseSection[]>([]);
  const [activeDemoId, setActiveDemoId] = useState('cmvdpmcll02wb090j10dbikms');

  useEffect(() => {
    fetch(`/api/showcases/${showcaseId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.showcase) {
          setShowcase(d.showcase);
          try {
            const parsed: ShowcaseSection[] = JSON.parse(
              d.showcase.sectionsJson || '[]'
            );
            setSections(parsed);
            if (parsed[0]?.items?.[0]?.id) {
              setActiveDemoId(parsed[0].items[0].id);
            }
          } catch {
            setSections([]);
          }
        }
      });
  }, [showcaseId]);

  if (!showcase) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center text-sm">
        Loading Showcase Kit...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <header className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-base font-bold">{showcase.title}</h1>
            <p className="text-xs text-slate-400">{showcase.description}</p>
          </div>
        </div>
        <a
          href={showcase.ctaUrl || 'https://supademo.com'}
          target="_blank"
          rel="noreferrer"
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold inline-flex items-center gap-1.5"
        >
          <span>{showcase.ctaLabel}</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12">
        <aside className="lg:col-span-3 border-r border-slate-800 p-5 space-y-5 bg-slate-900/50">
          {sections.map((sec) => (
            <div key={sec.id} className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {sec.title}
              </div>
              {sec.items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveDemoId(item.id)}
                  className={`w-full text-left p-3 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors ${
                    activeDemoId === item.id
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Play className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{item.title}</span>
                </button>
              ))}
            </div>
          ))}
        </aside>

        <main className="lg:col-span-9 p-6 flex flex-col">
          <iframe
            src={`/demo/${activeDemoId}`}
            title="Embedded Supademo Player"
            className="w-full flex-1 min-h-[600px] rounded-2xl border border-slate-800 bg-slate-900"
          />
        </main>
      </div>
    </div>
  );
}
