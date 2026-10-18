import Link from 'next/link';
import { MarketingShell } from '@/components/MarketingShell';
import { ShieldCheck, Lock, KeyRound, Activity, Globe, ArrowRight } from 'lucide-react';

export default function EnterprisePage() {
  return (
    <MarketingShell>
      <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-12">
        <div className="text-center max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" /> Enterprise-Grade Security &amp; Governance
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 mt-3">
            Built for security-conscious enterprise teams
          </h1>
          <p className="text-sm text-slate-600 mt-3">
            Fail-closed invite-only account admission, SHA-256 single-use invitation codes, SAML SSO, granular RBAC roles, and tamper-evident audit logging.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              href="/admin/invitations"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold inline-flex items-center gap-2"
            >
              <span>Open Invite &amp; Audit Admin Console</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/settings/security"
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs sm:text-sm font-semibold"
            >
              View Security Settings
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            {
              icon: KeyRound,
              title: 'Invite-Only Admission',
              desc: 'Public self-registration is blocked by default. Single-use SHA-256 hashed invitation links bind to a single email and expire automatically.',
            },
            {
              icon: Lock,
              title: 'Granular RBAC & Revocation',
              desc: 'Assign Admin, Creator, Billing Admin, or Viewer roles and revoke pending invites or suspend active sessions immediately.',
            },
            {
              icon: Activity,
              title: 'Tamper-Evident Audit Logs',
              desc: 'Every bootstrap, login, invitation creation, acceptance, revocation, and role change is recorded with actor and timestamp metadata.',
            },
            {
              icon: Globe,
              title: 'Regional Data Residency & SOC 2',
              desc: 'Host workspace assets in US-West-2 or EU-Central-1 with GDPR IP anonymization and non-destructive PII blur masks.',
            },
          ].map((c) => {
            const Icon = c.icon;
            return (
              <div key={c.title} className="p-6 rounded-2xl border border-slate-200 bg-white">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5" />
                </div>
                <h2 className="text-base font-bold text-slate-900">{c.title}</h2>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">{c.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </MarketingShell>
  );
}
