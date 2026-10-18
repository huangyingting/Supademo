'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home,
  Sparkles,
  Layers,
  Video,
  Bot,
  LayoutGrid,
  HelpCircle,
  GitBranch,
  BarChart3,
  Settings,
  Plus,
  Search,
  Bell,
  ChevronRight,
  Menu,
  X,
  Upload,
  Code2,
  Box,
  Globe,
  Send,
  ShieldAlert,
  Crown,
  ExternalLink,
} from 'lucide-react';

export function WorkspaceShell({
  children,
  title,
  subtitle,
  actions,
}: {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [commandDockOpen, setCommandDockOpen] = useState(false);

  // Create Demo modal state
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<'EXTENSION' | 'UPLOAD' | 'HTML' | 'SANDBOX' | 'AI_COMMAND'>('UPLOAD');
  const [creating, setCreating] = useState(false);

  // AI Command Dock state
  const [dockPrompt, setDockPrompt] = useState('');
  const [dockLoading, setDockLoading] = useState(false);
  const [dockMessages, setDockMessages] = useState<
    Array<{ role: 'user' | 'assistant'; text: string; demoId?: string }>
  >([
    {
      role: 'assistant',
      text: 'Hi Joshuah! I am **Supademo AI Command**. Ask me to build a new interactive demo from uploads, audit your hotspot copy, translate demos into 30+ languages, or recap your weekly analytics.',
    },
  ]);

  const navItems = [
    { href: '/home', label: 'Home', icon: Home },
    { href: '/command', label: 'AI Command', icon: Sparkles, badge: 'AI' },
    { href: '/demos', label: 'Supademos', icon: Layers },
    { href: '/videos', label: 'Videos', icon: Video },
    { href: '/agents', label: 'Demo Agents', icon: Bot, badge: 'New' },
    { href: '/showcases', label: 'Showcases', icon: LayoutGrid },
    { href: '/hubs', label: 'Demo Hubs', icon: HelpCircle },
    { href: '/routes', label: 'Route Hubs', icon: GitBranch, badge: 'GTM' },
    { href: '/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/settings/brand', label: 'Settings', icon: Settings },
    { href: '/admin/invitations', label: 'Invite & Audit Admin', icon: ShieldAlert },
  ];

  async function handleCreateDemo(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch('/api/demos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle.trim() || 'New Interactive Supademo',
          type: newType,
          scope: 'TEAM',
        }),
      });
      const data = await res.json();
      if (data.demo?.id) {
        setCreateModalOpen(false);
        setNewTitle('');
        router.push(`/demo/${data.demo.id}/edit`);
      }
    } finally {
      setCreating(false);
    }
  }

  async function handleSendDockCommand(promptText?: string) {
    const q = (promptText ?? dockPrompt).trim();
    if (!q) return;
    setDockPrompt('');
    setDockMessages((prev) => [...prev, { role: 'user', text: q }]);
    setDockLoading(true);
    try {
      const res = await fetch('/api/ai/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: q }),
      });
      const data = await res.json();
      setDockMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: data.reply || 'Command completed.',
          demoId: data.createdDemoId,
        },
      ]);
    } finally {
      setDockLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Left Sidebar matching app.supademo.com */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Workspace Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <Link href="/home" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
              M
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900 leading-tight">
                My Company
              </div>
              <div className="text-[11px] text-indigo-600 font-medium">
                Growth Trial • 14 days left
              </div>
            </div>
          </Link>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Primary Create Supademo CTA */}
        <div className="p-3">
          <button
            type="button"
            data-testid="sidebar-create-supademo-btn"
            onClick={() => setCreateModalOpen(true)}
            className="w-full py-2.5 px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-sm flex items-center justify-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create Supademo</span>
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-1 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active =
              pathname === item.href ||
              (item.href === '/settings/brand' && pathname?.startsWith('/settings')) ||
              (item.href === '/demos' && pathname?.startsWith('/demo/')) ||
              (item.href === '/agents' && pathname?.startsWith('/agent/')) ||
              (item.href === '/showcases' && pathname?.startsWith('/showcase/')) ||
              (item.href === '/hubs' && pathname?.startsWith('/hub/')) ||
              (item.href === '/routes' && pathname?.startsWith('/route/'));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 ${
                      active ? 'text-indigo-600' : 'text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </span>
                {item.badge && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-indigo-100 text-indigo-700">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Trial & Upgrade Footer Card */}
        <div className="p-3 border-t border-slate-100 space-y-2.5">
          <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-50 via-violet-50 to-white border border-indigo-100">
            <div className="flex items-center justify-between text-xs font-semibold text-indigo-950 mb-1">
              <span className="flex items-center gap-1">
                <Crown className="w-3.5 h-3.5 text-amber-500" /> Growth Plan Trial
              </span>
              <span className="text-indigo-600">1,500 AI credits</span>
            </div>
            <p className="text-[11px] text-slate-600 mb-2">
              Unlimited HTML Sandbox Demos, AI Voiceovers, Custom Domain &amp; Route Hubs unlocked.
            </p>
            <Link
              href="/upgrade"
              className="block w-full py-1.5 text-center rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors"
            >
              Manage Plan &amp; Upgrade
            </Link>
          </div>

          <div className="flex items-center justify-between px-2 pt-1">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center shrink-0">
                JP
              </div>
              <div className="truncate">
                <div className="text-xs font-semibold text-slate-800 truncate">
                  Joshuah Powlowski
                </div>
                <div className="text-[10px] text-slate-500 truncate">
                  powlowskijoshuah@gmail.com
                </div>
              </div>
            </div>
            <Link
              href="/settings/profile"
              className="text-xs text-slate-400 hover:text-indigo-600"
              title="Profile Settings"
            >
              <Settings className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content Column */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Workspace Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open Sidebar"
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="truncate">
              {title && (
                <h1 className="text-base sm:text-lg font-bold text-slate-900 truncate">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="text-xs text-slate-500 truncate hidden sm:block">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {actions}
            <button
              type="button"
              data-testid="toggle-command-dock-btn"
              onClick={() => setCommandDockOpen(!commandDockOpen)}
              className="px-3 py-1.5 rounded-lg border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>AI Command</span>
            </button>
            <Link
              href="/"
              className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100"
            >
              <span>Marketing Site</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </header>

        {/* Page Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Persistent Right-Hand AI Command Dock (#command-dock) */}
      {commandDockOpen && (
        <aside
          id="command-dock"
          data-testid="ai-command-dock"
          className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-white border-l border-slate-200 shadow-2xl flex flex-col"
        >
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-indigo-950 to-violet-950 text-white">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-300" />
              <div>
                <div className="text-sm font-bold">Supademo AI Command</div>
                <div className="text-[11px] text-indigo-200">
                  Workspace Copilot &amp; MCP Assistant
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setCommandDockOpen(false)}
              className="p-1 rounded-lg text-indigo-200 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-3 border-b border-slate-100 bg-slate-50 flex flex-wrap gap-1.5">
            {[
              'How should I use Supademo?',
              'Recap my week',
              'Build a demo from uploads',
            ].map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => handleSendDockCommand(chip)}
                className="px-2.5 py-1 rounded-full text-xs font-medium bg-white border border-slate-200 text-slate-700 hover:border-indigo-400 hover:text-indigo-600 transition-colors"
              >
                {chip}
              </button>
            ))}
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-3 text-sm">
            {dockMessages.map((m, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-xl ${
                  m.role === 'user'
                    ? 'bg-indigo-600 text-white ml-8'
                    : 'bg-slate-100 text-slate-800 mr-4'
                }`}
              >
                <div className="whitespace-pre-line text-xs leading-relaxed">
                  {m.text}
                </div>
                {m.demoId && (
                  <Link
                    href={`/demo/${m.demoId}/edit`}
                    className="mt-2 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-600 text-white text-xs font-semibold"
                  >
                    Open Generated Demo in Editor <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            ))}
            {dockLoading && (
              <div className="p-3 rounded-xl bg-slate-100 text-slate-500 text-xs">
                Synthesizing workspace response...
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendDockCommand();
            }}
            className="p-3 border-t border-slate-200 flex items-center gap-2"
          >
            <input
              type="text"
              value={dockPrompt}
              onChange={(e) => setDockPrompt(e.target.value)}
              placeholder="Ask AI Command to build, translate, or analyze..."
              className="flex-1 px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              className="p-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </aside>
      )}

      {/* 5-Mode Create Supademo Modal matching app.supademo.com/demos */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            data-testid="create-supademo-modal"
            className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Create a new Supademo
                </h2>
                <p className="text-xs text-slate-500">
                  Choose how you want to capture or generate your interactive product tour
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDemo} className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Supademo Title
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g., Enterprise SSO & Workspace Onboarding Tour"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                  Creation Mode (5 Ways to Create)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    {
                      id: 'EXTENSION',
                      title: 'Record from extension',
                      desc: 'Capture clicks & screenshots automatically with Chrome Extension.',
                      icon: Globe,
                    },
                    {
                      id: 'UPLOAD',
                      title: 'Upload content',
                      desc: 'Upload existing screenshots or videos to build a guided demo.',
                      icon: Upload,
                    },
                    {
                      id: 'HTML',
                      title: 'HTML Demo',
                      desc: 'Pixel-perfect interactive HTML & CSS clone with live hover states.',
                      icon: Code2,
                    },
                    {
                      id: 'SANDBOX',
                      title: 'Sandbox Demo',
                      desc: 'Self-paced clickable product environment with non-linear exploration.',
                      icon: Box,
                    },
                    {
                      id: 'AI_COMMAND',
                      title: 'AI Command',
                      desc: 'Generate steps, hotspots & voiceovers from a natural language prompt.',
                      icon: Sparkles,
                    },
                  ].map((m) => {
                    const MIcon = m.icon;
                    const selected = newType === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setNewType(m.id as typeof newType)}
                        className={`p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 ${
                          selected
                            ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-500/20'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div
                          className={`p-2 rounded-lg ${
                            selected
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          <MIcon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-slate-900">
                            {m.title}
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            {m.desc}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  data-testid="submit-create-supademo-btn"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-sm"
                >
                  {creating ? 'Creating...' : 'Create & Open Editor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
