import Link from 'next/link';
import { MarketingShell } from '@/components/MarketingShell';
import { ArrowRight, CheckCircle2, Play } from 'lucide-react';

const SLUG_CONTENT: Record<
  string,
  { title: string; subtitle: string; screenshot: string; appHref: string; bullets: string[] }
> = {
  'demo-recorder': {
    title: 'Capture interactive product demos in seconds',
    subtitle: 'Record clicks, screenshots, videos, or live HTML DOM states automatically.',
    screenshot: '/screenshots/08_demos_create_modal_desktop.png',
    appHref: '/demos',
    bullets: [
      'Automatic step & hotspot generation on every click',
      'Upload existing screenshots or screen recordings',
      'Capture live HTML & CSS interactive sandboxes',
    ],
  },
  'demo-editor': {
    title: 'Customize & brand every step with the Interactive Demo Editor',
    subtitle: 'Fine-tune Hotspot styles, Blur sensitive data, add Chapters, and configure conditional branching.',
    screenshot: '/screenshots/43_editor_hotspot_panel_desktop.png',
    appHref: '/demo/cmvdpmcll02wb090j10dbikms/edit',
    bullets: [
      'Pointer, Callout, and Area hotspots with Ping/Pulse animations',
      'Non-destructive Blur, Text callout, Arrow, and Rectangle annotations',
      'Chapter covers, lead-capture forms, and password gates',
    ],
  },
  'screen-recorder': {
    title: 'Record crisp product videos & convert to interactive demos',
    subtitle: 'Manage screen recordings in one workspace and turn any video into a step-by-step Supademo.',
    screenshot: '/screenshots/14_videos_library_desktop.png',
    appHref: '/videos',
    bullets: [
      '1080p screen + camera recording library',
      'One-click conversion from video to interactive Supademo',
      'Organize into team & personal folders',
    ],
  },
  personalization: {
    title: 'Personalize every demo with Dynamic Variables & AI Voiceover',
    subtitle: 'Inject {{name}}, {{company}}, and {{role}} tokens and narrate in 30+ languages.',
    screenshot: '/screenshots/54_editor_voiceover_exact.png',
    appHref: '/demo/cmvdpmcll02wb090j10dbikms/edit',
    bullets: [
      'Dynamic URL variables (?name=Alex&company=Stripe)',
      '12 lifelike ElevenLabs & Inworld AI voices + Voice Cloning',
      'Instant AI Translation into 30+ languages',
    ],
  },
  'sandbox-demos': {
    title: 'Interactive Sandbox Demo Environments',
    subtitle: 'Let prospects explore your product freely in a governed, no-code clickable sandbox.',
    screenshot: '/screenshots/50_editor_share_modal_desktop.png',
    appHref: '/demo/cmvdpsandbox002',
    bullets: [
      'Non-linear clickable product environments',
      'Zero engineering maintenance or staging data leaks',
      'Combine guided walkthroughs with open sandbox exploration',
    ],
  },
  'route-hub': {
    title: 'Route Hub: Personalized Demo Routing & Buyer Qualification',
    subtitle: 'Capture leads, qualify buyer intent, and route each prospect to the right Showcase or Demo.',
    screenshot: '/screenshots/67_route_hub_editor_desktop.png',
    appHref: '/route/cmvdqdta100zk090i1gwa89sb/edit',
    bullets: [
      'Three entry modes: Collect leads, Qualify intent, or Both',
      'Visual node routing canvas (FORM → INTEGRATIONS → ROUTE → SHOWCASE)',
      'Real-time CRM enrichment with HubSpot, Salesforce & Slack',
    ],
  },
  'demo-hub': {
    title: 'In-App Demo Hub & Searchable Product Tours',
    subtitle: 'Embed a floating interactive help center widget directly inside your product.',
    screenshot: '/screenshots/65_demo_hub_editor_desktop.png',
    appHref: '/hub/cmvdqcyr100zf090iff8812gy',
    bullets: [
      'Customizable Appearance (Gradient/Solid header, Light/Dark theme, Footer links)',
      'Curated categories & instant keyword search across demos',
      '1-line JavaScript snippet or custom CSS trigger',
    ],
  },
};

export default async function FeatureDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const info = SLUG_CONTENT[slug] || {
    title: `Supademo ${slug.replace(/-/g, ' ')}`,
    subtitle: 'Build high-converting interactive demos and buyer enablement workflows.',
    screenshot: '/screenshots/40_demo_editor_main_desktop.png',
    appHref: '/home',
    bullets: [
      'Interactive multi-step product walkthroughs',
      'AI voiceover, translation & personalization',
      'Enterprise analytics & CRM integrations',
    ],
  };

  return (
    <MarketingShell>
      <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        <div className="space-y-5">
          <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold uppercase tracking-wider">
            Supademo Platform Capability
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
            {info.title}
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">{info.subtitle}</p>
          <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700">
            {info.bullets.map((b) => (
              <li key={b} className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
          <div className="pt-2 flex flex-wrap gap-3">
            <Link
              href={info.appHref}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold inline-flex items-center gap-2"
            >
              <span>Try in Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/demo/cmvdpmcll02wb090j10dbikms"
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs sm:text-sm font-semibold inline-flex items-center gap-2"
            >
              <Play className="w-4 h-4 text-indigo-600" /> Watch Live Demo
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-xl bg-slate-900">
          <img src={info.screenshot} alt={info.title} className="w-full h-auto" />
        </div>
      </div>
    </MarketingShell>
  );
}
