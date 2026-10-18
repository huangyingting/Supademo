import Link from 'next/link';
import { MarketingShell } from '@/components/MarketingShell';
import { Sparkles, Bot, ArrowRight, CheckCircle2 } from 'lucide-react';

export default async function AiProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const isAgents = slug === 'demo-agents';

  return (
    <MarketingShell>
      <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        <div className="space-y-5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold">
            {isAgents ? <Bot className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
            <span>{isAgents ? 'Agentic Product Demos' : 'Supademo AI Command & MCP'}</span>
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
            {isAgents
              ? 'AI Demo Agent: Run Product Demos & Qualification on Autopilot'
              : 'AI Command: Run Your Demo Workspace by Asking'}
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            {isAgents
              ? 'Deploy a 24/7 AI Solutions Engineer trained on your Supademos, videos, docs, and websites to answer buyer questions and launch live interactive walkthroughs.'
              : 'Update, translate, analyze, and generate interactive demos via natural language prompts in the AI Command dock or via the Supademo MCP Server.'}
          </p>
          <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
            {(isAgents
              ? [
                  '14-tab Builder: Identity, Interface, Guardrails, Quick Links & Security',
                  'Multi-modal Knowledge Base: Demos, Videos, PDFs, Websites & Text',
                  'Real-time Session Monitor, Buyer Intent Triggers & Knowledge Gap detection',
                ]
              : [
                  'Build multi-step demos from uploads or prompts in seconds',
                  'AI Audit, AI Text rewrite, 12 AI Voices & 30+ language translations',
                  'Native MCP integration for Claude Desktop, Cursor & VS Code',
                ]
            ).map((item) => (
              <li key={item} className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <div className="pt-2 flex gap-3">
            <Link
              href={isAgents ? '/agent/cmvdqb9cw02f30m0jn2h09vg0/edit' : '/command'}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold inline-flex items-center gap-2"
            >
              <span>{isAgents ? 'Open AI Agent Builder' : 'Launch AI Command Studio'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-xl">
          <img
            src={
              isAgents
                ? '/screenshots/63_agent_builder_desktop.png'
                : '/screenshots/12_command_ai_desktop.png'
            }
            alt={slug}
            className="w-full h-auto"
          />
        </div>
      </div>
    </MarketingShell>
  );
}
