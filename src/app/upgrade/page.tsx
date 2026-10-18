'use client';

import React, { useState } from 'react';
import { WorkspaceShell } from '@/components/WorkspaceShell';
import { CheckCircle2, Sparkles } from 'lucide-react';

export default function UpgradePage() {
  const [annual, setAnnual] = useState(true);
  const [upgradedPlan, setUpgradedPlan] = useState('GROWTH_TRIAL');

  async function selectPlan(planTier: string) {
    setUpgradedPlan(planTier);
    await fetch('/api/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ section: 'billing', planTier }),
    });
  }

  return (
    <WorkspaceShell
      title="Upgrade Your Supademo Workspace"
      subtitle="Unlock HTML Sandbox demos, AI Demo Agents, Route Hubs, Custom Domains, and SAML SSO"
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between bg-indigo-950 text-white p-5 rounded-2xl">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-amber-300" />
            <div>
              <div className="text-sm font-bold">
                Current Workspace Plan: {upgradedPlan}
              </div>
              <div className="text-xs text-indigo-200">
                13 days left in Growth Trial • 1,500 AI Agent Credits active
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setAnnual(!annual)}
            className="px-3.5 py-1.5 rounded-xl bg-white/10 text-xs font-semibold"
          >
            Billing: {annual ? 'Annual (Save 24%)' : 'Monthly'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              id: 'SCALE',
              name: 'Scale',
              price: annual ? '$38' : '$50',
              features: [
                'Unlimited Screenshot & Video Supademos',
                'Dynamic Variables ({{name}}, {{company}})',
                'In-App Demo Hubs & Multi-Demo Showcases',
                'Custom Branding & Custom Domain',
              ],
            },
            {
              id: 'GROWTH',
              name: 'Growth',
              price: annual ? '$350' : '$450',
              popular: true,
              features: [
                '5 Creators included + Unlimited Viewers',
                'Interactive HTML & Sandbox Cloning',
                'AI Demo Agents (1,500 credits/mo) + Route Hubs',
                'AI Voiceover & Translation in 30+ languages',
              ],
            },
            {
              id: 'ENTERPRISE',
              name: 'Enterprise',
              price: 'Custom',
              features: [
                'Custom Creator Seats & Dedicated Workspaces',
                'SAML SSO, SCIM & Invite-Only Audit Logs',
                'US / EU Regional Data Residency & SOC 2 Type II',
                'Dedicated Solutions Engineer',
              ],
            },
          ].map((tier) => (
            <div
              key={tier.id}
              className={`bg-white rounded-2xl border p-6 flex flex-col justify-between ${
                tier.popular
                  ? 'border-indigo-600 ring-2 ring-indigo-600/20'
                  : 'border-slate-200'
              }`}
            >
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">
                  {tier.name}
                </h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-slate-900">
                    {tier.price}
                  </span>
                  {tier.price !== 'Custom' && (
                    <span className="text-xs text-slate-500">/creator/mo</span>
                  )}
                </div>
                <ul className="mt-5 space-y-2.5 text-xs text-slate-700">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                type="button"
                onClick={() => selectPlan(tier.id)}
                className="mt-6 w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold"
              >
                {upgradedPlan === tier.id ? 'Active Workspace Plan' : `Switch to ${tier.name}`}
              </button>
            </div>
          ))}
        </div>
      </div>
    </WorkspaceShell>
  );
}
