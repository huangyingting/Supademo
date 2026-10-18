'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { WorkspaceShell } from '@/components/WorkspaceShell';
import {
  CheckCircle2,
  Circle,
  Play,
  Edit3,
  Share2,
  Sparkles,
  Bot,
  GitBranch,
  HelpCircle,
  LayoutGrid,
  Eye,
  ArrowRight,
} from 'lucide-react';

interface DemoSummary {
  id: string;
  title: string;
  description: string;
  type: string;
  viewsCount: number;
  completionRate: number;
  steps: Array<{ id: string; title: string; mediaUrl: string }>;
}

export default function WorkspaceHomePage() {
  const [demos, setDemos] = useState<DemoSummary[]>([]);
  const [checklist, setChecklist] = useState({
    exploreSample: true,
    recordDemo: true,
    customizeDemo: true,
    shareDemo: false,
  });

  useEffect(() => {
    fetch('/api/demos')
      .then((r) => r.json())
      .then((d) => setDemos(d.demos || []));
  }, []);

  function toggleItem(key: keyof typeof checklist) {
    const next = { ...checklist, [key]: !checklist[key] };
    setChecklist(next);
    fetch('/api/workspace', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ checklist: next }),
    });
  }

  const completedCount = Object.values(checklist).filter(Boolean).length;

  return (
    <WorkspaceShell
      title="Welcome to Supademo, Joshuah!"
      subtitle="Create, personalize, and share interactive product demos, AI Demo Agents, Showcases & Route Hubs"
    >
      <div className="space-y-8">
        {/* Get Started Checklist Banner matching app.supademo.com/home */}
        <section
          data-testid="home-onboarding-checklist"
          className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Get Started with Supademo ({completedCount}/4 completed)
              </h2>
              <p className="text-xs text-slate-500">
                Complete these 4 steps to master interactive demo creation and sharing
              </p>
            </div>
            <div className="w-40 h-2 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full bg-indigo-600 transition-all"
                style={{ width: `${(completedCount / 4) * 100}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              {
                key: 'exploreSample' as const,
                title: '1. Explore a sample Supademo',
                desc: 'Experience chapters, hotspots & AI voiceovers',
                href: '/demo/cmvdpmcll02wb090j10dbikms',
              },
              {
                key: 'recordDemo' as const,
                title: '2. Record or Upload a Supademo',
                desc: 'Capture screenshots, video, or HTML sandbox',
                href: '/demos',
              },
              {
                key: 'customizeDemo' as const,
                title: '3. Customize & Enhance with AI',
                desc: 'Add hotspots, blur masks, and neural voiceover',
                href: '/demo/cmvdpmcll02wb090j10dbikms/edit',
              },
              {
                key: 'shareDemo' as const,
                title: '4. Share or Embed your Demo',
                desc: 'Create personalized links or embed in your site',
                href: '/demo/cmvdpmcll02wb090j10dbikms/edit',
              },
            ].map((step) => {
              const done = checklist[step.key];
              return (
                <div
                  key={step.key}
                  className={`p-4 rounded-xl border flex flex-col justify-between ${
                    done
                      ? 'border-emerald-200 bg-emerald-50/40'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <div>
                    <button
                      type="button"
                      onClick={() => toggleItem(step.key)}
                      className="flex items-center gap-2 text-xs font-bold text-slate-900 text-left"
                    >
                      {done ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                      <span>{step.title}</span>
                    </button>
                    <p className="text-[11px] text-slate-500 mt-1.5">{step.desc}</p>
                  </div>
                  <Link
                    href={step.href}
                    className="mt-3 text-xs font-semibold text-indigo-600 inline-flex items-center gap-1 hover:underline"
                  >
                    Open <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              );
            })}
          </div>
        </section>

        {/* Recommended Playbooks & Orchestration Surfaces */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            {
              icon: Sparkles,
              title: 'AI Command Studio',
              desc: 'Build, translate & audit demos using natural language prompts',
              href: '/command',
              badge: 'Copilot',
            },
            {
              icon: Bot,
              title: 'AI Demo Agents',
              desc: '24/7 autonomous discovery & qualification agent (1,500 credits)',
              href: '/agents',
              badge: 'Agentic',
            },
            {
              icon: GitBranch,
              title: 'Route Hubs',
              desc: 'Qualify buyer intent & conditionally route to tailored Showcases',
              href: '/routes',
              badge: 'Routing',
            },
            {
              icon: HelpCircle,
              title: 'In-App Demo Hubs',
              desc: 'Embed searchable interactive product guides inside your app',
              href: '/hubs',
              badge: 'Widget',
            },
          ].map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.title}
                href={card.href}
                className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-indigo-400 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase">
                      {card.badge}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">{card.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {card.desc}
                  </p>
                </div>
                <span className="mt-4 text-xs font-semibold text-indigo-600 inline-flex items-center gap-1">
                  Launch <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </Link>
            );
          })}
        </section>

        {/* Recent Supademos */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Recent Workspace Supademos
              </h2>
              <p className="text-xs text-slate-500">
                Jump back into editing or previewing your interactive demos
              </p>
            </div>
            <Link
              href="/demos"
              className="text-xs font-semibold text-indigo-600 hover:underline"
            >
              View All Supademos →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {demos.map((demo) => (
              <div
                key={demo.id}
                data-testid={`home-demo-card-${demo.id}`}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-44 bg-slate-900 overflow-hidden">
                    <img
                      src={
                        demo.steps?.[0]?.mediaUrl ||
                        '/screenshots/40_demo_editor_main_desktop.png'
                      }
                      alt={demo.title}
                      className="w-full h-full object-cover opacity-90"
                    />
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-900/80 text-white text-[11px] font-semibold">
                        {demo.type}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-indigo-600 text-white text-[11px] font-semibold">
                        {demo.steps?.length || 0} steps
                      </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-base font-bold text-slate-900">
                      {demo.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {demo.description}
                    </p>
                  </div>
                </div>

                <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5 text-slate-400" /> {demo.viewsCount} views
                    </span>
                    <span className="text-emerald-600 font-semibold">
                      {demo.completionRate}% completion
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/demo/${demo.id}`}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 inline-flex items-center gap-1"
                    >
                      <Play className="w-3 h-3" /> Preview
                    </Link>
                    <Link
                      href={`/demo/${demo.id}/edit`}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold inline-flex items-center gap-1"
                    >
                      <Edit3 className="w-3 h-3" /> Edit
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </WorkspaceShell>
  );
}
