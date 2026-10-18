'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Play, ShieldAlert, KeyRound, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const [inviteToken, setInviteToken] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [errorCode, setErrorCode] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleAttemptDirectSignup(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setErrorCode('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          name,
          password,
          invitationToken: inviteToken.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorCode(data.error || 'INVITATION_REQUIRED');
        setError(
          data.message ||
            'Public registration is disabled. A valid single-use invitation link is required.'
        );
      } else {
        router.push('/welcome?stage=role');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-white">
      <div className="flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-20 max-w-xl mx-auto w-full">
        <Link href="/" className="inline-flex items-center gap-2.5 font-bold text-xl text-slate-900 mb-8">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
            <Play className="w-4 h-4 fill-current" />
          </div>
          <span>Supademo</span>
        </Link>

        {/* Invite-Only Fail-Closed Notice Banner */}
        <div
          data-testid="invite-only-banner"
          className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950"
        >
          <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-amber-800">
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            <span>Invite-Only Workspace Admission</span>
          </div>
          <p className="text-xs text-amber-800 mt-1 leading-relaxed">
            This Supademo deployment enforces fail-closed <strong>invite-only registration</strong>. You must have a single-use invitation token issued by a Workspace Admin to create an account.
          </p>
        </div>

        <h1 className="text-2xl font-bold text-slate-900">
          Exceptional product demos in minutes, not days
        </h1>
        <p className="text-xs text-slate-500 mt-1 mb-6">
          Enter your single-use invitation code below or ask a workspace administrator to invite your work email.
        </p>

        {error && (
          <div
            data-testid="signup-error-box"
            className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800"
          >
            <div className="font-bold">{errorCode}</div>
            <div className="mt-0.5">{error}</div>
          </div>
        )}

        <form onSubmit={handleAttemptDirectSignup} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Single-Use Invitation Token (Required in Invite-Only Mode)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                data-testid="signup-token-input"
                value={inviteToken}
                onChange={(e) => setInviteToken(e.target.value)}
                placeholder="Paste invitation token or /invite/... code"
                className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {inviteToken.trim() && (
                <button
                  type="button"
                  onClick={() =>
                    router.push(`/invite/${encodeURIComponent(inviteToken.trim())}`)
                  }
                  className="px-3 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold"
                >
                  Open Link
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Work email
            </label>
            <input
              type="email"
              required
              data-testid="signup-email-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@company.com"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Rivera"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                data-testid="signup-password-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 8 characters"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            data-testid="signup-submit-btn"
            className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-sm flex items-center justify-center gap-2 transition-colors"
          >
            <KeyRound className="w-4 h-4" />
            <span>{loading ? 'Verifying Invitation...' : 'Continue with Invitation'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 flex items-center justify-between text-xs text-slate-500">
          <span>
            Already have an account?{' '}
            <Link href="/login" className="text-indigo-600 font-semibold hover:underline">
              Log in
            </Link>
          </span>
          <Link
            href="/join/I5rirEXZv6jBxnH5KSBorH8jqXm_DuWZ"
            className="text-indigo-600 font-medium hover:underline"
          >
            Preview Workspace Join Card →
          </Link>
        </div>
      </div>

      <div className="hidden lg:flex flex-col justify-center p-14 bg-slate-950 text-white space-y-6">
        <h2 className="text-2xl font-bold">
          Security-First Enterprise Demo Governance
        </h2>
        <ul className="space-y-3 text-sm text-slate-300">
          <li className="flex items-start gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              <strong>Single-Use SHA-256 Invitation Tokens:</strong> Raw tokens are never stored in the database; each link is email-bound and expires automatically.
            </span>
          </li>
          <li className="flex items-start gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              <strong>Granular RBAC Roles:</strong> Assign Admin, Creator, Billing Admin, or Viewer permissions per invitation.
            </span>
          </li>
          <li className="flex items-start gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              <strong>CLI-Only Bootstrap Admin:</strong> Initial administrator provisioning runs strictly via <code className="text-indigo-300">npm run bootstrap:admin</code> with zero HTTP bootstrap endpoints.
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
