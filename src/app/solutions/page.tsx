import Link from 'next/link';
import { MarketingShell } from '@/components/MarketingShell';
import { ArrowRight } from 'lucide-react';

export default function SolutionsPage() {
  const solutions = [
    { role: 'Sales & Presales Engineering', metric: '$100k+ pipeline influenced', desc: 'Send personalized Sandbox Demos and Route Hubs before discovery calls and track stakeholder engagement.' },
    { role: 'Customer Success & Onboarding', metric: '75% faster onboarding', desc: 'Embed searchable In-App Demo Hubs and step-by-step interactive SOPs directly inside your app.' },
    { role: 'Product Marketing & Growth', metric: '+50% website conversion rate', desc: 'Replace static screenshots and passive videos with interactive hero product tours and lead-capture chapters.' },
    { role: 'Internal Enablement & L&D', metric: '10x faster SOP documentation', desc: 'Record workflows once and export to interactive tours, MP4 videos, and step-by-step PDF guides.' },
  ];

  return (
    <MarketingShell>
      <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
            Supademo by Role: Interactive Demos for Every Team
          </h1>
          <p className="text-sm text-slate-600 mt-2">
            Purpose-built playbooks for Presales, Product Marketing, Customer Success, and Enablement.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {solutions.map((s) => (
            <div key={s.role} className="p-6 rounded-2xl border border-slate-200 bg-white space-y-3">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold">
                {s.metric}
              </span>
              <h2 className="text-lg font-bold text-slate-900">{s.role}</h2>
              <p className="text-xs text-slate-600 leading-relaxed">{s.desc}</p>
              <Link href="/home" className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600">
                Launch Playbook in Workspace <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </MarketingShell>
  );
}
