'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { WorkspaceShell } from '@/components/WorkspaceShell';
import {
  Bot,
  Send,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  Play,
  ArrowLeft,
} from 'lucide-react';

const SUB_TABS = [
  // Configure (5)
  { id: 'Identity', group: 'Configure' },
  { id: 'Interface', group: 'Configure' },
  { id: 'Guardrails', group: 'Configure' },
  { id: 'Quick Links', group: 'Configure' },
  { id: 'Security', group: 'Configure' },
  // Knowledge Base (5)
  { id: 'Demos', group: 'Knowledge Base' },
  { id: 'Videos', group: 'Knowledge Base' },
  { id: 'Documents', group: 'Knowledge Base' },
  { id: 'Websites', group: 'Knowledge Base' },
  { id: 'Text', group: 'Knowledge Base' },
  // Activity (4)
  { id: 'Insights', group: 'Activity' },
  { id: 'Sessions', group: 'Activity' },
  { id: 'Triggers', group: 'Activity' },
  { id: 'Knowledge gaps', group: 'Activity' },
] as const;

type SubTabId = (typeof SUB_TABS)[number]['id'];

interface AgentRecord {
  id: string;
  name: string;
  roleTitle: string;
  welcomeMessage: string;
  systemInstructions: string;
  guardrailsJson: string;
  quickLinksJson: string;
  securityConfigJson: string;
  knowledgeDemosJson: string;
  knowledgeVideosJson: string;
  knowledgeDocsJson: string;
  knowledgeWebsitesJson: string;
  knowledgeText: string;
  triggersJson: string;
  knowledgeGapsJson: string;
  readinessScore: number;
  sessions: Array<{ id: string; visitorEmail?: string | null; messagesJson: string; createdAt: string }>;
}

