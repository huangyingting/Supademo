'use client';

import React, { useEffect, useState } from 'react';
import { WorkspaceShell } from '@/components/WorkspaceShell';
import {
  ShieldCheck,
  KeyRound,
  Copy,
  Check,
  Ban,
  Users,
  Activity,
  Plus,
  RefreshCw,
} from 'lucide-react';

interface InvitationItem {
  id: string;
  invitedEmail: string;
  role: string;
  status: string;
  expiresAt: string;
  usedAt?: string | null;
  revokedAt?: string | null;
  createdAt: string;
  createdBy?: { name?: string | null; email: string };
  acceptedBy?: { name?: string | null; email: string } | null;
}

interface MemberItem {
  id: string;
  email: string;
  name?: string | null;
  role: string;
  status: string;
  jobTitle?: string | null;
}

interface AuditLogItem {
  id: string;
  action: string;
  actorEmail?: string | null;
  targetType?: string | null;
  targetId?: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export default function AdminInvitationsPage() {
  const [invitations, setInvitations] = useState<InvitationItem[]>([]);
  const [members, setMembers] = useState<MemberItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [invitedEmail, setInvitedEmail] = useState('');
  const [role, setRole] = useState('CREATOR');
  const [ttlHours, setTtlHours] = useState(72);
  const [newInviteUrl, setNewInviteUrl] = useState('');
  const [newRawToken, setNewRawToken] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function loadAll() {
    const [invRes, memRes, audRes] = await Promise.all([
      fetch('/api/invitations'),
      fetch('/api/members'),
      fetch('/api/audit-logs?limit=40'),
    ]);
    if (invRes.ok) {
      const d = await invRes.json();
      setInvitations(d.invitations || []);
    }
    if (memRes.ok) {
      const d = await memRes.json();
      setMembers(d.members || []);
    }
    if (audRes.ok) {
      const d = await audRes.json();
      setAuditLogs(d.auditLogs || []);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  async function handleCreateInvite(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setNewInviteUrl('');
    setNewRawToken('');
    setLoading(true);
    try {
      const res = await fetch('/api/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invitedEmail, role, ttlHours }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Failed to issue invitation.');
        return;
      }
      setNewInviteUrl(data.inviteUrl);
      setNewRawToken(data.rawToken);
      setInvitedEmail('');
      await loadAll();
    } finally {
      setLoading(false);
    }
  }

  async function handleRevoke(id: string) {
    await fetch(`/api/invitations/${id}/revoke`, { method: 'POST' });
    await loadAll();
  }

  async function handleUpdateMember(
    id: string,
    patch: { role?: string; status?: string }
  ) {
    await fetch(`/api/members/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    });
    await loadAll();
  }

  function copyLink(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <WorkspaceShell
      title="Invite-Only Admission, RBAC & Security Audit Console"
      subtitle="Issue single-use SHA-256 invitation codes, manage workspace roles, revoke access, and inspect tamper-evident audit logs"
      actions={
        <button
          type="button"
          onClick={loadAll}
          className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-medium text-slate-700 inline-flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      }
    >
      <div className="space-y-8">
        {/* Issue Single-Use Invitation Card */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Issue Single-Use Invitation Code
                </h2>
                <p className="text-xs text-slate-500">
                  Only the SHA-256 hash is stored in the database. Raw tokens are shown once upon creation.
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Policy: INVITE_ONLY
            </span>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-medium text-rose-700">
              {error}
            </div>
          )}

          <form
            onSubmit={handleCreateInvite}
            className="grid grid-cols-1 md:grid-cols-4 gap-3"
          >
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Recipient Work Email
              </label>
              <input
                type="email"
                required
                data-testid="admin-invite-email-input"
                value={invitedEmail}
                onChange={(e) => setInvitedEmail(e.target.value)}
                placeholder="teammate@mycompany.io"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Assigned RBAC Role
              </label>
              <select
                data-testid="admin-invite-role-select"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white"
              >
                <option value="CREATOR">Creator</option>
                <option value="ADMIN">Admin</option>
                <option value="BILLING_ADMIN">Billing Admin</option>
                <option value="VIEWER">Viewer</option>
              </select>
            </div>

            <div className="flex items-end gap-2">
              <div className="w-24">
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  TTL (hrs)
                </label>
                <input
                  type="number"
                  min={1}
                  max={720}
                  value={ttlHours}
                  onChange={(e) => setTtlHours(Number(e.target.value))}
                  className="w-full px-2.5 py-2 rounded-xl border border-slate-300 text-sm"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                data-testid="admin-create-invite-btn"
                className="flex-1 py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>{loading ? 'Issuing...' : 'Issue Invite'}</span>
              </button>
            </div>
          </form>

          {newInviteUrl && (
            <div
              data-testid="generated-invite-banner"
              className="mt-4 p-4 rounded-xl bg-indigo-50 border border-indigo-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="space-y-1 min-w-0">
                <div className="text-xs font-bold text-indigo-950">
                  Single-Use Invitation Link Generated (Copy now — shown only once):
                </div>
                <div
                  data-testid="generated-invite-url"
                  className="text-xs font-mono text-indigo-800 break-all"
                >
                  {newInviteUrl}
                </div>
                <div
                  data-testid="generated-invite-token"
                  className="text-[11px] font-mono text-slate-500"
                >
                  Token: {newRawToken}
                </div>
              </div>
              <button
                type="button"
                onClick={() => copyLink(newInviteUrl)}
                className="px-3.5 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold inline-flex items-center gap-1.5 shrink-0"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Link'}</span>
              </button>
            </div>
          )}
        </section>

        {/* Invitations Table */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 mb-4">
            Issued Invitations ({invitations.length})
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 uppercase">
                  <th className="py-2.5 px-3">Invited Email</th>
                  <th className="py-2.5 px-3">Role</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Expires</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invitations.map((inv) => (
                  <tr key={inv.id} data-testid={`invite-row-${inv.invitedEmail}`}>
                    <td className="py-3 px-3 font-medium text-slate-900">
                      {inv.invitedEmail}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
                        {inv.role}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        data-testid={`invite-status-${inv.invitedEmail}`}
                        className={`px-2 py-0.5 rounded-full font-semibold ${
                          inv.status === 'PENDING'
                            ? 'bg-amber-50 text-amber-700'
                            : inv.status === 'ACCEPTED'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-500">
                      {new Date(inv.expiresAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-3 text-right">
                      {inv.status === 'PENDING' && (
                        <button
                          type="button"
                          data-testid={`revoke-invite-${inv.invitedEmail}`}
                          onClick={() => handleRevoke(inv.id)}
                          className="px-2.5 py-1 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 font-semibold inline-flex items-center gap-1"
                        >
                          <Ban className="w-3 h-3" /> Revoke
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Active Workspace Members & RBAC / Account Revocation */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">
              Workspace Members &amp; Role / Access Control ({members.length})
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 uppercase">
                  <th className="py-2.5 px-3">Name &amp; Email</th>
                  <th className="py-2.5 px-3">RBAC Role</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Access Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {members.map((m) => (
                  <tr key={m.id} data-testid={`member-row-${m.email}`}>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-900">{m.name}</div>
                      <div className="text-slate-500">{m.email}</div>
                    </td>
                    <td className="py-3 px-3">
                      <select
                        value={m.role}
                        data-testid={`member-role-select-${m.email}`}
                        onChange={(e) =>
                          handleUpdateMember(m.id, { role: e.target.value })
                        }
                        className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white font-semibold text-slate-700"
                      >
                        <option value="ADMIN">ADMIN</option>
                        <option value="CREATOR">CREATOR</option>
                        <option value="BILLING_ADMIN">BILLING_ADMIN</option>
                        <option value="VIEWER">VIEWER</option>
                      </select>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        data-testid={`member-status-${m.email}`}
                        className={`px-2 py-0.5 rounded-full font-semibold ${
                          m.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {m.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        type="button"
                        data-testid={`member-toggle-status-${m.email}`}
                        onClick={() =>
                          handleUpdateMember(m.id, {
                            status: m.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE',
                          })
                        }
                        className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 font-semibold text-slate-700"
                      >
                        {m.status === 'ACTIVE' ? 'Suspend Access' : 'Reactivate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Tamper-Evident Security Audit Log */}
        <section
          data-testid="audit-log-section"
          className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">
              Security &amp; Admission Audit Log ({auditLogs.length})
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 uppercase">
                  <th className="py-2 px-3">Timestamp</th>
                  <th className="py-2 px-3">Event Action</th>
                  <th className="py-2 px-3">Actor</th>
                  <th className="py-2 px-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditLogs.map((log) => (
                  <tr key={log.id} data-testid={`audit-row-${log.action}`}>
                    <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-mono font-semibold">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-700">
                      {log.actorEmail || 'system/cli'}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600">
                      {JSON.stringify(log.metadata)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </WorkspaceShell>
  );
}
