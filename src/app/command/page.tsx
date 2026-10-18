'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { WorkspaceShell } from '@/components/WorkspaceShell';
import {
  Sparkles,
  Send,
  Terminal,
  Plus,
  ChevronRight,
  Layers,
  Globe,
  BarChart3,
} from 'lucide-react';

export default function AiCommandPage() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<
    Array<{
      role: 'user' | 'assistant';
      text: string;
      createdDemoId?: string;
      suggestions?: string[];
    }>
  >([
    {
      role: 'assistant',
      text: 'Welcome to **Supademo AI Command**! Ask me to generate a multi-step interactive demo from your uploads, audit hotspot callouts, translate demos into 30+ languages, or summarize your weekly workspace analytics.',
      suggestions: [
        'How should I use Supademo?',
        'Recap my week',
        'Build a demo from uploads for Enterprise SSO',
      ],
    },
  ]);

  async function sendCommand(q?: string) {
    const query = (q ?? prompt).trim();
    if (!query) return;
    setPrompt('');
    setMessages((prev) => [...prev, { role: 'user', text: query }]);
    setLoading(true);
    try {
      const res = await fetch('/api/ai/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: query }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: data.reply,
          createdDemoId: data.createdDemoId,
          suggestions: data.suggestions,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <WorkspaceShell
      title="AI Command Studio"
      subtitle="Run your Supademo workspace via natural language prompts or connect via Model Context Protocol (MCP)"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Conversational Copilot */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col min-h-[540px]">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span className="text-sm font-bold text-slate-900">
                AI Command Session
              </span>
            </div>
            <button
              type="button"
              onClick={() =>
                setMessages([
                  {
                    role: 'assistant',
                    text: 'Started a fresh AI Command chat. What would you like to build or analyze today?',
                  },
                ])
              }
              className="px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 inline-flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> New Chat
            </button>
          </div>

          <div className="flex-1 p-5 space-y-4 overflow-y-auto">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-indigo-600 text-white ml-12'
                    : 'bg-slate-50 border border-slate-200/80 text-slate-800 mr-8'
                }`}
              >
                <div className="whitespace-pre-line">{m.text}</div>
                {m.createdDemoId && (
                  <div className="mt-3">
                    <Link
                      href={`/demo/${m.createdDemoId}/edit`}
                      data-testid="ai-command-open-demo-link"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
                    >
                      <span>Open Generated Demo in Editor</span>
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                )}
                {m.suggestions && m.suggestions.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {m.suggestions.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => sendCommand(s)}
                        className="px-3 py-1 rounded-full bg-white border border-slate-200 text-xs font-medium text-indigo-700 hover:border-indigo-400"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="p-4 rounded-2xl bg-slate-50 text-xs text-slate-500">
                AI Command is executing workspace actions...
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendCommand();
            }}
            className="p-4 border-t border-slate-100 flex items-center gap-2"
          >
            <input
              type="text"
              data-testid="ai-command-input"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask AI Command (e.g., 'Build a demo for enterprise customer onboarding' or 'Recap my week')..."
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              data-testid="ai-command-send-btn"
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold inline-flex items-center gap-1.5"
            >
              <Send className="w-4 h-4" /> Send
            </button>
          </form>
        </div>

        {/* Right Column: Quick Actions & MCP Server Setup */}
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900">
              One-Click AI Workspace Actions
            </h3>
            {[
              {
                icon: Layers,
                title: 'Build a demo from uploads',
                prompt: 'Build a demo for enterprise SSO and RBAC onboarding',
              },
              {
                icon: BarChart3,
                title: 'Recap my week',
                prompt: 'Recap my week and top performing demos',
              },
              {
                icon: Globe,
                title: 'How should I use Supademo?',
                prompt: 'How should I use Supademo across Sales and CS?',
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.title}
                  type="button"
                  onClick={() => sendCommand(item.prompt)}
                  className="w-full p-3 rounded-xl border border-slate-200 hover:border-indigo-400 text-left flex items-center gap-3 transition-colors"
                >
                  <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-slate-800">
                    {item.title}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="bg-slate-950 text-white rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-300">
              <Terminal className="w-4 h-4" /> Supademo MCP Server
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Connect Claude Desktop, Cursor, or VS Code to your Supademo workspace to create and update demos directly from your IDE.
            </p>
            <pre className="p-3 rounded-xl bg-slate-900 text-[11px] font-mono text-emerald-300 overflow-x-auto">
{`{
  "mcpServers": {
    "supademo": {
      "url": "https://app.supademo.com/api/mcp",
      "headers": {
        "Authorization": "Bearer sd_live_98f4..."
      }
    }
  }
}`}
            </pre>
            <Link
              href="/settings/api"
              className="inline-block text-xs font-semibold text-indigo-300 hover:underline"
            >
              Manage MCP &amp; REST API Keys →
            </Link>
          </div>
        </div>
      </div>
    </WorkspaceShell>
  );
}