export default function AgentBuilderPage() {
  const params = useParams<{ id: string }>();
  const agentId = params.id;

  const [agent, setAgent] = useState<AgentRecord | null>(null);
  const [activeTab, setActiveTab] = useState<SubTabId>('Identity');
  const [readinessModal, setReadinessModal] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<
    Array<{ role: 'user' | 'assistant'; text: string; recommendedDemoId?: string }>
  >([]);
  const [saveBanner, setSaveBanner] = useState('');

  async function loadAgent() {
    const res = await fetch(`/api/agents/${agentId}`);
    if (res.ok) {
      const data = await res.json();
      setAgent(data.agent);
      if (chatHistory.length === 0 && data.agent?.welcomeMessage) {
        setChatHistory([{ role: 'assistant', text: data.agent.welcomeMessage }]);
      }
    }
  }

  useEffect(() => {
    loadAgent();
  }, [agentId]);

  async function saveAgentPatch(patch: Partial<AgentRecord>) {
    if (!agent) return;
    const next = { ...agent, ...patch };
    setAgent(next);
    await fetch(`/api/agents/${agent.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    });
    setSaveBanner('Saved changes');
    setTimeout(() => setSaveBanner(''), 2000);
  }

  async function handleSendChat(e: React.FormEvent) {
    e.preventDefault();
    if (!agent || !chatInput.trim()) return;
    const msg = chatInput.trim();
    setChatInput('');
    setChatHistory((prev) => [...prev, { role: 'user', text: msg }]);

    const res = await fetch(`/api/agents/${agent.id}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: msg, visitorEmail: 'buyer@stripe.com' }),
    });
    const data = await res.json();
    setChatHistory((prev) => [
      ...prev,
      {
        role: 'assistant',
        text: data.reply,
        recommendedDemoId: data.recommendedDemoId,
      },
    ]);
    await loadAgent();
  }

  if (!agent) {
    return (
      <WorkspaceShell title="AI Demo Agent Builder">
        <div className="p-8 text-sm text-slate-500">Loading AI Agent...</div>
      </WorkspaceShell>
    );
  }

  return (
    <WorkspaceShell
      title={`AI Agent: ${agent.name}`}
      subtitle="Configure persona, guardrails, multi-modal knowledge base, and test interactive demo recommendations"
      actions={
        <div className="flex items-center gap-2">
          <Link
            href="/agents"
            className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> All Agents
          </Link>
          <button
            type="button"
            data-testid="agent-readiness-btn"
            onClick={() => setReadinessModal(true)}
            className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold inline-flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Agent Readiness ({agent.readinessScore}%)</span>
          </button>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 14-Sub-Tab Navigation matching app.supademo.com/agent/[id]/edit */}
        <div
          data-testid="agent-subtabs-nav"
          className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 p-4 space-y-5 h-fit"
        >
          {(['Configure', 'Knowledge Base', 'Activity'] as const).map((group) => (
            <div key={group}>
              <div className="px-2.5 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {group}
              </div>
              <div className="space-y-1">
                {SUB_TABS.filter((t) => t.group === group).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    data-testid={`agent-tab-${tab.id.toLowerCase().replace(/\s+/g, '-')}`}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                      activeTab === tab.id
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {tab.id}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Center Configuration Editor for Selected Sub-Tab */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900">{activeTab}</h2>
            {saveBanner && (
              <span className="text-xs font-semibold text-emerald-600">
                {saveBanner}
              </span>
            )}
          </div>

          {activeTab === 'Identity' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Agent Name
                </label>
                <input
                  type="text"
                  value={agent.name}
                  onChange={(e) => saveAgentPatch({ name: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Role Title
                </label>
                <input
                  type="text"
                  value={agent.roleTitle}
                  onChange={(e) => saveAgentPatch({ roleTitle: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  System Instructions &amp; Persona
                </label>
                <textarea
                  rows={4}
                  value={agent.systemInstructions}
                  onChange={(e) =>
                    saveAgentPatch({ systemInstructions: e.target.value })
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>
            </div>
          )}

          {activeTab === 'Interface' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Welcome Greeting Message
                </label>
                <textarea
                  rows={3}
                  value={agent.welcomeMessage}
                  onChange={(e) =>
                    saveAgentPatch({ welcomeMessage: e.target.value })
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>
            </div>
          )}

          {activeTab === 'Guardrails' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500">
                Define strict boundaries on pricing quotes, competitor mentions, and hallucination prevention.
              </p>
              <textarea
                rows={5}
                value={agent.guardrailsJson}
                onChange={(e) =>
                  saveAgentPatch({ guardrailsJson: e.target.value })
                }
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-mono"
              />
            </div>
          )}

          {activeTab === 'Quick Links' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500">
                Configure starter prompt pills and booking links displayed in the agent launcher.
              </p>
              <textarea
                rows={5}
                value={agent.quickLinksJson}
                onChange={(e) =>
                  saveAgentPatch({ quickLinksJson: e.target.value })
                }
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-mono"
              />
            </div>
          )}

          {activeTab === 'Security' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500">
                Configure allowed embed origins, rate limits, and email verification rules.
              </p>
              <textarea
                rows={5}
                value={agent.securityConfigJson}
                onChange={(e) =>
                  saveAgentPatch({ securityConfigJson: e.target.value })
                }
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-mono"
              />
            </div>
          )}

          {activeTab === 'Demos' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500">
                Interactive Supademos indexed for real-time walkthrough launches:
              </p>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800">
                ✓ Build &amp; Share Interactive Product Demos with Supademo (cmvdpmcll02wb090j10dbikms)
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800">
                ✓ Interactive HTML Sandbox — Acme Cloud Security Console (cmvdpsandbox002)
              </div>
            </div>
          )}

          {activeTab === 'Videos' && (
            <div className="space-y-3 text-xs text-slate-600">
              <p>Indexed workspace videos ready for timestamped citations:</p>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 font-semibold">
                ✓ Supademo Q3 Enterprise Product Keynote &amp; Demo Recording (vid-01)
              </div>
            </div>
          )}

          {activeTab === 'Documents' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500">
                Uploaded PDF security whitepapers and technical specs:
              </p>
              <textarea
                rows={4}
                value={agent.knowledgeDocsJson}
                onChange={(e) =>
                  saveAgentPatch({ knowledgeDocsJson: e.target.value })
                }
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-mono"
              />
            </div>
          )}

          {activeTab === 'Websites' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500">
                Crawled help center and marketing URLs:
              </p>
              <textarea
                rows={4}
                value={agent.knowledgeWebsitesJson}
                onChange={(e) =>
                  saveAgentPatch({ knowledgeWebsitesJson: e.target.value })
                }
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-mono"
              />
            </div>
          )}

          {activeTab === 'Text' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500">
                Custom FAQ and product knowledge snippets:
              </p>
              <textarea
                rows={5}
                value={agent.knowledgeText}
                onChange={(e) =>
                  saveAgentPatch({ knowledgeText: e.target.value })
                }
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs"
              />
            </div>
          )}

          {activeTab === 'Insights' && (
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-xl bg-indigo-50">
                <div className="text-xs text-indigo-700 font-semibold">
                  Total Conversations
                </div>
                <div className="text-2xl font-extrabold text-indigo-950 mt-1">
                  {agent.sessions?.length || 1}
                </div>
              </div>
              <div className="p-4 rounded-xl bg-emerald-50">
                <div className="text-xs text-emerald-700 font-semibold">
                  Demos Launched
                </div>
                <div className="text-2xl font-extrabold text-emerald-950 mt-1">
                  14
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Sessions' && (
            <div className="space-y-2">
              {agent.sessions?.map((s) => (
                <div
                  key={s.id}
                  className="p-3 rounded-xl border border-slate-200 text-xs"
                >
                  <div className="font-bold text-slate-900">
                    Visitor: {s.visitorEmail || 'Anonymous'}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {new Date(s.createdAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'Triggers' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500">
                Auto-launch rules based on URL path or time-on-page:
              </p>
              <textarea
                rows={4}
                value={agent.triggersJson}
                onChange={(e) => saveAgentPatch({ triggersJson: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-mono"
              />
            </div>
          )}

          {activeTab === 'Knowledge gaps' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500">
                Unanswered prospect questions flagged for new Supademo creation:
              </p>
              <textarea
                rows={4}
                value={agent.knowledgeGapsJson}
                onChange={(e) =>
                  saveAgentPatch({ knowledgeGapsJson: e.target.value })
                }
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-mono"
              />
            </div>
          )}
        </div>

        {/* Right Live Interactive AI Agent Sandbox Preview */}
        <div className="lg:col-span-4 bg-slate-950 text-white rounded-2xl p-5 flex flex-col justify-between min-h-[480px]">
          <div>
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold">{agent.name}</div>
                <div className="text-[11px] text-slate-400">
                  Live Interactive Agent Preview
                </div>
              </div>
            </div>

            <div className="py-4 space-y-3 max-h-80 overflow-y-auto">
              {chatHistory.map((m, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl text-xs leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-indigo-600 text-white ml-8'
                      : 'bg-slate-900 border border-slate-800 text-slate-200 mr-4'
                  }`}
                >
                  <p>{m.text}</p>
                  {m.recommendedDemoId && (
                    <Link
                      href={`/demo/${m.recommendedDemoId}`}
                      className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-[11px] font-semibold"
                    >
                      <Play className="w-3 h-3" /> Launch Recommended Demo
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleSendChat} className="flex gap-2 pt-3 border-t border-slate-800">
            <input
              type="text"
              data-testid="agent-chat-input"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask about SSO, HTML sandbox, or pricing..."
              className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
            />
            <button
              type="submit"
              data-testid="agent-chat-send-btn"
              className="px-3 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>

      {/* Agent Readiness Modal */}
      {readinessModal && (
        <div
          data-testid="agent-readiness-modal"
          className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                Agent Readiness Score: {agent.readinessScore}%
              </h3>
              <button
                type="button"
                onClick={() => setReadinessModal(false)}
                className="text-xs text-slate-500"
              >
                Close
              </button>
            </div>
            <ul className="space-y-2 text-xs text-slate-700">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Identity &amp; System Instructions configured
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> 2 Interactive Supademos indexed in Knowledge Base
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Strict Guardrails &amp; Security Domains active
              </li>
            </ul>
          </div>
        </div>
      )}
    </WorkspaceShell>
  );
}
