'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Play, ShieldCheck, ArrowRight, Lock } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('powlowskijoshuah@gmail.com');
  const [password, setPassword] = useState('ChangeMeStrongPassword123!');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });
      if (res?.error) {
        setError('Invalid credentials or account has been suspended.');
      } else {
        router.push('/home');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-white">
      {/* Left Auth Column */}
      <div className="flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-20 max-w-xl mx-auto w-full">
        <Link href="/" className="inline-flex items-center gap-2.5 font-bold text-xl text-slate-900 mb-10">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
            <Play className="w-4 h-4 fill-current" />
          </div>
          <span>Supademo</span>
        </Link>

        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
          Welcome back!
        </h1>
        <p className="text-sm text-slate-500 mt-1.5 mb-6">
          Use an organization email to easily collaborate with teammates
        </p>

        {error && (
          <div
            data-testid="login-error"
            className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-medium text-rose-700"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Work email
            </label>
            <input
              type="email"
              required
              data-testid="login-email-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
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
              data-testid="login-password-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            data-testid="login-submit-btn"
            className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-sm flex items-center justify-center gap-2 transition-colors"
          >
            <span>{loading ? 'Signing in...' : 'Continue'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="my-6 flex items-center gap-3 text-xs text-slate-400">
          <div className="flex-1 h-px bg-slate-200" />
          <span>or continue with</span>
          <div className="flex-1 h-px bg-slate-200" />
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          {['Google', 'Microsoft', 'SSO'].map((provider) => (
            <button
              key={provider}
              type="button"
              onClick={() => router.push('/home')}
              className="py-2 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700"
            >
              {provider}
            </button>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between text-xs text-slate-500">
          <span>
            Have an invitation link?{' '}
            <Link href="/signup" className="text-indigo-600 font-semibold hover:underline">
              Redeem Invite
            </Link>
          </span>
          <Link href="/home" className="text-slate-600 hover:text-indigo-600 font-medium">
            Continue to Demo Workspace →
          </Link>
        </div>
      </div>

      {/* Right Social Proof Column matching app.supademo.com/login */}
      <div className="hidden lg:flex flex-col justify-between p-14 bg-gradient-to-br from-indigo-950 via-slate-900 to-violet-950 text-white">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-xs font-semibold text-indigo-200">
            <Lock className="w-3.5 h-3.5" /> Enterprise Invite-Only Workspace
          </span>
          <h2 className="text-3xl font-bold mt-6 leading-tight">
            Modern teams scale product enablement &amp; presales with Supademo
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-4 my-8">
          {[
            { metric: '75%', label: 'Faster content production', author: 'Nova Siegmann • VRIFY' },
            { metric: '50%', label: 'Better conversion rates', author: 'EJ White • Head of Growth' },
            { metric: '$100k+', label: 'Contracts closed', author: 'Felix True • Head of Presales' },
            { metric: '60+ hrs', label: 'Sales calls saved monthly', author: 'Robb Clarke • Head of AI' },
          ].map((card) => (
            <div
              key={card.label}
              className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm"
            >
              <div className="text-2xl font-extrabold text-indigo-300">{card.metric}</div>
              <div className="text-xs font-medium text-white mt-1">{card.label}</div>
              <div className="text-[11px] text-slate-400 mt-2">{card.author}</div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400 border-t border-white/10 pt-6">
          <span>Trusted by 200,000 professionals and 3,000 companies</span>
          <span className="inline-flex items-center gap-1 text-emerald-400">
            <ShieldCheck className="w-4 h-4" /> SOC 2 Type II
          </span>
        </div>
      </div>
    </div>
  );
}
