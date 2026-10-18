import Link from 'next/link';
import { MarketingShell } from '@/components/MarketingShell';
import { Play, LayoutGrid, ArrowRight } from 'lucide-react';

export default function MarketingShowcaseGalleryPage() {
  return (
    <MarketingShell>
      <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-10">
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
            Interactive Demo &amp; Customer Showcase Gallery
          </h1>
          <p className="text-sm text-slate-600 mt-2">
            Explore real interactive product tours, HTML sandboxes, and multi-demo Showcases built with Supademo.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm flex flex-col justify-between">
            <img
              src="/screenshots/51_demo_public_player_desktop.png"
              alt="Supademo Interactive Tour"
              className="w-full h-56 object-cover border-b border-slate-100"
            />
            <div className="p-6">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold">
                5-Step Guided + HTML Tour
              </span>
              <h2 className="text-lg font-bold text-slate-900 mt-2">
                Supademo Platform Interactive Tour
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                Includes Chapter intro, Pointer &amp; Callout hotspots, AI Voiceover, HTML Sandbox step, and Lead Capture gate.
              </p>
              <div className="mt-4 flex gap-3">
                <Link
                  href="/demo/cmvdpmcll02wb090j10dbikms"
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold inline-flex items-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5 fill-current" /> Launch Player
                </Link>
                <Link
                  href="/demo/cmvdpmcll02wb090j10dbikms/edit"
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold"
                >
                  Edit in Studio
                </Link>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm flex flex-col justify-between">
            <img
              src="/screenshots/82_showcase_public_view_desktop.png"
              alt="Enterprise Product Enablement Kit"
              className="w-full h-56 object-cover border-b border-slate-100"
            />
            <div className="p-6">
              <span className="px-2.5 py-0.5 rounded-full bg-violet-50 text-violet-700 text-xs font-semibold">
                Multi-Section Showcase
              </span>
              <h2 className="text-lg font-bold text-slate-900 mt-2">
                Enterprise Product Enablement Kit
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                Bundles interactive demos, screen recordings, SOC 2 PDF guides, and pricing links into one shareable hub.
              </p>
              <div className="mt-4 flex gap-3">
                <Link
                  href="/showcase/cmvdq8jjh033xz20jka70wi4b"
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold inline-flex items-center gap-1.5"
                >
                  <LayoutGrid className="w-3.5 h-3.5" /> View Showcase
                </Link>
                <Link
                  href="/showcase/cmvdq8jjh033xz20jka70wi4b/edit"
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold"
                >
                  Open Showcase Editor
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MarketingShell>
  );
}
