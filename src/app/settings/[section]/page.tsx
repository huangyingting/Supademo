'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { WorkspaceShell } from '@/components/WorkspaceShell';
import {
  Palette,
  Play,
  Globe,
  Settings,
  Users,
  CreditCard,
  KeyRound,
  ShieldCheck,
  History,
  Plug,
  User,
  Tag,
  Volume2,
  CheckCircle2,
  Plus,
} from 'lucide-react';

const SETTINGS_NAV = [
  // Customization (3)
  { slug: 'brand', label: 'Brand', group: 'Customization', icon: Palette },
  { slug: 'demo-player', label: 'Demo Player', group: 'Customization', icon: Play },
  { slug: 'custom-domain', label: 'Custom Domain', group: 'Customization', icon: Globe },
  // Workspace (7)
  { slug: 'general', label: 'General', group: 'Workspace', icon: Settings },
  { slug: 'members', label: 'Members', group: 'Workspace', icon: Users },
  { slug: 'billing', label: 'Billing', group: 'Workspace', icon: CreditCard },
  { slug: 'api', label: 'API & MCP', group: 'Workspace', icon: KeyRound },
  { slug: 'security', label: 'Security & SSO', group: 'Workspace', icon: ShieldCheck },
  { slug: 'demo-versioning', label: 'Demo Versioning', group: 'Workspace', icon: History },
  { slug: 'integrations', label: 'Integrations', group: 'Workspace', icon: Plug },
  // Account (3)
  { slug: 'profile', label: 'Profile', group: 'Account', icon: User },
  { slug: 'tags', label: 'Tags', group: 'Account', icon: Tag },
  { slug: 'pronunciation-library', label: 'Pronunciation Library', group: 'Account', icon: Volume2 },
] as const;

