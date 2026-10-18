import Link from 'next/link';
import { MarketingShell } from '@/components/MarketingShell';
import { CheckCircle2, ArrowRight } from 'lucide-react';

const INTEGRATIONS = [
  { name: 'HubSpot', category: 'CRM', desc: 'Sync demo views, step completion rates, and captured leads directly to HubSpot contacts and deals.' },
  { name: 'Salesforce', category: 'CRM', desc: 'Push buyer engagement signals and Route Hub qualification responses into Salesforce.' },
  { name: 'Slack', category: 'Alerts', desc: 'Get real-time Slack notifications when target accounts watch a Supademo or Showcase.' },
  { name: 'Google Analytics 4', category: 'Analytics', desc: 'Stream step-level interactive tour events directly to GA4.' },
  { name: 'Zapier', category: 'Automation', desc: 'Connect Supademo lead captures and completions to 6,000+ cloud tools.' },
  { name: 'Google Tag Manager', category: 'Analytics', desc: 'Inject custom remarketing and conversion tags into standalone demos.' },
  { name: 'Marketo', category: 'Marketing', desc: 'Enrich Marketo lead scoring with step-by-step product tour engagement.' },
  { name: 'Seismic', category: 'Enablement', desc: 'Embed interactive product demos directly inside Seismic sales playbooks.' },
  { name: 'Webhooks & MCP', category: 'Developer', desc: 'Receive signed JSON webhooks and control your workspace via Model Context Protocol.' },
];

export default function IntegrationsMarketingPage() {
  return (
    <MarketingShell>
      <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
            Connect Supademo to your GTM, CRM &amp; Analytics stack
          </h1>
          <p className="text-sm text-slate-600 mt-2">
            Turn passive demo views into actionable buyer intent signals across your revenue tools.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {INTEGRATIONS.map((item) => (
            <div
              key={item.name}
              className="p-6 rounded-2xl border border-slate-200 bg-white flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-slate-900">{item.name}</h2>
                  <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[11px] font-semibold">
                    {item.category}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">{item.desc}</p>
              </div>
              <Link
                href="/settings/integrations"
                className="mt-4 text-xs font-semibold text-indigo-600 inline-flex items-center gap-1"
              >
                Configure in Settings <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </MarketingShell>
  );
}
