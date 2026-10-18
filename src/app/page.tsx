'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MarketingShell } from '@/components/MarketingShell';
import {
  Sparkles,
  Play,
  ArrowRight,
  CheckCircle2,
  Bot,
  GitBranch,
  Layers,
  Code2,
  HelpCircle,
  BarChart3,
  Globe,
  Mic,
} from 'lucide-react';

const HERO_STEPS = [
  {
    title: '1. Capture Screenshot, Video, or Live HTML in 1 Click',
    subtitle: 'Record from our Chrome Extension, upload existing media, or clone live HTML DOM states.',
    callout: 'Click here to customize your interactive Hotspot style & branching',
    img: '/screenshots/40_demo_editor_main_desktop.png',
    x: '32%',
    y: '42%',
  },
  {
    title: '2. Enhance with AI Voiceover, Audit & 30+ Language Translations',
    subtitle: 'Add lifelike ElevenLabs & Inworld AI narration synced automatically to every step.',
    callout: 'Click Sync All to generate neural voiceover across all steps',
    img: '/screenshots/54_editor_voiceover_exact.png',
    x: '48%',
    y: '44%',
  },
  {
    title: '3. Route Buyers & Track Step-by-Step Engagement Analytics',
    subtitle: 'Qualify intent with Route Hub and sync high-intent buyer signals to HubSpot, Salesforce & Slack.',
    callout: 'Inspect account-level engagement & step completion drop-off',
    img: '/screenshots/19_analytics_desktop.png',
    x: '56%',
    y: '38%',
  },
];

export default function MarketingHomePage() {
  const [heroStep, setHeroStep] = useState(0);
  const current = HERO_STEPS[heroStep];

  return (
    <MarketingShell>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-50/70 via-white to-white pt-14 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-100/80 text-indigo-800 text-xs font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>AI-Powered Interactive Product Demos, Sandboxes &amp; Buyer Routing</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-950 max-w-4xl mx-auto leading-[1.12]">
            Create interactive product demos that{' '}
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              convert, onboard &amp; scale
            </span>
          </h1>

          <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Help 200,000+ professionals across Sales, Product Marketing, and Customer Success build guided screenshot/video tours, HTML sandboxes, AI Demo Agents, and Route Hubs in minutes.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/home"
              data-testid="hero-open-workspace-cta"
              className="px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-lg shadow-indigo-600/20 inline-flex items-center gap-2 transition-all"
            >
              <span>Launch Supademo Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/demo/cmvdpmcll02wb090j10dbikms"
              data-testid="hero-watch-demo-cta"
              className="px-6 py-3.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm inline-flex items-center gap-2 transition-all"
            >
              <Play className="w-4 h-4 text-indigo-600 fill-current" />
              <span>Play Interactive Product Tour</span>
            </Link>
          </div>

          {/* Interactive Hero Player */}
          <div className="mt-12 rounded-2xl border border-slate-200 bg-slate-900 shadow-2xl overflow-hidden text-left">
            <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500" />
                <span className="w-3 h-3 rounded-full bg-amber-400" />
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="ml-2 text-xs font-mono text-slate-400">
                  https://app.supademo.com/demo/cmvdpmcll02wb090j10dbikms
                </span>
              </div>
              <div className="flex items-center gap-2">
                {HERO_STEPS.map((s, idx) => (
                  <button
                    key={s.title}
                    type="button"
                    onClick={() => setHeroStep(idx)}
                    className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                      heroStep === idx
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    Step {idx + 1}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative bg-slate-950 aspect-[16/9] max-h-[540px] w-full overflow-hidden flex items-center justify-center">
              <img
                src={current.img}
                alt={current.title}
                className="w-full h-full object-cover opacity-90"
              />
              {/* Animated Hotspot Overlay */}
              <button
                type="button"
                onClick={() => setHeroStep((heroStep + 1) % HERO_STEPS.length)}
                style={{ left: current.x, top: current.y }}
                className="absolute -translate-x-1/2 -translate-y-1/2 group z-10 text-left"
              >
                <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-xs sm:text-sm font-semibold shadow-xl border border-indigo-400 hotspot-ping">
                  <span className="w-3 h-3 rounded-full bg-white inline-block shrink-0" />
                  <span>{current.callout}</span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </div>
              </button>
            </div>

            <div className="px-6 py-4 bg-slate-900 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-white">
              <div>
                <div className="text-sm font-bold">{current.title}</div>
                <div className="text-xs text-slate-400">{current.subtitle}</div>
              </div>
              <Link
                href="/demo/cmvdpmcll02wb090j10dbikms/edit"
                className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold shrink-0"
              >
                Open in Interactive Editor →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Core Product Pillars Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <h2 className="text-3xl font-bold text-slate-900">
            One unified platform for every interactive product experience
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            From 60-second screenshot walkthroughs to autonomous AI Demo Agents and multi-branch buyer routing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: Layers,
              title: 'Interactive Demo Editor',
              desc: 'Customize hotspots (Pointer, Callout, Area), blur sensitive PII, add zoom & pan animations, and branch steps conditionally.',
              href: '/features/demo-editor',
            },
            {
              icon: Code2,
              title: 'HTML & Sandbox Demos',
              desc: 'Capture pixel-perfect live DOM clones or self-paced clickable product sandboxes where prospects explore freely.',
              href: '/features/sandbox-demos',
            },
            {
              icon: Mic,
              title: 'AI Voiceover, Translate & Personalize',
              desc: 'Synthesize 12 lifelike ElevenLabs/Inworld voices, translate into 30+ languages, and inject {{name}} & {{company}} variables.',
              href: '/features/personalization',
            },
            {
              icon: Sparkles,
              title: 'AI Command & MCP Server',
              desc: 'Create, audit, translate, and analyze workspace demos via natural language prompts or your favorite MCP-enabled IDE.',
              href: '/ai/command',
            },
            {
              icon: Bot,
              title: 'AI Demo Agents (24/7 Presales)',
              desc: 'Train an autonomous AI Solutions Engineer on your demos, videos, docs, and websites to qualify and demo 24/7.',
              href: '/ai/demo-agents',
            },
            {
              icon: GitBranch,
              title: 'Route Hub & In-App Demo Hubs',
              desc: 'Qualify buyer intent with conditional routing trees or embed searchable self-serve help hubs inside your app.',
              href: '/features/route-hub',
            },
          ].map((f) => {
            const Icon = f.icon;
            return (
              <Link
                key={f.title}
                href={f.href}
                className="group p-6 rounded-2xl border border-slate-200 bg-white hover:border-indigo-400 hover:shadow-lg transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">{f.title}</h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    {f.desc}
                  </p>
                </div>
                <div className="mt-5 text-xs font-semibold text-indigo-600 inline-flex items-center gap-1">
                  <span>Explore capability</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </MarketingShell>
  );
}
