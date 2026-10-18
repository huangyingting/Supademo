'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Play,
  Layers,
  Bot,
  GitBranch,
  HelpCircle,
  BarChart3,
  ShieldCheck,
  Menu,
  X,
  ArrowRight,
  Globe,
} from 'lucide-react';

export function MarketingShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900">
      {/* Top Announcement Banner */}
      <div className="bg-gradient-to-r from-indigo-950 via-indigo-900 to-violet-900 text-white text-xs sm:text-sm py-2.5 px-4 text-center font-medium">
        <span className="inline-flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-full bg-indigo-500/30 border border-indigo-400/40 text-[11px] uppercase tracking-wider font-semibold">
            New
          </span>
          <span>
            Introducing <strong>Supademo AI Command</strong>, <strong>Agentic Demos</strong> &amp; <strong>Route Hub</strong>
          </span>
          <Link
            href="/ai/command"
            className="underline decoration-indigo-300 hover:text-indigo-200 inline-flex items-center gap-1 ml-1"
          >
            Explore AI Studio <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </span>
      </div>

      {/* Navigation Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2.5 font-bold text-xl tracking-tight text-slate-900">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-sm">
                <Play className="w-4 h-4 fill-current" />
              </div>
              <span>Supademo</span>
            </Link>

            <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600">
              <Link href="/features" className="hover:text-indigo-600 transition-colors">
                Platform &amp; Features
              </Link>
              <Link href="/ai/command" className="hover:text-indigo-600 transition-colors flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> AI Command
              </Link>
              <Link href="/ai/demo-agents" className="hover:text-indigo-600 transition-colors flex items-center gap-1">
                <Bot className="w-3.5 h-3.5 text-violet-600" /> Demo Agents
              </Link>
              <Link href="/features/route-hub" className="hover:text-indigo-600 transition-colors flex items-center gap-1">
                <GitBranch className="w-3.5 h-3.5 text-emerald-600" /> Route Hub
              </Link>
              <Link href="/showcase" className="hover:text-indigo-600 transition-colors">
                Showcase
              </Link>
              <Link href="/integrations" className="hover:text-indigo-600 transition-colors">
                Integrations
              </Link>
              <Link href="/enterprise" className="hover:text-indigo-600 transition-colors">
                Enterprise
              </Link>
              <Link href="/pricing" className="hover:text-indigo-600 transition-colors">
                Pricing
              </Link>
            </nav>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="px-3.5 py-2 text-sm font-medium text-slate-700 hover:text-indigo-600 transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/home"
              className="px-3.5 py-2 text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
            >
              Open Workspace
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors inline-flex items-center gap-1.5"
            >
              Try for Free <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle Menu"
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-3">
            <div className="grid grid-cols-2 gap-2 text-sm font-medium">
              <Link href="/features" className="p-2 rounded-lg hover:bg-slate-50">
                Features
              </Link>
              <Link href="/ai/command" className="p-2 rounded-lg hover:bg-slate-50">
                AI Command
              </Link>
              <Link href="/ai/demo-agents" className="p-2 rounded-lg hover:bg-slate-50">
                AI Demo Agents
              </Link>
              <Link href="/features/route-hub" className="p-2 rounded-lg hover:bg-slate-50">
                Route Hub
              </Link>
              <Link href="/showcase" className="p-2 rounded-lg hover:bg-slate-50">
                Showcase
              </Link>
              <Link href="/integrations" className="p-2 rounded-lg hover:bg-slate-50">
                Integrations
              </Link>
              <Link href="/enterprise" className="p-2 rounded-lg hover:bg-slate-50">
                Enterprise
              </Link>
              <Link href="/pricing" className="p-2 rounded-lg hover:bg-slate-50">
                Pricing
              </Link>
            </div>
            <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
              <Link
                href="/login"
                className="w-full py-2 text-center text-sm font-medium text-slate-700 border border-slate-200 rounded-lg"
              >
                Sign in
              </Link>
              <Link
                href="/home"
                className="w-full py-2 text-center text-sm font-semibold text-white bg-indigo-600 rounded-lg"
              >
                Open Workspace
              </Link>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 border-t border-slate-800 py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2 md:col-span-1 space-y-3">
            <div className="flex items-center gap-2.5 font-bold text-lg text-white">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <Play className="w-3.5 h-3.5 fill-current" />
              </div>
              <span>Supademo</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Exceptional interactive product demos, sandboxes, AI voiceovers, and buyer routing in minutes, not days.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium pt-1">
              <ShieldCheck className="w-4 h-4" /> SOC 2 Type II &amp; GDPR Compliant
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white mb-3">
              Product
            </h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/features/demo-editor" className="hover:text-white">Interactive Demo Editor</Link></li>
              <li><Link href="/features/sandbox-demos" className="hover:text-white">HTML &amp; Sandbox Demos</Link></li>
              <li><Link href="/features/personalization" className="hover:text-white">Dynamic Personalization</Link></li>
              <li><Link href="/features/screen-recorder" className="hover:text-white">Screen &amp; Video Recorder</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white mb-3">
              AI &amp; Orchestration
            </h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/ai/command" className="hover:text-white">AI Command &amp; MCP</Link></li>
              <li><Link href="/ai/demo-agents" className="hover:text-white">AI Demo Agents</Link></li>
              <li><Link href="/features/route-hub" className="hover:text-white">Route Hub</Link></li>
              <li><Link href="/features/demo-hub" className="hover:text-white">In-App Demo Hub</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white mb-3">
              Solutions
            </h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/solutions" className="hover:text-white">Sales &amp; Presales</Link></li>
              <li><Link href="/solutions" className="hover:text-white">Product Marketing</Link></li>
              <li><Link href="/solutions" className="hover:text-white">Customer Success</Link></li>
              <li><Link href="/enterprise" className="hover:text-white">Enterprise Security</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white mb-3">
              Workspace &amp; Governance
            </h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/home" className="hover:text-white">Workspace Dashboard</Link></li>
              <li><Link href="/admin/invitations" className="hover:text-white">Invite-Only Admin Console</Link></li>
              <li><Link href="/settings/members" className="hover:text-white">RBAC &amp; Audit Logs</Link></li>
              <li><Link href="/pricing" className="hover:text-white">Pricing &amp; Plans</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-10 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© 2026 Supademo Platform. Trusted by 200,000+ professionals and 3,000+ companies.</p>
          <div className="flex items-center gap-4 mt-2 sm:mt-0">
            <span className="inline-flex items-center gap-1"><Globe className="w-3.5 h-3.5" /> Region: USWest2</span>
            <span>Admission Mode: Invite-Only</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
