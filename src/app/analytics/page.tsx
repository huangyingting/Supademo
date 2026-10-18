'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { WorkspaceShell } from '@/components/WorkspaceShell';
import {
  BarChart3,
  Download,
  Eye,
  MousePointerClick,
  CheckCircle2,
  Users,
  Building2,
  Globe,
} from 'lucide-react';

interface AnalyticsPayload {
  summary: {
    totalViews: number;
    engagedViews: number;
    avgCompletionRate: number;
    avgEngagementRate: number;
    ctaClicks: number;
    identifiedLeads: number;
  };
  timeSeries: Array<{ date: string; views: number; engagedViews: number }>;
  recentViewers: Array<{
    id: string;
    viewerEmail?: string | null;
    viewerName?: string | null;
    accountDomain?: string | null;
    deviceType: string;
    country: string;
    city?: string | null;
    stepsViewed: number;
    totalSteps: number;
    completed: boolean;
    durationSec: number;
    demo?: { id: string; title: string };
  }>;
  recentAccounts: Array<{
    domain: string;
    views: number;
    viewers: number;
    completedCount: number;
    lastActive: string;
  }>;
  mostViewedDemos: Array<{
    id: string;
    title: string;
    viewsCount: number;
    engagedViewsCount: number;
    completionRate: number;
  }>;
  deviceBreakdown: Record<string, number>;
  countryBreakdown: Record<string, number>;
}

