'use client';

import React, { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Play, Sparkles, Check, ArrowRight, Crown } from 'lucide-react';

function WelcomeWizardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const stage = searchParams.get('stage') || 'role';

  const [companyName, setCompanyName] = useState('My Company');
  const [role, setRole] = useState('Software Engineering');
  const [teamSize, setTeamSize] = useState('1-5');
  const [useCases, setUseCases] = useState<string[]>([
    'Customer Onboarding & Training',
    'Sales & Presales Enablement',
  ]);
  const [source, setSource] = useState('Search Engine (Google, Bing)');

  function toggleUseCase(uc: string) {
    setUseCases((prev) =>
      prev.includes(uc) ? prev.filter((x) => x !== uc) : [...prev, uc]
    );
  }

  async function completeOnboarding() {
    await fetch('/api/workspace', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: companyName, activateTrial: true }),
    });
    router.push('/home');
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-xl w-full bg-white rounded-2xl border border-slate-200 shadow-xl p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 font-bold text-lg text-slate-900">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <Play className="w-3.5 h-3.5 fill-current" />
            </div>
            <span>Supademo Onboarding</span>
          </div>
          <div className="flex items-center gap-1.5">
            {['role', 'useCase', 'source', 'getStarted', 'getStartedCreate'].map(
              (s, i) => (
                <div
                  key={s}
                  className={`h-1.5 w-6 rounded-full ${
                    s === stage ? 'bg-indigo-600' : 'bg-slate-200'
                  }`}
                />
              )
            )}
          </div>
        </div>

        {stage === 'role' && (
          <div className="space-y-4">
            <h1 className="text-xl font-bold text-slate-900">
              Tell us about your team
            </h1>
            <p className="text-xs text-slate-500">
              Stage 1 of 5 • Personalize your Supademo workspace
            </p>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Company / Workspace Name
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Your Role
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  'Software Engineering',
                  'Product Management',
                  'Sales & Presales',
                  'Product Marketing',
                  'Customer Success',
                  'Founder / Executive',
                ].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`p-2.5 rounded-xl border text-xs font-medium text-left ${
                      role === r
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-semibold'
                        : 'border-slate-200 text-slate-700'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Team Size
              </label>
              <div className="flex flex-wrap gap-2">
                {['1-5', '6-25', '26-100', '101-500', '500+'].map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => setTeamSize(sz)}
                    className={`px-3.5 py-1.5 rounded-lg border text-xs font-medium ${
                      teamSize === sz
                        ? 'border-indigo-600 bg-indigo-600 text-white'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>
            <button
              type="button"
              onClick={() => router.push('/welcome?stage=useCase')}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold flex items-center justify-center gap-2"
            >
              <span>Next</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {stage === 'useCase' && (
          <div className="space-y-4">
            <h1 className="text-xl font-bold text-slate-900">
              How do you plan to use Supademo?
            </h1>
            <p className="text-xs text-slate-500">
              Stage 2 of 5 • Select all use cases that apply
            </p>
            <div className="space-y-2">
              {[
                'Customer Onboarding & Training',
                'Sales & Presales Enablement',
                'Website & Product Marketing Tours',
                'Internal SOPs & Knowledge Base',
                'AI Demo Agents & Buyer Qualification',
              ].map((uc) => {
                const active = useCases.includes(uc);
                return (
                  <button
                    key={uc}
                    type="button"
                    onClick={() => toggleUseCase(uc)}
                    className={`w-full p-3 rounded-xl border text-left text-xs font-medium flex items-center justify-between ${
                      active
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-800 font-semibold'
                        : 'border-slate-200 text-slate-700'
                    }`}
                  >
                    <span>{uc}</span>
                    {active && <Check className="w-4 h-4 text-indigo-600" />}
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              onClick={() => router.push('/welcome?stage=source')}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold"
            >
              Next
            </button>
          </div>
        )}

        {stage === 'source' && (
          <div className="space-y-4">
            <h1 className="text-xl font-bold text-slate-900">
              How did you hear about Supademo?
            </h1>
            <p className="text-xs text-slate-500">Stage 3 of 5 • Attribution</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                'Search Engine (Google, Bing)',
                'LinkedIn / Social Media',
                'Recommended by a Colleague',
                'Saw a Supademo in the wild',
                'G2 / Product Hunt',
                'AI Assistant (ChatGPT / Claude)',
              ].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSource(s)}
                  className={`p-3 rounded-xl border text-xs text-left font-medium ${
                    source === s
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-semibold'
                      : 'border-slate-200 text-slate-700'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => router.push('/welcome?stage=getStarted')}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold"
            >
              Next
            </button>
          </div>
        )}

        {stage === 'getStarted' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-200">
                <Crown className="w-4 h-4 text-amber-300" /> 14-Day Growth Trial
              </div>
              <h2 className="text-lg font-bold mt-1">
                Try Growth Free for 14 Days — $0 Today
              </h2>
              <p className="text-xs text-indigo-100 mt-1">
                Unlock HTML Sandbox Demos, AI Voiceover &amp; Translation, Custom Branding, Dynamic Variables, and Route Hub.
              </p>
            </div>
            <button
              type="button"
              onClick={() => router.push('/welcome?stage=getStartedCreate')}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold"
            >
              Start 14-Day Free Growth Trial
            </button>
          </div>
        )}

        {stage === 'getStartedCreate' && (
          <div className="space-y-4">
            <h1 className="text-xl font-bold text-slate-900">
              You&apos;re all set! How would you like to start?
            </h1>
            <p className="text-xs text-slate-500">
              Stage 5 of 5 • Create your first interactive Supademo or jump into your workspace
            </p>
            <div className="grid grid-cols-1 gap-2.5">
              <button
                type="button"
                onClick={() => router.push('/demo/cmvdpmcll02wb090j10dbikms/edit')}
                className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/60 hover:bg-indigo-100 text-left flex items-center justify-between"
              >
                <div>
                  <div className="text-sm font-bold text-indigo-950">
                    Open Interactive Demo Editor
                  </div>
                  <div className="text-xs text-slate-600">
                    Customize hotspots, AI voiceovers, and dynamic variables right away
                  </div>
                </div>
                <Sparkles className="w-5 h-5 text-indigo-600" />
              </button>
              <button
                type="button"
                onClick={completeOnboarding}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold"
              >
                Do this later → Go to Workspace Home
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function WelcomePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm">Loading onboarding...</div>}>
      <WelcomeWizardContent />
    </Suspense>
  );
}
