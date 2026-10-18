'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { WorkspaceShell } from '@/components/WorkspaceShell';
import { GitBranch, Plus, Play, Edit3 } from 'lucide-react';

interface RouteItem {
  id: string;
  name: string;
  description: string;
  creationMode: string;
  status: string;
  submissions?: Array<{ id: string }>;
}

export default function RoutesLibraryPage() {
  const [routes, setRoutes] = useState<RouteItem[]>([]);

  useEffect(() => {
    fetch('/api/routes')
      .then((r) => r.json())
      .then((d) => setRoutes(d.routes || []));
  }, []);

  return (
    <WorkspaceShell
      title="Route Hubs"
      subtitle="Qualify buyer intent via interactive forms and dynamically route prospects to the right Supademo or Showcase"
      actions={
        <Link
          href="/route/new"
          className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold inline-flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" /> Create Route Hub
        </Link>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {routes.map((rt) => (
          <div
            key={rt.id}
            data-testid={`route-card-${rt.id}`}
            className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold">
                  Mode: {rt.creationMode}
                </span>
                <span className="text-xs text-slate-500">
                  {rt.submissions?.length || 0} buyer submissions
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900">{rt.name}</h3>
              <p className="text-xs text-slate-500 mt-1">{rt.description}</p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <Link
                href={`/route/${rt.id}/share`}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 inline-flex items-center gap-1"
              >
                <Play className="w-3 h-3" /> Test Buyer Router
              </Link>
              <Link
                href={`/route/${rt.id}/edit`}
                className="px-3.5 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold inline-flex items-center gap-1"
              >
                <Edit3 className="w-3.5 h-3.5" /> Edit Node Graph
              </Link>
            </div>
          </div>
        ))}
      </div>
    </WorkspaceShell>
  );
}