export default function AnalyticsPage() {
  const [scopeTab, setScopeTab] = useState<'SUPADEMO' | 'SHOWCASE'>('SUPADEMO');
  const [detailTab, setDetailTab] = useState<
    'VIEWERS' | 'ACCOUNTS' | 'MOST_VIEWED' | 'DEVICE_GEO'
  >('VIEWERS');
  const [dateRange, setDateRange] = useState('30D');
  const [data, setData] = useState<AnalyticsPayload | null>(null);

  useEffect(() => {
    fetch(`/api/analytics?range=${dateRange}`)
      .then((r) => r.json())
      .then((d) => setData(d));
  }, [dateRange]);

  function exportCsv() {
    if (!data) return;
    const rows = [
      ['Viewer Email', 'Account Domain', 'Demo', 'Steps Viewed', 'Completed', 'Country'],
      ...data.recentViewers.map((v) => [
        v.viewerEmail || 'Anonymous',
        v.accountDomain || '-',
        v.demo?.title || '-',
        `${v.stepsViewed}/${v.totalSteps}`,
        v.completed ? 'Yes' : 'No',
        v.country,
      ]),
    ];
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `supademo-analytics-${dateRange}.csv`;
    a.click();
  }

  return (
    <WorkspaceShell
      title="Analytics & Buyer Engagement"
      subtitle="Track viewer completion drop-off, account-level intent, and identified leads across your Supademos and Showcases"
      actions={
        <div className="flex items-center gap-2">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700"
          >
            <option value="7D">Last 7 Days</option>
            <option value="30D">Last 30 Days</option>
            <option value="90D">Last 90 Days</option>
          </select>
          <button
            type="button"
            data-testid="analytics-export-csv-btn"
            onClick={exportCsv}
            className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold inline-flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Top Scope Switcher: Supademo Analytics vs Showcase Analytics */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
          {[
            { id: 'SUPADEMO', label: 'Supademo Analytics' },
            { id: 'SHOWCASE', label: 'Showcase Analytics' },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setScopeTab(t.id as typeof scopeTab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold ${
                scopeTab === t.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white border border-slate-200 text-slate-600'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* 4 Summary Metric Cards */}
        <div
          data-testid="analytics-kpi-grid"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {[
            {
              label: 'Total Views',
              value: data?.summary.totalViews ?? 0,
              sub: `${data?.summary.identifiedLeads ?? 0} identified leads`,
              icon: Eye,
            },
            {
              label: 'Engaged Views',
              value: data?.summary.engagedViews ?? 0,
              sub: `${data?.summary.avgEngagementRate ?? 0}% engagement rate`,
              icon: Users,
            },
            {
              label: 'Avg. Completion Rate',
              value: `${data?.summary.avgCompletionRate ?? 0}%`,
              sub: 'Finished all interactive steps',
              icon: CheckCircle2,
            },
            {
              label: 'CTA Clicks',
              value: data?.summary.ctaClicks ?? 0,
              sub: 'High-intent conversion clicks',
              icon: MousePointerClick,
            },
          ].map((kpi) => {
            const Icon = kpi.icon;
            return (
              <div
                key={kpi.label}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm"
              >
                <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                  <span>{kpi.label}</span>
                  <Icon className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="text-2xl font-extrabold text-slate-900 mt-2">
                  {kpi.value}
                </div>
                <div className="text-[11px] text-emerald-600 font-medium mt-1">
                  {kpi.sub}
                </div>
              </div>
            );
          })}
        </div>

        {/* Time-Series Engagement Bar Chart */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-900">
              Daily Views vs. Engaged Views ({dateRange})
            </h2>
            <div className="flex items-center gap-4 text-xs">
              <span className="inline-flex items-center gap-1.5 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-sm bg-indigo-200" /> Total Views
              </span>
              <span className="inline-flex items-center gap-1.5 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-sm bg-indigo-600" /> Engaged Views
              </span>
            </div>
          </div>
          <div className="h-44 flex items-end gap-2 pt-4 border-b border-slate-100">
            {data?.timeSeries.map((pt) => (
              <div
                key={pt.date}
                className="flex-1 flex flex-col items-center gap-1 group"
              >
                <div className="w-full flex items-end justify-center gap-0.5 h-32">
                  <div
                    style={{ height: `${Math.min(100, pt.views * 2)}%` }}
                    className="w-2.5 bg-indigo-200 rounded-t"
                  />
                  <div
                    style={{ height: `${Math.min(100, pt.engagedViews * 2)}%` }}
                    className="w-2.5 bg-indigo-600 rounded-t"
                  />
                </div>
                <span className="text-[9px] text-slate-400 truncate max-w-full">
                  {pt.date.split(' ')[1]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 4 Breakdown Sub-Tabs matching app.supademo.com/analytics */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 pb-3">
            {[
              { id: 'VIEWERS', label: 'Recent Viewers' },
              { id: 'ACCOUNTS', label: 'Recent Accounts' },
              { id: 'MOST_VIEWED', label: 'Most Viewed' },
              { id: 'DEVICE_GEO', label: 'Device & Location' },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                data-testid={`analytics-tab-${t.id.toLowerCase()}`}
                onClick={() => setDetailTab(t.id as typeof detailTab)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold ${
                  detailTab === t.id
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {detailTab === 'VIEWERS' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 uppercase">
                    <th className="py-2.5 px-3">Viewer</th>
                    <th className="py-2.5 px-3">Account Domain</th>
                    <th className="py-2.5 px-3">Supademo</th>
                    <th className="py-2.5 px-3">Progress</th>
                    <th className="py-2.5 px-3">Device / Location</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data?.recentViewers.map((v) => (
                    <tr key={v.id}>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">
                        {v.viewerName || 'Anonymous Viewer'}{' '}
                        {v.viewerEmail && (
                          <span className="text-indigo-600 font-mono ml-1">
                            ({v.viewerEmail})
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-600">
                        {v.accountDomain || '—'}
                      </td>
                      <td className="py-2.5 px-3">{v.demo?.title}</td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold ${
                            v.completed
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {v.stepsViewed}/{v.totalSteps} steps
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-500">
                        {v.deviceType} • {v.city || v.country}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {detailTab === 'ACCOUNTS' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {data?.recentAccounts.map((acc) => (
                <div
                  key={acc.domain}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900 inline-flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-indigo-600" /> {acc.domain}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[11px] font-bold">
                      {acc.views} session(s)
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    {acc.completedCount} completed walkthroughs
                  </p>
                </div>
              ))}
            </div>
          )}

          {detailTab === 'MOST_VIEWED' && (
            <div className="space-y-2.5">
              {data?.mostViewedDemos.map((d) => (
                <div
                  key={d.id}
                  className="p-3.5 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                >
                  <Link
                    href={`/demo/${d.id}`}
                    className="font-bold text-slate-900 hover:text-indigo-600"
                  >
                    {d.title}
                  </Link>
                  <div className="flex items-center gap-4">
                    <span>{d.viewsCount} views</span>
                    <span className="text-emerald-600 font-bold">
                      {d.completionRate}% completion
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {detailTab === 'DEVICE_GEO' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900">Device Breakdown</h4>
                {Object.entries(data?.deviceBreakdown || {}).map(([dev, count]) => (
                  <div
                    key={dev}
                    className="p-2.5 rounded-lg bg-slate-50 flex justify-between"
                  >
                    <span>{dev}</span>
                    <strong>{count} sessions</strong>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900">Top Viewer Countries</h4>
                {Object.entries(data?.countryBreakdown || {}).map(([geo, count]) => (
                  <div
                    key={geo}
                    className="p-2.5 rounded-lg bg-slate-50 flex justify-between"
                  >
                    <span className="inline-flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-indigo-600" /> {geo}
                    </span>
                    <strong>{count} sessions</strong>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </WorkspaceShell>
  );
}
