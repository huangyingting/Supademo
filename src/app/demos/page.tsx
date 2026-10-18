'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { WorkspaceShell } from '@/components/WorkspaceShell';
import {
  Search,
  Folder,
  Tag as TagIcon,
  LayoutGrid,
  List,
  Play,
  Edit3,
  Copy,
  Archive,
  Eye,
  Image as ImageIcon,
  Layers,
} from 'lucide-react';

interface DemoRecord {
  id: string;
  title: string;
  description: string;
  type: string;
  scope: string;
  visibility: string;
  status: string;
  tagsJson: string;
  viewsCount: number;
  engagedViewsCount: number;
  completionRate: number;
  updatedAt: string;
  creator?: { name?: string | null; email: string } | null;
  folder?: { id: string; name: string; color: string } | null;
  steps: Array<{ id: string; title: string; mediaUrl: string; stepType: string }>;
}

export default function DemosLibraryPage() {
  const [activeTab, setActiveTab] = useState<'SUPADEMOS' | 'SCREENSHOTS'>('SUPADEMOS');
  const [scope, setScope] = useState<'TEAM' | 'PERSONAL' | 'ARCHIVED'>('TEAM');
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');
  const [viewMode, setViewMode] = useState<'GRID' | 'LIST'>('GRID');
  const [demos, setDemos] = useState<DemoRecord[]>([]);
  const [folders, setFolders] = useState<Array<{ id: string; name: string; color: string }>>([]);
  const [tags, setTags] = useState<Array<{ id: string; name: string; color: string }>>([]);

  async function loadDemos() {
    const params = new URLSearchParams();
    params.set('scope', scope);
    if (search) params.set('search', search);
    if (selectedTag) params.set('tag', selectedTag);
    if (selectedType !== 'ALL') params.set('type', selectedType);

    const res = await fetch(`/api/demos?${params.toString()}`);
    const data = await res.json();
    setDemos(data.demos || []);
    setFolders(data.folders || []);
    setTags(data.tags || []);
  }

  useEffect(() => {
    loadDemos();
  }, [scope, search, selectedTag, selectedType]);

  async function handleDuplicate(id: string) {
    await fetch(`/api/demos/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'DUPLICATE' }),
    });
    await loadDemos();
  }

  async function handleArchive(id: string) {
    await fetch(`/api/demos/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scope: scope === 'ARCHIVED' ? 'TEAM' : 'ARCHIVED' }),
    });
    await loadDemos();
  }

  return (
    <WorkspaceShell
      title="Supademos Library"
      subtitle="Organize, filter, edit, and share your interactive product demos and captured screenshots"
    >
      <div className="space-y-6">
        {/* Top Tabs: Supademos vs Screenshots + Scope Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('SUPADEMOS')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 ${
                activeTab === 'SUPADEMOS'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white border border-slate-200 text-slate-600'
              }`}
            >
              <Layers className="w-3.5 h-3.5" /> Supademos ({demos.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('SCREENSHOTS')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 ${
                activeTab === 'SCREENSHOTS'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white border border-slate-200 text-slate-600'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" /> Screenshots
            </button>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
            {[
              { id: 'TEAM', label: 'Shared with Team' },
              { id: 'PERSONAL', label: 'Personal' },
              { id: 'ARCHIVED', label: 'Archived' },
            ].map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setScope(s.id as typeof scope)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  scope === s.id
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search & Multi-Facet Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Supademos by title or description..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700"
            >
              <option value="">All Tags</option>
              {tags.map((t) => (
                <option key={t.id} value={t.name}>
                  Tag: {t.name}
                </option>
              ))}
            </select>

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700"
            >
              <option value="ALL">All Types</option>
              <option value="UPLOAD">Guided Upload / Extension</option>
              <option value="HTML">HTML Demo</option>
              <option value="SANDBOX">Sandbox Demo</option>
              <option value="AI_COMMAND">AI Command</option>
            </select>

            <div className="inline-flex rounded-xl border border-slate-200 bg-white p-0.5">
              <button
                type="button"
                onClick={() => setViewMode('GRID')}
                className={`p-1.5 rounded-lg ${
                  viewMode === 'GRID' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('LIST')}
                className={`p-1.5 rounded-lg ${
                  viewMode === 'LIST' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Folders Strip */}
        {folders.length > 0 && activeTab === 'SUPADEMOS' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {folders.map((folder) => (
              <div
                key={folder.id}
                className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-center gap-3"
              >
                <Folder className="w-5 h-5 text-indigo-600 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-slate-900">{folder.name}</div>
                  <div className="text-[11px] text-slate-500">Workspace Folder</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'SCREENSHOTS' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              { title: 'Workspace Home Capture', url: '/screenshots/06_home_dashboard_desktop.png' },
              { title: 'Hotspot Inspector Capture', url: '/screenshots/43_editor_hotspot_panel_desktop.png' },
              { title: 'AI Voiceover Studio Capture', url: '/screenshots/54_editor_voiceover_exact.png' },
              { title: 'Route Hub Canvas Capture', url: '/screenshots/67_route_hub_editor_desktop.png' },
            ].map((shot) => (
              <div
                key={shot.title}
                className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm"
              >
                <img src={shot.url} alt={shot.title} className="w-full h-36 object-cover" />
                <div className="p-3 text-xs font-semibold text-slate-800">{shot.title}</div>
              </div>
            ))}
          </div>
        ) : viewMode === 'GRID' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {demos.map((demo) => {
              let parsedTags: string[] = [];
              try {
                parsedTags = JSON.parse(demo.tagsJson || '[]');
              } catch {
                parsedTags = [];
              }
              return (
                <div
                  key={demo.id}
                  data-testid={`demo-card-${demo.id}`}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="relative h-44 bg-slate-900 overflow-hidden">
                      <img
                        src={
                          demo.steps?.[0]?.mediaUrl ||
                          '/screenshots/40_demo_editor_main_desktop.png'
                        }
                        alt={demo.title}
                        className="w-full h-full object-cover opacity-90"
                      />
                      <div className="absolute top-3 left-3 flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-full bg-slate-900/80 text-white text-[10px] font-semibold">
                          {demo.type}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-semibold">
                          {demo.steps?.length || 0} steps
                        </span>
                      </div>
                    </div>

                    <div className="p-4">
                      <h3 className="text-sm font-bold text-slate-900">
                        {demo.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {demo.description}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {parsedTags.map((tg) => (
                          <span
                            key={tg}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-semibold"
                          >
                            <TagIcon className="w-2.5 h-2.5" /> {tg}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-500 inline-flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" /> {demo.viewsCount}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleDuplicate(demo.id)}
                        title="Duplicate Demo"
                        className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleArchive(demo.id)}
                        title="Archive Demo"
                        className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
                      >
                        <Archive className="w-3.5 h-3.5" />
                      </button>
                      <Link
                        href={`/demo/${demo.id}`}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 inline-flex items-center gap-1"
                      >
                        <Play className="w-3 h-3" /> Play
                      </Link>
                      <Link
                        href={`/demo/${demo.id}/edit`}
                        className="px-2.5 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold inline-flex items-center gap-1"
                      >
                        <Edit3 className="w-3 h-3" /> Edit
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 uppercase">
                  <th className="py-3 px-4">Supademo Title</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Steps</th>
                  <th className="py-3 px-4">Views</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {demos.map((d) => (
                  <tr key={d.id}>
                    <td className="py-3 px-4 font-semibold text-slate-900">{d.title}</td>
                    <td className="py-3 px-4">{d.type}</td>
                    <td className="py-3 px-4">{d.steps?.length || 0}</td>
                    <td className="py-3 px-4">{d.viewsCount}</td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <Link href={`/demo/${d.id}`} className="text-indigo-600 font-semibold">
                        Play
                      </Link>
                      <Link href={`/demo/${d.id}/edit`} className="text-indigo-600 font-semibold">
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </WorkspaceShell>
  );
}
