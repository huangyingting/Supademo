'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { WorkspaceShell } from '@/components/WorkspaceShell';
import { HelpCircle, Plus, Edit3 } from 'lucide-react';

interface HubSummary {
  id: string;
  name: string;
  title: string;
  subtitle: string;
  launcherPosition: string;
  launcherText: string;
  accentColor: string;
  status: string;
}

export default function HubsLibraryPage() {
  const router = useRouter();
  const [hubs, setHubs] = useState<HubSummary[]>([]);

  useEffect(() => {
    fetch('/api/hubs')
      .then((r) => r.json())
      .then((d) => setHubs(d.hubs || []));
  }, []);

  async function handleCreateHub() {
    const res = await fetch('/api/hubs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Product Help & Onboarding Widget',
        title: 'Interactive Product Guides',
      }),
    });
    const data = await res.json();
    if (data.hub?.id) {
      router.push(`/hub/${data.hub.id}`);
    }
  }

  return (
    <WorkspaceShell
      title="In-App Demo Hubs"
      subtitle="Embed a searchable, self-serve interactive guide widget directly inside your SaaS application"
      actions={
        <button
          type="button"
          onClick={handleCreateHub}
          className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold inline-flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" /> Create In-App Hub
        </button>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {hubs.map((hub) => (
          <div
            key={hub.id}
            data-testid={`hub-card-${hub.id}`}
            className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold">
                  Position: {hub.launcherPosition}
                </span>
                <span className="text-xs font-semibold text-emerald-600">
                  {hub.status}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900">{hub.name}</h3>
              <p className="text-xs text-slate-500 mt-1">{hub.subtitle}</p>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <span className="text-xs text-slate-500 inline-flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5" /> Pill: &ldquo;{hub.launcherText}&rdquo;
              </span>
              <Link
                href={`/hub/${hub.id}`}
                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold inline-flex items-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" /> Customize &amp; Install
              </Link>
            </div>
          </div>
        ))}
      </div>
    </WorkspaceShell>
  );
}
