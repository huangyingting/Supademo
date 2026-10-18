'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MarketingShell } from '@/components/MarketingShell';
import { Check, Sparkles, Crown, ShieldCheck } from 'lucide-react';

const PLANS = [
  {
    name: 'Free',
    monthly: '$0',
    annual: '$0',
    unit: 'forever',
    desc: 'For individuals testing interactive product demos.',
    features: [
      'Up to 5 Supademos',
      'Unlimited screenshot & video steps',
      'Share via link or embed',
      'Basic workspace analytics',
    ],
    cta: 'Start Free',
    href: '/signup',
  },
  {
    name: 'Scale',
    monthly: '$38',
    annual: '$27',
    unit: 'per creator / month',
    desc: 'For growing teams scaling onboarding & enablement.',
    features: [
      'Unlimited Supademos & Showcases',
      'Custom branding & watermark removal',
      'Blur & Annotate sensitive data',
      'Zoom & Pan step animations',
      'Trackable links & CRM integrations',
    ],
    cta: 'Start 14-Day Trial',
    href: '/welcome?stage=getStarted',
  },
  {
    name: 'Business',
    monthly: '$199',
    annual: '$149',
    unit: 'per month (includes 5 creators)',
    desc: 'For multi-creator GTM, Product & CS teams.',
    features: [
      'Everything in Scale + 5 Creator seats',
      'In-App Demo Hubs (searchable widgets)',
      'AI Voiceover & AI Translation (30+ languages)',
      'Custom Domain (CNAME SSL)',
      'Demo Versioning & Draft/Publish workflow',
    ],
    cta: 'Start Business Trial',
    href: '/welcome?stage=getStarted',
  },
  {
    name: 'Growth',
    monthly: '$350',
    annual: '$299',
    unit: 'per month',
    popular: true,
    desc: 'Full HTML Sandboxes, Route Hubs & Dynamic Personalization.',
    features: [
      'Unlimited HTML & Interactive Sandbox Demos',
      'Route Hub conditional buyer routing',
      'Dynamic Variables ({{name}}, {{company}})',
      'AI Demo Agent (1,500 credits / ~75 calls)',
      'Voice Cloning & Pronunciation Library',
      'Account-level engagement & lead capture',
    ],
    cta: 'Try Growth Free for 14 Days',
    href: '/home',
  },
  {
    name: 'Enterprise',
    monthly: 'Custom',
    annual: 'Custom',
    unit: 'tailored annual contract',
    desc: 'For organizations requiring SAML SSO, RBAC & audit compliance.',
    features: [
      'Invite-Only Admission & SHA-256 Token Controls',
      'SAML SSO, SCIM & Custom Data Residency',
      'Tamper-evident Security Audit Logs',
      'Unlimited workspaces & dedicated CSM',
      'SOC 2 Type II & custom MSA/SLA',
    ],
    cta: 'Explore Enterprise',
    href: '/enterprise',
  },
];

export default function PricingPage() {
  const [annual, setAnnual] = useState(true);

  return (
    <MarketingShell>
      <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold">
            <Crown className="w-3.5 h-3.5 text-amber-500" /> Viewers are always 100% free
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 mt-3">
            Flexible pricing that scales with your GTM &amp; Product teams
          </h1>
          <p className="text-sm text-slate-600 mt-3">
            Start with a 14-day free Growth trial. Upgrade or customize your plan anytime.
          </p>

          <div className="mt-6 inline-flex items-center gap-2 p-1 rounded-xl bg-slate-100 border border-slate-200">
            <button
              type="button"
              onClick={() => setAnnual(false)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold ${
                !annual ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
              }`}
            >
              Monthly Billing
            </button>
            <button
              type="button"
              onClick={() => setAnnual(true)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold ${
                annual ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600'
              }`}
            >
              Annual Billing (Save up to 28%)
            </button>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-5">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl border p-6 flex flex-col justify-between ${
                plan.popular
                  ? 'border-indigo-600 bg-indigo-950 text-white shadow-xl ring-2 ring-indigo-600'
                  : 'border-slate-200 bg-white text-slate-900'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold">{plan.name}</h2>
                  {plan.popular && (
                    <span className="px-2 py-0.5 rounded-full bg-indigo-500 text-white text-[10px] font-bold uppercase">
                      Most Popular
                    </span>
                  )}
                </div>
                <p
                  className={`text-xs mt-1 ${
                    plan.popular ? 'text-indigo-200' : 'text-slate-500'
                  }`}
                >
                  {plan.desc}
                </p>
                <div className="mt-4">
                  <span className="text-3xl font-extrabold">
                    {annual ? plan.annual : plan.monthly}
                  </span>
                  <div
                    className={`text-[11px] mt-0.5 ${
                      plan.popular ? 'text-indigo-300' : 'text-slate-500'
                    }`}
                  >
                    {plan.unit}
                  </div>
                </div>

                <ul className="mt-5 space-y-2.5 text-xs">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check
                        className={`w-4 h-4 shrink-0 mt-0.5 ${
                          plan.popular ? 'text-emerald-400' : 'text-indigo-600'
                        }`}
                      />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Link
                href={plan.href}
                className={`mt-6 w-full py-2.5 rounded-xl text-center text-xs font-semibold block transition-colors ${
                  plan.popular
                    ? 'bg-indigo-500 hover:bg-indigo-400 text-white'
                    : 'bg-slate-900 hover:bg-slate-800 text-white'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </MarketingShell>
  );
}
