'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { WorkspaceShell } from '@/components/WorkspaceShell';
import { Bot, Plus, Sparkles, Edit3, MessageSquare } from 'lucide-react';

interface AgentItem {
  id: string;
  name: string;
  roleTitle: string;
  welcomeMessage: string;
  accentColor: string;
  readinessScore: number;
  status: string;
}

export default function AgentsLibraryPage() {
  const router = useRouter();
  const [agents, setAgents] = useState<AgentItem[]>([]);

  async function loadAgents() {
    const res = await fetch('/api/agents');
    const data = await res.json();
    setAgents(data.agents || []);
  }

  useEffect(() => {
    loadAgents();
  }, []);

  async function handleCreateAgent() {
    const res = await fetch('/api/agents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Enterprise Discovery Agent',
        roleTitle: '24/7 Interactive Presales Engineer',
      }),
    });
    const data = await res.json();
    if (data.agent?.id) {
      router.push(`/agent/${data.agent.id}/edit`);
    }
  }

  return (
    <WorkspaceShell
      title="AI Demo Agents"
      subtitle="Deploy autonomous 24/7 AI Presales Engineers trained on your interactive Supademos, videos, and docs"
      actions={
        <div className="flex items-center gap-3">
          <span
            data-testid="agents-credits-badge"
            className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold inline-flex items-center gap-1"
          >
            <Sparkles className="w-3.5 h-3.5" /> 1,500 / 1,500 AI Credits Remaining
          </span>
          <button
            type="button"
            onClick={handleCreateAgent}
            className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Create AI Agent
          </button>
        </div>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {agents.map((agent) => (
          <div
            key={agent.id}
            data-testid={`agent-card-${agent.id}`}
            className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between space-y-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div
                  style={{ backgroundColor: agent.accentColor || '#4F46E5' }}
                  className="w-11 h-11 rounded-2xl text-white flex items-center justify-center shadow"
                >
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {agent.name}
                  </h3>
                  <p className="text-xs text-slate-500">{agent.roleTitle}</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold">
                Readiness: {agent.readinessScore}%
              </span>
            </div>

            <p className="text-xs text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              &ldquo;{agent.welcomeMessage}&rdquo;
            </p>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-xs text-slate-500 inline-flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5" /> Trained on Workspace Knowledge Base
              </span>
              <Link
                href={`/agent/${agent.id}/edit`}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold inline-flex items-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" /> Configure &amp; Test Agent
              </Link>
            </div>
          </div>
        ))}
      </div>
    </WorkspaceShell>
  );
}