export default function SettingsSectionPage() {
  const params = useParams<{ section: string }>();
  const section = params.section || 'brand';

  const [workspace, setWorkspace] = useState<any>(null);
  const [savedNotice, setSavedNotice] = useState('');
  const [brandColor, setBrandColor] = useState('#4F46E5');
  const [workspaceName, setWorkspaceName] = useState('My Company');
  const [customDomain, setCustomDomain] = useState('demos.acme-enterprise.io');
  const [newTagName, setNewTagName] = useState('');
  const [newTerm, setNewTerm] = useState('');
  const [newPhonetic, setNewPhonetic] = useState('');
  const [newApiKeyLabel, setNewApiKeyLabel] = useState('');
  const [generatedRawKey, setGeneratedRawKey] = useState('');

  async function loadSettings() {
    const res = await fetch('/api/settings');
    if (res.ok) {
      const data = await res.json();
      setWorkspace(data.workspace);
      if (data.workspace) {
        setBrandColor(data.workspace.brandColor || '#4F46E5');
        setWorkspaceName(data.workspace.name || 'My Company');
        setCustomDomain(
          data.workspace.customDomain || 'demos.acme-enterprise.io'
        );
      }
    }
  }

  useEffect(() => {
    loadSettings();
  }, []);

  async function saveSection(payload: Record<string, unknown>) {
    const res = await fetch('/api/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ section, ...payload }),
    });
    const data = await res.json();
    if (data.rawKey) {
      setGeneratedRawKey(data.rawKey);
    }
    setSavedNotice('Settings saved!');
    setTimeout(() => setSavedNotice(''), 2500);
    await loadSettings();
  }

  return (
    <WorkspaceShell
      title="Workspace & Account Settings"
      subtitle="Configure brand kit, custom domain, members & invitations, API keys, security & SAML SSO, integrations, and AI pronunciation"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 13-Section Settings Navigation matching app.supademo.com/settings/* */}
        <aside
          data-testid="settings-sidebar-nav"
          className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 p-4 space-y-5 h-fit"
        >
          {(['Customization', 'Workspace', 'Account'] as const).map((group) => (
            <div key={group}>
              <div className="px-2.5 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {group}
              </div>
              <div className="space-y-1">
                {SETTINGS_NAV.filter((item) => item.group === group).map(
                  (item) => {
                    const Icon = item.icon;
                    const active = section === item.slug;
                    return (
                      <Link
                        key={item.slug}
                        href={`/settings/${item.slug}`}
                        data-testid={`settings-nav-${item.slug}`}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                          active
                            ? 'bg-indigo-600 text-white'
                            : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  }
                )}
              </div>
            </div>
          ))}
        </aside>

        {/* Right Active Settings Section Panel */}
        <div
          data-testid={`settings-panel-${section}`}
          className="lg:col-span-9 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900 capitalize">
              {section.replace(/-/g, ' ')} Settings
            </h2>
            {savedNotice && (
              <span className="text-xs font-semibold text-emerald-600 inline-flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> {savedNotice}
              </span>
            )}
          </div>

          {section === 'brand' && (
            <div className="space-y-4 max-w-lg">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Primary Brand Accent Color
                </label>
                <input
                  type="color"
                  value={brandColor}
                  onChange={(e) => setBrandColor(e.target.value)}
                  className="w-32 h-10 rounded-lg border border-slate-300 cursor-pointer"
                />
              </div>
              <button
                type="button"
                onClick={() => saveSection({ brandColor })}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
              >
                Save Brand Kit
              </button>
            </div>
          )}

          {section === 'demo-player' && (
            <div className="space-y-4 max-w-lg">
              <p className="text-xs text-slate-600">
                Customize default hotspot pulse animation, progress bar style, and watermark visibility across all embedded players.
              </p>
              <button
                type="button"
                onClick={() =>
                  saveSection({
                    playerSettings: {
                      showProgressBar: true,
                      showNavbar: true,
                      watermarkEnabled: false,
                    },
                  })
                }
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
              >
                Save Demo Player Defaults
              </button>
            </div>
          )}

          {section === 'custom-domain' && (
            <div className="space-y-4 max-w-lg">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Custom Share &amp; Showcase CNAME Domain
                </label>
                <input
                  type="text"
                  value={customDomain}
                  onChange={(e) => setCustomDomain(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-mono"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Point your DNS <code>CNAME</code> record to{' '}
                  <code>cname.supademo.com</code> for automatic TLS provisioning.
                </p>
              </div>
              <button
                type="button"
                onClick={() => saveSection({ customDomain })}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
              >
                Verify &amp; Save Custom Domain
              </button>
            </div>
          )}

          {section === 'general' && (
            <div className="space-y-4 max-w-lg">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Workspace Display Name
                </label>
                <input
                  type="text"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>
              <button
                type="button"
                onClick={() => saveSection({ name: workspaceName })}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
              >
                Save Workspace Settings
              </button>
            </div>
          )}

          {section === 'members' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-indigo-950">
                    Invite-Only Workspace Admission Active
                  </div>
                  <div className="text-[11px] text-indigo-700">
                    Manage single-use SHA-256 invitation codes, role assignments, revocations, and audit logs.
                  </div>
                </div>
                <Link
                  href="/admin/invitations"
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
                >
                  Open Invite &amp; Audit Console →
                </Link>
              </div>

              <div className="space-y-2">
                {workspace?.members?.map((m: any) => (
                  <div
                    key={m.id}
                    className="p-3.5 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-900">
                        {m.user?.name || m.user?.email}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {m.user?.email}
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-slate-100 font-semibold text-slate-700">
                      {m.role}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {section === 'billing' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-900">
                    Plan Tier: {workspace?.planTier || 'GROWTH_TRIAL'}
                  </div>
                  <div className="text-slate-500">
                    AI Agent Credits: {workspace?.aiCreditsRemaining ?? 1500} /{' '}
                    {workspace?.aiCreditsTotal ?? 1500}
                  </div>
                </div>
                <Link
                  href="/upgrade"
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 text-white font-semibold"
                >
                  Compare Plans &amp; Upgrade →
                </Link>
              </div>
            </div>
          )}

          {section === 'api' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 max-w-md">
                <input
                  type="text"
                  value={newApiKeyLabel}
                  onChange={(e) => setNewApiKeyLabel(e.target.value)}
                  placeholder="Key label (e.g. Cursor MCP Server)..."
                  className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 text-xs"
                />
                <button
                  type="button"
                  onClick={() => {
                    saveSection({ label: newApiKeyLabel || 'Workspace API Key' });
                    setNewApiKeyLabel('');
                  }}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold inline-flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Generate Key
                </button>
              </div>
              {generatedRawKey && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-mono text-emerald-900">
                  New API Key (copy now): <strong>{generatedRawKey}</strong>
                </div>
              )}
              <div className="space-y-2">
                {workspace?.apiKeys?.map((k: any) => (
                  <div
                    key={k.id}
                    className="p-3 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                  >
                    <span className="font-semibold text-slate-800">{k.label}</span>
                    <code className="text-slate-500">{k.keyPrefix}</code>
                  </div>
                ))}
              </div>
            </div>
          )}

          {section === 'security' && (
            <div className="space-y-4 max-w-lg text-xs">
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-1">
                <div className="font-bold">
                  Invite-Only Fail-Closed Registration Policy: ENABLED
                </div>
                <p>
                  Uninvited credential signups and uninvited OAuth logins are strictly rejected and logged in the Audit Log.
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  saveSection({ ssoEnabled: true, ssoProvider: 'Okta SAML 2.0' })
                }
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold"
              >
                Save Enterprise SSO &amp; Security Policy
              </button>
            </div>
          )}

          {section === 'demo-versioning' && (
            <div className="space-y-3 max-w-lg text-xs text-slate-600">
              <p>
                Automatically snapshot Supademo steps before AI rewrites, translations, or bulk edits so creators can roll back anytime.
              </p>
              <button
                type="button"
                onClick={() => saveSection({ demoVersioningEnabled: true })}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold"
              >
                Enable Auto-Versioning
              </button>
            </div>
          )}

          {section === 'integrations' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {workspace?.integrations?.map((intg: any) => (
                <div
                  key={intg.id}
                  className="p-4 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-bold text-slate-900">
                      {intg.provider}
                    </div>
                    <div className="text-slate-500">Status: {intg.status}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      saveSection({
                        integrationId: intg.id,
                        status:
                          intg.status === 'CONNECTED'
                            ? 'DISCONNECTED'
                            : 'CONNECTED',
                      })
                    }
                    className={`px-3 py-1.5 rounded-lg font-semibold ${
                      intg.status === 'CONNECTED'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-indigo-600 text-white'
                    }`}
                  >
                    {intg.status === 'CONNECTED' ? 'Connected' : 'Connect'}
                  </button>
                </div>
              ))}
            </div>
          )}

          {section === 'profile' && (
            <div className="space-y-3 max-w-md text-xs">
              <p className="text-slate-600">
                Signed in as <strong>powlowskijoshuah@gmail.com</strong> (Workspace Admin).
              </p>
            </div>
          )}

          {section === 'tags' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 max-w-md">
                <input
                  type="text"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  placeholder="New workspace tag name..."
                  className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 text-xs"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!newTagName.trim()) return;
                    saveSection({ tagName: newTagName.trim() });
                    setNewTagName('');
                  }}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
                >
                  + Add Tag
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {workspace?.tags?.map((t: any) => (
                  <span
                    key={t.id}
                    className="px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 text-xs font-semibold"
                  >
                    {t.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {section === 'pronunciation-library' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600">
                Define custom phonetic pronunciations for your brand, acronyms, and technical terms used by AI Voiceover synthesis.
              </p>
              <div className="flex flex-wrap items-center gap-2 max-w-xl">
                <input
                  type="text"
                  value={newTerm}
                  onChange={(e) => setNewTerm(e.target.value)}
                  placeholder="Word / Acronym (e.g. Supademo)"
                  className="px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
                <input
                  type="text"
                  value={newPhonetic}
                  onChange={(e) => setNewPhonetic(e.target.value)}
                  placeholder="Phonetic (e.g. Soo-puh-deh-moh)"
                  className="px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!newTerm.trim() || !newPhonetic.trim()) return;
                    saveSection({
                      term: newTerm.trim(),
                      phonetic: newPhonetic.trim(),
                    });
                    setNewTerm('');
                    setNewPhonetic('');
                  }}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
                >
                  + Add Rule
                </button>
              </div>
              <div className="space-y-2">
                {workspace?.pronunciationRules?.map((r: any) => (
                  <div
                    key={r.id}
                    className="p-3 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                  >
                    <span className="font-bold text-slate-900">{r.term}</span>
                    <span className="font-mono text-indigo-600">
                      → &ldquo;{r.phonetic}&rdquo; ({r.language})
                    </span>
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
