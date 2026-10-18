'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { WorkspaceShell } from '@/components/WorkspaceShell';
import { GitBranch, Play, ArrowRight, Plus, CheckCircle2 } from 'lucide-react';

interface RouteDetail {
  id: string;
  name: string;
  description: string;
  nodesJson: string;
  formFieldsJson: string;
  rulesJson: string;
  integrationsJson: string;
  submissions: Array<{
    id: string;
    visitorEmail: string;
    answersJson: string;
    routedTargetType: string;
    routedTargetId: string;
    createdAt: string;
  }>;
}

export default function RouteNodeEditorPage() {
  const params = useParams<{ id: string }>();
  const routeId = params.id;
  const [route, setRoute] = useState<RouteDetail | null>(null);
  const [activeTab, setActiveTab] = useState<'CANVAS' | 'RULES' | 'SUBMISSIONS'>('CANVAS');
  const [savedMsg, setSavedMsg] = useState('');

  useEffect(() => {
    fetch(`/api/routes/${routeId}`)
      .then((r) => r.json())
      .then((d) => setRoute(d.route));
  }, [routeId]);

  async function saveRoute(patch: Partial<RouteDetail>) {
    if (!route) return;
    const next = { ...route, ...patch };
    setRoute(next);
    await fetch(`/api/routes/${route.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    });
    setSavedMsg('Saved Route Graph!');
    setTimeout(() => setSavedMsg(''), 2000);
  }

  if (!route) {
    return (
      <WorkspaceShell title="Route Hub Canvas Editor">
        <div className="p-8 text-sm text-slate-500">Loading Route Graph...</div>
      </WorkspaceShell>
    );
  }

  let nodes: Array<{ id: string; type: string; title: string; subtitle: string }> = [];
  let rules: Array<{
    id: string;
    conditionField: string;
    operator: string;
    value: string;
    targetType: string;
    targetId: string;
    targetLabel: string;
  }> = [];

  try {
    nodes = JSON.parse(route.nodesJson || '[]');
    rules = JSON.parse(route.rulesJson || '[]');
  } catch {
    // ignore
  }

  return (
    <WorkspaceShell
      title={`Route Hub: ${route.name}`}
      subtitle="Visual Node Graph Editor: FORM → INTEGRATIONS → ROUTE → SHOWCASE / DEMO"
      actions={
        <div className="flex items-center gap-2">
          {savedMsg && (
            <span className="text-xs font-semibold text-emerald-600">
              {savedMsg}
            </span>
          )}
          <Link
            href={`/route/${route.id}/share`}
            data-testid="route-test-share-btn"
            className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold inline-flex items-center gap-1.5"
          >
            <Play className="w-3.5 h-3.5" /> Share &amp; Test Live Router
          </Link>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
          {[
            { id: 'CANVAS', label: 'Visual Node Canvas' },
            { id: 'RULES', label: `Conditional Routing Rules (${rules.length})` },
            { id: 'SUBMISSIONS', label: `Buyer Submissions (${route.submissions?.length || 0})` },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id as typeof activeTab)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold ${
                activeTab === t.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white border border-slate-200 text-slate-600'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {activeTab === 'CANVAS' && (
          <div
            data-testid="route-visual-canvas"
            className="bg-slate-950 rounded-2xl p-8 border border-slate-800 min-h-[420px] flex flex-col justify-center"
          >
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
              {nodes.map((node, idx) => (
                <React.Fragment key={node.id}>
                  <div
                    data-testid={`route-node-${node.type.toLowerCase()}`}
                    className="p-4 rounded-2xl bg-slate-900 border border-slate-700 text-white shadow-xl space-y-1.5"
                  >
                    <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[10px] font-bold uppercase">
                      {node.type}
                    </span>
                    <div className="text-xs font-bold text-white">
                      {node.title}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {node.subtitle}
                    </div>
                  </div>
                  {idx < nodes.length - 1 && (
                    <div className="hidden md:flex justify-center text-indigo-400">
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'RULES' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              IF / THEN Buyer Qualification Rules
            </h3>
            {rules.map((r) => (
              <div
                key={r.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3 text-xs"
              >
                <div>
                  <span className="font-bold text-indigo-600">IF</span>{' '}
                  <code className="px-1.5 py-0.5 rounded bg-white border">
                    {r.conditionField}
                  </code>{' '}
                  <span>{r.operator}</span>{' '}
                  <strong className="text-slate-900">&ldquo;{r.value}&rdquo;</strong>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-emerald-700">THEN ROUTE TO →</span>
                  <span className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white font-semibold">
                    [{r.targetType}] {r.targetLabel}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'SUBMISSIONS' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3">
            <h3 className="text-sm font-bold text-slate-900">
              Recent Buyer Qualification Submissions
            </h3>
            {route.submissions?.map((sub) => (
              <div
                key={sub.id}
                className="p-3.5 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-slate-900">
                    {sub.visitorEmail}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Answers: {sub.answersJson}
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-semibold">
                  Routed to {sub.routedTargetType}: {sub.routedTargetId}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </WorkspaceShell>
  );
}
