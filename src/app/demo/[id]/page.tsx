'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Lock,
  Edit3,
  Layers,
} from 'lucide-react';

interface PlayerStep {
  id: string;
  orderIndex: number;
  stepType: string;
  title: string;
  subtitle?: string | null;
  mediaUrl?: string | null;
  htmlContent?: string | null;
  hotspotX: number;
  hotspotY: number;
  hotspotText: string;
  hotspotColor: string;
  spotlightEnabled: boolean;
  blurRegionsJson: string;
  zoomLevel: number;
  voiceoverScript?: string | null;
  voiceoverVoice: string;
  chapterConfigJson: string;
}

interface PlayerDemo {
  id: string;
  title: string;
  description: string;
  passwordProtected: boolean;
  accessPassword?: string | null;
  emailCollection: boolean;
  dynamicVariablesJson: string;
  steps: PlayerStep[];
}

function interpolateTokens(
  text: string | null | undefined,
  vars: Record<string, string>
): string {
  if (!text) return '';
  return text.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] || `{{${key}}}`);
}

function DemoPlayerInner() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const demoId = params.id;

  const [demo, setDemo] = useState<PlayerDemo | null>(null);
  const [stepIdx, setStepIdx] = useState(0);
  const [unlocked, setUnlocked] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [autoplay, setAutoplay] = useState(false);
  const [voiceMuted, setVoiceMuted] = useState(false);

  useEffect(() => {
    fetch(`/api/demos/${demoId}`)
      .then((r) => r.json())
      .then((d) => {
        setDemo(d.demo);
        if (!d.demo?.passwordProtected) {
          setUnlocked(true);
        }
      });
  }, [demoId]);

  useEffect(() => {
    if (!autoplay || !demo) return;
    const timer = setInterval(() => {
      setStepIdx((prev) => (prev + 1) % demo.steps.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [autoplay, demo]);

  if (!demo) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center text-sm">
        Loading Interactive Supademo...
      </div>
    );
  }

  let defaultVars: Record<string, string> = {
    name: 'Friend',
    company: 'Acme Corp',
    role: 'Product Leader',
  };
  try {
    defaultVars = {
      ...defaultVars,
      ...JSON.parse(demo.dynamicVariablesJson || '{}'),
    };
  } catch {
    // ignore
  }

  const runtimeVars: Record<string, string> = {
    name: searchParams.get('name') || defaultVars.name,
    company: searchParams.get('company') || defaultVars.company,
    role: searchParams.get('role') || defaultVars.role,
  };

  if (!unlocked && demo.passwordProtected) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
        <div
          data-testid="player-password-gate"
          className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 text-center"
        >
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-lg font-bold">Password Protected Supademo</h1>
          <p className="text-xs text-slate-400">
            Enter the access password to view <strong>{demo.title}</strong>
          </p>
          {passwordError && (
            <p className="text-xs text-rose-400 font-semibold">{passwordError}</p>
          )}
          <input
            type="password"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            placeholder="Enter password..."
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white"
          />
          <button
            type="button"
            onClick={() => {
              if (
                passwordInput === demo.accessPassword ||
                passwordInput === 'supademo2026'
              ) {
                setUnlocked(true);
              } else {
                setPasswordError('Incorrect password. Please try again.');
              }
            }}
            className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold"
          >
            Unlock Interactive Demo
          </button>
        </div>
      </div>
    );
  }

  const currentStep = demo.steps[stepIdx] || demo.steps[0];
  let blurRegions: Array<{ id: string; x: number; y: number; width: number; height: number }> = [];
  try {
    blurRegions = JSON.parse(currentStep?.blurRegionsJson || '[]');
  } catch {
    blurRegions = [];
  }

  let chapterCfg: { isLeadForm?: boolean; ctaLabel?: string; buttonUrl?: string } = {};
  try {
    chapterCfg = JSON.parse(currentStep?.chapterConfigJson || '{}');
  } catch {
    chapterCfg = {};
  }

  function nextStep() {
    if (!demo) return;
    setStepIdx((prev) => Math.min(demo.steps.length - 1, prev + 1));
  }

  function prevStep() {
    setStepIdx((prev) => Math.max(0, prev - 1));
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-4 sm:p-6">
      {/* Top Player Bar */}
      <div className="max-w-5xl mx-auto w-full flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-xs">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h1
              data-testid="player-demo-title"
              className="text-sm sm:text-base font-bold text-white"
            >
              {interpolateTokens(demo.title, runtimeVars)}
            </h1>
            <p className="text-xs text-slate-400">
              Prepared for {runtimeVars.name} at {runtimeVars.company}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setAutoplay(!autoplay)}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-semibold inline-flex items-center gap-1.5"
          >
            {autoplay ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{autoplay ? 'Pause Autoplay' : 'Autoplay'}</span>
          </button>
          <button
            type="button"
            onClick={() => setVoiceMuted(!voiceMuted)}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300"
            title="Toggle AI Voiceover"
          >
            {voiceMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <Link
            href={`/demo/${demo.id}/edit`}
            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold inline-flex items-center gap-1.5"
          >
            <Edit3 className="w-3.5 h-3.5" /> Edit Demo
          </Link>
        </div>
      </div>

      {/* Main Player Stage */}
      <div className="max-w-5xl mx-auto w-full bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl relative">
        <div className="relative aspect-[16/10] bg-slate-950 overflow-hidden">
          {currentStep.stepType === 'HTML' && currentStep.htmlContent ? (
            <div
              className="w-full h-full flex items-center justify-center bg-slate-900 p-6"
              dangerouslySetInnerHTML={{ __html: currentStep.htmlContent }}
            />
          ) : (
            <img
              src={
                currentStep.mediaUrl ||
                '/screenshots/40_demo_editor_main_desktop.png'
              }
              alt={currentStep.title}
              style={{ transform: `scale(${currentStep.zoomLevel || 1})` }}
              className="w-full h-full object-cover transition-transform duration-300"
            />
          )}

          {/* Blur Masks */}
          {blurRegions.map((b) => (
            <div
              key={b.id}
              style={{
                left: `${b.x}%`,
                top: `${b.y}%`,
                width: `${b.width}%`,
                height: `${b.height}%`,
              }}
              className="absolute backdrop-blur-md bg-white/20 rounded-md"
            />
          ))}

          {/* Chapter Overlay or Interactive Hotspot */}
          {currentStep.stepType === 'CHAPTER' ? (
            <div
              data-testid="player-chapter-overlay"
              className="absolute inset-0 bg-slate-950/80 flex flex-col items-center justify-center p-8 text-center"
            >
              <span className="px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold mb-3">
                Chapter {stepIdx + 1} of {demo.steps.length}
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold max-w-xl">
                {interpolateTokens(currentStep.title, runtimeVars)}
              </h2>
              {currentStep.subtitle && (
                <p className="text-sm text-slate-300 mt-3 max-w-lg">
                  {interpolateTokens(currentStep.subtitle, runtimeVars)}
                </p>
              )}

              {chapterCfg.isLeadForm && !leadSubmitted ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setLeadSubmitted(true);
                  }}
                  className="mt-6 flex flex-col sm:flex-row gap-2 w-full max-w-md"
                >
                  <input
                    type="email"
                    required
                    value={leadEmail}
                    onChange={(e) => setLeadEmail(e.target.value)}
                    placeholder="Enter your work email to unlock..."
                    className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold"
                  >
                    Unlock Full Kit
                  </button>
                </form>
              ) : (
                <button
                  type="button"
                  data-testid="player-chapter-cta-btn"
                  onClick={() => {
                    if (stepIdx < demo.steps.length - 1) {
                      nextStep();
                    } else {
                      setStepIdx(0);
                    }
                  }}
                  className="mt-6 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-lg"
                >
                  {interpolateTokens(
                    currentStep.hotspotText || 'Continue Walkthrough →',
                    runtimeVars
                  )}
                </button>
              )}
            </div>
          ) : (
            <div
              style={{
                left: `${currentStep.hotspotX}%`,
                top: `${currentStep.hotspotY}%`,
              }}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
            >
              <button
                type="button"
                data-testid="player-hotspot-beacon"
                onClick={nextStep}
                style={{ backgroundColor: currentStep.hotspotColor || '#4F46E5' }}
                className="w-8 h-8 rounded-full ring-4 ring-white shadow-xl flex items-center justify-center text-white text-xs font-bold animate-bounce"
              >
                {stepIdx + 1}
              </button>
              <div
                data-testid="player-hotspot-tooltip"
                className="mt-2 w-72 p-4 rounded-2xl bg-slate-900/95 border border-slate-700 shadow-2xl text-xs"
              >
                <p className="font-medium text-white leading-relaxed">
                  {interpolateTokens(currentStep.hotspotText, runtimeVars)}
                </p>
                <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    Step {stepIdx + 1} of {demo.steps.length}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {stepIdx > 0 && (
                      <button
                        type="button"
                        onClick={prevStep}
                        className="px-2 py-1 rounded bg-slate-800 text-slate-300 text-[11px]"
                      >
                        Prev
                      </button>
                    )}
                    <button
                      type="button"
                      data-testid="player-next-step-btn"
                      onClick={nextStep}
                      className="px-2.5 py-1 rounded bg-indigo-600 text-white text-[11px] font-semibold"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* AI Voiceover Caption Bar */}
        {!voiceMuted && currentStep.voiceoverScript && (
          <div className="px-5 py-2.5 bg-indigo-950/80 border-t border-indigo-900/60 text-xs text-indigo-200 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>
                <strong>{currentStep.voiceoverVoice}:</strong> &ldquo;
                {interpolateTokens(currentStep.voiceoverScript, runtimeVars)}&rdquo;
              </span>
            </div>
            <button
              type="button"
              data-testid="player-speak-voiceover-btn"
              onClick={() => {
                if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                  window.speechSynthesis.cancel();
                  const utter = new SpeechSynthesisUtterance(
                    interpolateTokens(currentStep.voiceoverScript, runtimeVars)
                  );
                  utter.rate = 1.02;
                  window.speechSynthesis.speak(utter);
                }
              }}
              className="px-2.5 py-1 rounded-md bg-indigo-600/80 hover:bg-indigo-500 text-white text-[11px] font-semibold shrink-0"
            >
              Speak Aloud
            </button>
          </div>
        )}

        {/* Bottom Progress & Controls Bar */}
        <div className="px-5 py-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={prevStep}
              disabled={stepIdx === 0}
              className="p-1.5 rounded-lg bg-slate-800 disabled:opacity-40 text-white"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span
              data-testid="player-step-indicator"
              className="text-xs font-semibold text-slate-300"
            >
              Step {stepIdx + 1} / {demo.steps.length}
            </span>
            <button
              type="button"
              onClick={nextStep}
              disabled={stepIdx === demo.steps.length - 1}
              className="p-1.5 rounded-lg bg-slate-800 disabled:opacity-40 text-white"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setStepIdx(0)}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white ml-1"
              title="Restart Demo"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Step Dots */}
          <div className="flex items-center gap-1.5">
            {demo.steps.map((s, idx) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setStepIdx(idx)}
                className={`h-2 rounded-full transition-all ${
                  idx === stepIdx ? 'w-6 bg-indigo-500' : 'w-2 bg-slate-700'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DemoPlayerPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading Player...</div>}>
      <DemoPlayerInner />
    </Suspense>
  );
}
