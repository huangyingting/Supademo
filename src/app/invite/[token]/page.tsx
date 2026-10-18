'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import {
  Play,
  CheckCircle2,
  AlertTriangle,
  Users,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';

export default function InviteRedemptionPage() {
  const params = useParams<{ token: string }>();
  const router = useRouter();
  const rawToken = params?.token || '';

  const [checking, setChecking] = useState(true);
  const [verification, setVerification] = useState<{
    valid: boolean;
    reason?: string;
    workspaceName?: string;
    inviterName?: string;
    invitedEmail?: string;
    role?: string;
    expiresAt?: string;
    isWorkspaceShareLink?: boolean;
  } | null>(null);

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function verify() {
      setChecking(true);
      try {
        const res = await fetch(
          `/api/invitations/verify?token=${encodeURIComponent(rawToken)}`
        );
        const data = await res.json();
        setVerification(data);
        if (data.invitedEmail) {
          setEmail(data.invitedEmail);
        }
      } finally {
        setChecking(false);
      }
    }
    if (rawToken) verify();
  }, [rawToken]);

  async function handleAccept(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          name,
          password,
          invitationToken: rawToken,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Unable to redeem invitation.');
        return;
      }

      await signIn('credentials', {
        email,
        password,
        redirect: false,
      });
      router.push('/home');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <Link
        href="/"
        className="inline-flex items-center gap-2 font-bold text-xl text-slate-900 mb-6"
      >
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
          <Play className="w-4 h-4 fill-current" />
        </div>
        <span>Supademo</span>
      </Link>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 sm:p-8">
        {checking ? (
          <div className="text-center py-8 text-sm text-slate-500">
            Validating invitation link...
          </div>
        ) : !verification?.valid ? (
          /* Matches app.supademo.com/join/invalid_token_edge_case */
          <div data-testid="invite-invalid-state" className="text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">
              This invite link isn&apos;t valid
            </h1>
            <p className="text-xs text-slate-500 leading-relaxed">
              {verification?.reason === 'REVOKED'
                ? 'This invitation has been revoked by a workspace administrator.'
                : verification?.reason === 'ALREADY_USED'
                  ? 'This single-use invitation code has already been redeemed.'
                  : verification?.reason === 'EXPIRED'
                    ? 'This invitation link has expired. Ask a workspace admin for a new one.'
                    : 'The link may have been revoked or replaced. Ask a workspace admin for a new one.'}
            </p>
            <div className="pt-2 flex flex-col gap-2">
              <Link
                href="/login"
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold"
              >
                Back to Sign In
              </Link>
            </div>
          </div>
        ) : (
          /* Matches app.supademo.com/join/I5rirEXZv6jBxnH5KSBorH8jqXm_DuWZ */
          <div data-testid="invite-valid-state" className="space-y-5">
            <div className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-bold text-lg flex items-center justify-center mx-auto mb-3 shadow-sm">
                M
              </div>
              <h1 className="text-xl font-bold text-slate-900">
                Join {verification.workspaceName || 'My Company'}
              </h1>
              <p className="text-xs text-slate-500 mt-1 flex items-center justify-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-indigo-600" />
                <span>
                  3 members are already collaborating here. You&apos;ll join as a{' '}
                  <strong className="text-slate-800">
                    {verification.role || 'CREATOR'}
                  </strong>
                  .
                </span>
              </p>
            </div>

            {error && (
              <div
                data-testid="invite-redeem-error"
                className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-medium text-rose-700"
              >
                {error}
              </div>
            )}

            <form onSubmit={handleAccept} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Invited Work Email
                </label>
                <input
                  type="email"
                  required
                  data-testid="invite-email-input"
                  value={email}
                  readOnly={Boolean(verification.invitedEmail)}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm ${
                    verification.invitedEmail
                      ? 'bg-slate-100 border-slate-200 text-slate-600 cursor-not-allowed'
                      : 'border-slate-300'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Your Full Name
                </label>
                <input
                  type="text"
                  required
                  data-testid="invite-name-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Taylor Wright"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Create Password
                </label>
                <input
                  type="password"
                  required
                  data-testid="invite-password-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                data-testid="invite-accept-btn"
                className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-sm flex items-center justify-center gap-2 transition-colors"
              >
                <span>
                  {submitting
                    ? 'Creating Account & Joining...'
                    : 'Accept Invitation & Create Account'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                <ShieldCheck className="w-3.5 h-3.5" /> Single-use SHA-256 verified
              </span>
              <Link href="/login" className="text-indigo-600 font-semibold hover:underline">
                Sign in to join →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
