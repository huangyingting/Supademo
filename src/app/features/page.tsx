import Link from 'next/link';
import { MarketingShell } from '@/components/MarketingShell';
import { ArrowRight, Sparkles, Layers, Code2, Mic, GitBranch, HelpCircle, Bot, BarChart3 } from 'lucide-react';

const FEATURE_CARDS = [
  { slug: 'demo-recorder', title: 'Demo Recorder & Chrome Extension', desc: 'Automatically record clicks, keystrokes, and full-resolution screenshots or HTML DOM states.', icon: Layers },
  { slug: 'demo-editor', title: 'Interactive Demo Editor', desc: 'Customize Pointer/Callout/Area hotspots, blur sensitive PII, add chapters, and branch steps.', icon: Sparkles },
  { slug: 'screen-recorder', title: 'Screen & Camera Video Recorder', desc: 'Record crisp 1080p product videos and convert any video into a step-by-step interactive Supademo.', icon: Layers },
  { slug: 'personalization', title: 'Dynamic Personalization & AI Voice', desc: 'Personalize titles and callouts with {{name}} & {{company}}, 12 AI voices, and 30+ language translations.', icon: Mic },
  { slug: 'sandbox-demos', title: 'HTML & Sandbox Demo Environments', desc: 'Give buyers a self-paced clickable clone of your product without spinning up staging engineering environments.', icon: Code2 },
  { slug: 'route-hub', title: 'Route Hub (Lead & Intent Routing)', desc: 'Qualify buyer intent with smart forms and conditionally route prospects to the right Showcase or Demo.', icon: GitBranch },
  { slug: 'demo-hub', title: 'In-App Demo Hub & Product Tours', desc: 'Embed a searchable floating help center widget directly inside your web application.', icon: HelpCircle },
  { slug: 'analytics', title: 'Account & Step-Level Analytics', desc: 'Track engaged views, step drop-off, captured leads, and sync buyer intent to HubSpot & Salesforce.', icon: BarChart3 },
];

export default function FeaturesIndexPage() {
  return (
    <MarketingShell>
      <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900">
            Supademo Features: Interactive Demos, AI &amp; Route Hub
          </h1>
          <p className="text-sm text-slate-600 mt-3">
            Everything you need to record, edit, personalize, and orchestrate interactive product experiences.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURE_CARDS.map((f) => {
            const Icon = f.icon;
            return (
              <Link
                key={f.slug}
                href={`/features/${f.slug}`}
                className="p-6 rounded-2xl border border-slate-200 bg-white hover:border-indigo-500 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h2 className="text-base font-bold text-slate-900">{f.title}</h2>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">{f.desc}</p>
                </div>
                <span className="mt-4 text-xs font-semibold text-indigo-600 inline-flex items-center gap-1">
                  Learn more <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </MarketingShell>
  );
}
