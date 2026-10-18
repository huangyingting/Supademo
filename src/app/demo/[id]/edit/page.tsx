'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  MousePointerClick,
  EyeOff,
  Mic,
  Sparkles,
  BookOpen,
  UserCheck,
  Wand2,
  Share2,
  Play,
  History,
  MessageSquare,
  Plus,
  Trash2,
  CheckCircle2,
  Copy,
  Lock,
  Globe,
  Code,
  Download,
} from 'lucide-react';

interface DemoStep {
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
  hotspotPosition: string;
  hotspotStyle: string;
  hotspotColor: string;
  hotspotTrigger: string;
  showNextButton: boolean;
  showPrevButton: boolean;
  spotlightEnabled: boolean;
  blurRegionsJson: string;
  annotationsJson: string;
  zoomLevel: number;
  transitionType: string;
  voiceoverScript?: string | null;
  voiceoverVoice: string;
  voiceoverUrl?: string | null;
  chapterConfigJson: string;
}

interface DemoDetail {
  id: string;
  title: string;
  description: string;
  type: string;
  visibility: string;
  passwordProtected: boolean;
  accessPassword?: string | null;
  emailCollection: boolean;
  allowExport: boolean;
  dynamicVariablesJson: string;
  language: string;
  steps: DemoStep[];
  versions: Array<{ id: string; versionNum: number; label: string; createdAt: string }>;
  comments: Array<{ id: string; body: string; createdAt: string; author?: { name?: string; email: string } }>;
}

type ToolTab =
  | 'HOTSPOT'
  | 'BLUR'
  | 'VOICEOVER'
  | 'ANIMATION'
  | 'CHAPTER'
  | 'PERSONALIZE'
  | 'ENHANCE_AI';

export default function DemoEditorPage() {
  const params = useParams<{ id: string }>();
  const demoId = params.id;

  const [demo, setDemo] = useState<DemoDetail | null>(null);
  const [selectedStepIdx, setSelectedStepIdx] = useState(0);
  const [activeTool, setActiveTool] = useState<ToolTab>('HOTSPOT');
  const [savingStatus, setSavingStatus] = useState<'Saved' | 'Saving...'>('Saved');
  const [shareOpen, setShareOpen] = useState(false);
  const [versionsOpen, setVersionsOpen] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [aiTone, setAiTone] = useState('Benefit-Driven');
  const [aiLanguage, setAiLanguage] = useState('Spanish');
  const [personalizeCompany, setPersonalizeCompany] = useState('Stripe');
  const [personalizeName, setPersonalizeName] = useState('Alex');
  const [copiedMsg, setCopiedMsg] = useState('');

  async function loadDemo() {
    const res = await fetch(`/api/demos/${demoId}`);
    if (res.ok) {
      const data = await res.json();
      setDemo(data.demo);
    }
  }

  useEffect(() => {
    loadDemo();
  }, [demoId]);

  const currentStep = demo?.steps?.[selectedStepIdx] || demo?.steps?.[0];

  async function updateStep(patch: Partial<DemoStep>) {
    if (!demo || !currentStep) return;
    setSavingStatus('Saving...');
    const updatedSteps = demo.steps.map((s, idx) =>
      idx === selectedStepIdx ? { ...s, ...patch } : s
    );
    setDemo({ ...demo, steps: updatedSteps });

    await fetch(`/api/demos/${demo.id}/steps/${currentStep.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    });
    setSavingStatus('Saved');
  }

  async function updateDemoMeta(patch: Partial<DemoDetail>) {
    if (!demo) return;
    setSavingStatus('Saving...');
    setDemo({ ...demo, ...patch });
    await fetch(`/api/demos/${demo.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    });
    setSavingStatus('Saved');
  }

  async function handleAddStep(stepType: 'IMAGE' | 'CHAPTER' = 'IMAGE') {
    if (!demo) return;
    setSavingStatus('Saving...');
    await fetch(`/api/demos/${demo.id}/steps`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        stepType,
        title: stepType === 'CHAPTER' ? 'New Chapter Cover' : `Step ${demo.steps.length + 1}`,
        subtitle:
          stepType === 'CHAPTER'
            ? 'Guided interactive walkthrough section'
            : undefined,
        hotspotText:
          stepType === 'CHAPTER'
            ? 'Start Chapter'
            : 'Click here to continue through the workflow.',
      }),
    });
    await loadDemo();
    setSavingStatus('Saved');
  }

  async function handleDeleteStep(stepId: string) {
    if (!demo || demo.steps.length <= 1) return;
    await fetch(`/api/demos/${demo.id}/steps/${stepId}`, { method: 'DELETE' });
    setSelectedStepIdx(0);
    await loadDemo();
  }

  async function runAiAction(action: string, extra?: Record<string, string>) {
    if (!demo) return;
    setSavingStatus('Saving...');
    await fetch(`/api/demos/${demo.id}/ai`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode: action, action, ...extra }),
    });
    await loadDemo();
    setSavingStatus('Saved');
  }

  async function handleUploadStepImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !currentStep) return;
    setSavingStatus('Saving...');
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/uploads', {
      method: 'POST',
      body: formData,
    });
    if (res.ok) {
      const data = await res.json();
      await updateStep({ mediaUrl: data.url });
    }
    setSavingStatus('Saved');
  }

  async function handleSaveVersion() {
    if (!demo) return;
    await fetch(`/api/demos/${demo.id}/versions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        label: `Snapshot (${new Date().toLocaleTimeString()})`,
      }),
    });
    await loadDemo();
  }

  async function handleRestoreVersion(versionId: string) {
    if (!demo) return;
    await fetch(`/api/demos/${demo.id}/versions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'RESTORE', versionId }),
    });
    await loadDemo();
    setVersionsOpen(false);
  }

  async function handleAddComment(e: React.FormEvent) {
    e.preventDefault();
    if (!demo || !newComment.trim()) return;
    await fetch(`/api/demos/${demo.id}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body: newComment, stepId: currentStep?.id }),
    });
    setNewComment('');
    await loadDemo();
  }

  function handleCanvasClick(e: React.MouseEvent<HTMLDivElement>) {
    if (!currentStep || currentStep.stepType === 'CHAPTER') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
    updateStep({
      hotspotX: Math.max(5, Math.min(95, x)),
      hotspotY: Math.max(5, Math.min(95, y)),
    });
  }

  function addBlurMask() {
    if (!currentStep) return;
    let existing: Array<{ id: string; x: number; y: number; width: number; height: number; type: string }> = [];
    try {
      existing = JSON.parse(currentStep.blurRegionsJson || '[]');
    } catch {
      existing = [];
    }
    const next = [
      ...existing,
      {
        id: `blur-${Date.now()}`,
        x: 15 + (existing.length * 10) % 50,
        y: 20 + (existing.length * 10) % 50,
        width: 24,
        height: 10,
        type: 'blur',
      },
    ];
    updateStep({ blurRegionsJson: JSON.stringify(next) });
  }

  function clearBlurMasks() {
    updateStep({ blurRegionsJson: '[]' });
  }

  if (!demo || !currentStep) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center text-sm">
        Loading Interactive Demo Editor...
      </div>
    );
  }

  let blurRegions: Array<{ id: string; x: number; y: number; width: number; height: number }> = [];
  try {
    blurRegions = JSON.parse(currentStep.blurRegionsJson || '[]');
  } catch {
    blurRegions = [];
  }

  const personalizedShareUrl = `${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/demo/${demo.id}?name=${encodeURIComponent(personalizeName)}&company=${encodeURIComponent(personalizeCompany)}`;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Top Editor Header & 7-Tool Ribbon matching app.supademo.com/demo/[id]/edit */}
      <header className="bg-white border-b border-slate-200 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <Link
            href="/demos"
            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600"
            title="Back to Demos"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <input
              type="text"
              data-testid="editor-demo-title-input"
              value={demo.title}
              onChange={(e) => updateDemoMeta({ title: e.target.value })}
              className="text-sm font-bold text-slate-900 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-600 focus:outline-none"
            />
            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <span>{savingStatus}</span>
              <span>•</span>
              <span>{demo.steps.length} Steps</span>
              <span>•</span>
              <span>Language: {demo.language}</span>
            </div>
          </div>
        </div>

        {/* Center 7-Tool Action Ribbon */}
        <div
          data-testid="editor-top-toolbar"
          className="flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-xl"
        >
          {[
            { id: 'HOTSPOT', label: 'Hotspot', icon: MousePointerClick },
            { id: 'BLUR', label: 'Blur & Annotate', icon: EyeOff },
            { id: 'VOICEOVER', label: 'Voiceover', icon: Mic },
            { id: 'ANIMATION', label: 'Animation', icon: Sparkles },
            { id: 'CHAPTER', label: 'Chapter', icon: BookOpen },
            { id: 'PERSONALIZE', label: 'Personalize', icon: UserCheck },
            { id: 'ENHANCE_AI', label: 'Enhance with AI', icon: Wand2 },
          ].map((tool) => {
            const Icon = tool.icon;
            const active = activeTool === tool.id;
            return (
              <button
                key={tool.id}
                type="button"
                data-testid={`editor-tool-${tool.id.toLowerCase()}`}
                onClick={() => setActiveTool(tool.id as ToolTab)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors ${
                  active
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tool.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Actions: Version History, Comments, Preview, Share */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setVersionsOpen(true)}
            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600"
            title="Version History"
          >
            <History className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setCommentsOpen(true)}
            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 relative"
            title="Review Comments"
          >
            <MessageSquare className="w-4 h-4" />
            {demo.comments?.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[9px] font-bold flex items-center justify-center absolute -top-1 -right-1">
                {demo.comments.length}
              </span>
            )}
          </button>
          <Link
            href={`/demo/${demo.id}`}
            data-testid="editor-preview-btn"
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 inline-flex items-center gap-1.5"
          >
            <Play className="w-3.5 h-3.5" /> Preview
          </Link>
          <button
            type="button"
            data-testid="editor-share-btn"
            onClick={() => setShareOpen(true)}
            className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold inline-flex items-center gap-1.5"
          >
            <Share2 className="w-3.5 h-3.5" /> Share
          </button>
        </div>
      </header>

      {/* Main Editor Body: Left Step Rail + Center Interactive Canvas + Right Active Tool Inspector */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Step Rail */}
        <aside className="w-full lg:w-64 bg-white border-r border-slate-200 p-3 flex flex-col justify-between overflow-y-auto max-h-[calc(100vh-60px)]">
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Slides / Steps
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  data-testid="editor-add-step-btn"
                  onClick={() => handleAddStep('IMAGE')}
                  className="px-2 py-1 rounded-md bg-indigo-50 text-indigo-700 text-[11px] font-semibold inline-flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Step
                </button>
                <button
                  type="button"
                  onClick={() => handleAddStep('CHAPTER')}
                  className="px-2 py-1 rounded-md bg-slate-100 text-slate-700 text-[11px] font-semibold inline-flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Chapter
                </button>
              </div>
            </div>

            {demo.steps.map((step, index) => {
              const selected = index === selectedStepIdx;
              return (
                <div
                  key={step.id}
                  onClick={() => setSelectedStepIdx(index)}
                  data-testid={`editor-step-item-${index}`}
                  className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                    selected
                      ? 'border-indigo-600 bg-indigo-50/40 ring-2 ring-indigo-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 mb-1.5">
                    <span>
                      #{index + 1} • {step.stepType}
                    </span>
                    {demo.steps.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteStep(step.id);
                        }}
                        className="text-slate-400 hover:text-rose-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="h-20 rounded-lg bg-slate-900 overflow-hidden relative">
                    <img
                      src={
                        step.mediaUrl ||
                        '/screenshots/40_demo_editor_main_desktop.png'
                      }
                      alt={step.title}
                      className="w-full h-full object-cover opacity-85"
                    />
                  </div>
                  <p className="text-xs font-medium text-slate-800 mt-1.5 truncate">
                    {step.title}
                  </p>
                </div>
              );
            })}
          </div>
        </aside>

        {/* Center Interactive Stage Canvas */}
        <div className="flex-1 p-6 flex flex-col items-center justify-between overflow-y-auto">
          <div className="w-full max-w-4xl bg-slate-950 rounded-2xl overflow-hidden shadow-xl border border-slate-800 relative">
            {/* Browser Chrome Header */}
            <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="ml-2 text-slate-300 font-medium">
                  Step {selectedStepIdx + 1}: {currentStep.title}
                </span>
              </div>
              <span className="text-[11px] text-indigo-300">
                Click anywhere on canvas to reposition Hotspot ({Math.round(currentStep.hotspotX)}%,{' '}
                {Math.round(currentStep.hotspotY)}%)
              </span>
            </div>

            {/* Interactive Slide Surface */}
            <div
              data-testid="editor-canvas-stage"
              onClick={handleCanvasClick}
              className="relative aspect-[16/10] bg-slate-900 cursor-crosshair overflow-hidden select-none"
            >
              <img
                src={
                  currentStep.mediaUrl ||
                  '/screenshots/40_demo_editor_main_desktop.png'
                }
                alt={currentStep.title}
                style={{ transform: `scale(${currentStep.zoomLevel || 1})` }}
                className="w-full h-full object-cover transition-transform duration-300"
              />

              {/* Spotlight Dim Overlay */}
              {currentStep.spotlightEnabled && currentStep.stepType !== 'CHAPTER' && (
                <div className="absolute inset-0 bg-slate-950/35 pointer-events-none" />
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
                  className="absolute backdrop-blur-md bg-white/25 border border-indigo-400/70 rounded-md flex items-center justify-center text-[10px] font-bold text-slate-900"
                >
                  REDACTED PII
                </div>
              ))}

              {/* Chapter Overlay or Hotspot Callout */}
              {currentStep.stepType === 'CHAPTER' ? (
                <div className="absolute inset-0 bg-slate-950/75 flex flex-col items-center justify-center p-8 text-center text-white">
                  <span className="px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold mb-3">
                    Interactive Chapter
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold max-w-xl">
                    {currentStep.title}
                  </h2>
                  {currentStep.subtitle && (
                    <p className="text-sm text-slate-300 mt-2 max-w-lg">
                      {currentStep.subtitle}
                    </p>
                  )}
                  <button
                    type="button"
                    className="mt-6 px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold shadow-lg"
                  >
                    {currentStep.hotspotText || 'Start Interactive Tour →'}
                  </button>
                </div>
              ) : (
                <div
                  style={{
                    left: `${currentStep.hotspotX}%`,
                    top: `${currentStep.hotspotY}%`,
                  }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
                >
                  {/* Pulsing Beacon */}
                  <div
                    style={{ backgroundColor: currentStep.hotspotColor || '#4F46E5' }}
                    className="w-7 h-7 rounded-full ring-4 ring-white shadow-lg flex items-center justify-center text-white text-xs font-bold animate-pulse"
                  >
                    {selectedStepIdx + 1}
                  </div>
                  {/* Callout Tooltip */}
                  <div className="mt-2 w-64 p-3.5 rounded-xl bg-slate-900/95 text-white border border-slate-700 shadow-2xl text-xs">
                    <p className="font-medium leading-relaxed">
                      {currentStep.hotspotText}
                    </p>
                    <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                      <span>
                        Step {selectedStepIdx + 1} of {demo.steps.length}
                      </span>
                      <span className="text-indigo-400 font-semibold">
                        Next →
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Canvas Bar */}
          <div className="mt-4 px-4 py-2 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center gap-4 text-xs text-slate-600">
            <span>
              Zoom: <strong>{Math.round((currentStep.zoomLevel || 1) * 100)}%</strong>
            </span>
            <span>•</span>
            <span>
              Trigger: <strong>{currentStep.hotspotTrigger}</strong>
            </span>
            <span>•</span>
            <span>
              Voiceover:{' '}
              <strong>
                {currentStep.voiceoverScript ? currentStep.voiceoverVoice : 'None'}
              </strong>
            </span>
          </div>
        </div>

        {/* Right Inspector Drawer for the 7 Top Toolbar Tools */}
        <aside
          data-testid="editor-inspector-panel"
          className="w-full lg:w-80 bg-white border-l border-slate-200 p-5 overflow-y-auto max-h-[calc(100vh-60px)] space-y-5"
        >
          {activeTool === 'HOTSPOT' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900">
                Hotspot Text &amp; Appearance
              </h3>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Step Title
                </label>
                <input
                  type="text"
                  value={currentStep.title}
                  onChange={(e) => updateStep({ title: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Replace Step Screenshot / Media Asset
                </label>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  data-testid="editor-step-upload-input"
                  onChange={handleUploadStepImage}
                  className="w-full text-[11px] text-slate-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Hotspot Callout Copy (supports &#123;&#123;company&#125;&#125;)
                </label>
                <textarea
                  rows={3}
                  data-testid="editor-hotspot-text-input"
                  value={currentStep.hotspotText}
                  onChange={(e) => updateStep({ hotspotText: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tooltip Position
                  </label>
                  <select
                    value={currentStep.hotspotPosition}
                    onChange={(e) =>
                      updateStep({ hotspotPosition: e.target.value })
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs"
                  >
                    <option value="bottom">Bottom</option>
                    <option value="top">Top</option>
                    <option value="left">Left</option>
                    <option value="right">Right</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Advance Trigger
                  </label>
                  <select
                    value={currentStep.hotspotTrigger}
                    onChange={(e) =>
                      updateStep({ hotspotTrigger: e.target.value })
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs"
                  >
                    <option value="CLICK">On Click</option>
                    <option value="HOVER">On Hover</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Hotspot Beacon Color
                </label>
                <input
                  type="color"
                  value={currentStep.hotspotColor || '#4F46E5'}
                  onChange={(e) => updateStep({ hotspotColor: e.target.value })}
                  className="w-full h-9 rounded-lg border border-slate-300 cursor-pointer"
                />
              </div>
              <label className="flex items-center gap-2 text-xs font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={currentStep.spotlightEnabled}
                  onChange={(e) =>
                    updateStep({ spotlightEnabled: e.target.checked })
                  }
                />
                <span>Enable Spotlight background dimming</span>
              </label>
            </div>
          )}

          {activeTool === 'BLUR' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900">
                Blur &amp; Redact Sensitive PII
              </h3>
              <p className="text-xs text-slate-500">
                Add non-destructive Gaussian blur overlays over customer emails, revenue figures, or API keys.
              </p>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  data-testid="editor-add-blur-btn"
                  onClick={addBlurMask}
                  className="w-full py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold"
                >
                  + Add PII Redaction Blur Mask
                </button>
                <button
                  type="button"
                  onClick={clearBlurMasks}
                  className="w-full py-2 rounded-lg border border-slate-200 text-slate-700 text-xs font-semibold"
                >
                  Clear All Blur Masks ({blurRegions.length})
                </button>
              </div>
            </div>
          )}

          {activeTool === 'VOICEOVER' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900">
                AI Voiceover &amp; Narration
              </h3>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  AI Voice Persona
                </label>
                <select
                  value={currentStep.voiceoverVoice}
                  onChange={(e) =>
                    updateStep({ voiceoverVoice: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                >
                  <option value="Nova (US Female - Warm)">
                    Nova (US Female - Warm)
                  </option>
                  <option value="Alloy (US Male - Crisp)">
                    Alloy (US Male - Crisp)
                  </option>
                  <option value="Rachel (UK Female - Executive)">
                    Rachel (UK Female - Executive)
                  </option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Step Narration Script
                </label>
                <textarea
                  rows={4}
                  value={currentStep.voiceoverScript || ''}
                  onChange={(e) =>
                    updateStep({ voiceoverScript: e.target.value })
                  }
                  placeholder="Enter narration or generate automatically from hotspot text..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                />
              </div>
              <button
                type="button"
                data-testid="editor-generate-voiceover-btn"
                onClick={() =>
                  runAiAction('GENERATE_VOICEOVER', {
                    voice: currentStep.voiceoverVoice,
                  })
                }
                className="w-full py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold"
              >
                Generate AI Voiceover Across All Steps
              </button>
            </div>
          )}

          {activeTool === 'ANIMATION' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900">
                Auto Pan &amp; Zoom Animation
              </h3>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Canvas Zoom Level ({currentStep.zoomLevel.toFixed(1)}x)
                </label>
                <input
                  type="range"
                  min={1}
                  max={1.8}
                  step={0.1}
                  value={currentStep.zoomLevel}
                  onChange={(e) =>
                    updateStep({ zoomLevel: parseFloat(e.target.value) })
                  }
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Step Transition Style
                </label>
                <select
                  value={currentStep.transitionType}
                  onChange={(e) =>
                    updateStep({ transitionType: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                >
                  <option value="SMOOTH_PAN">Smooth Pan &amp; Zoom</option>
                  <option value="FADE">Cross-Fade</option>
                  <option value="INSTANT">Instant Cut</option>
                </select>
              </div>
            </div>
          )}

          {activeTool === 'CHAPTER' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900">
                Chapters &amp; Lead Capture Gates
              </h3>
              <p className="text-xs text-slate-500">
                Break long tours into multi-chapter narratives or gate access behind an email capture form.
              </p>
              <button
                type="button"
                onClick={() => handleAddStep('CHAPTER')}
                className="w-full py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold"
              >
                + Insert Title Chapter Slide
              </button>
              <label className="flex items-center gap-2 text-xs font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={demo.emailCollection}
                  onChange={(e) =>
                    updateDemoMeta({ emailCollection: e.target.checked })
                  }
                />
                <span>Require Viewer Email Before Final Chapter</span>
              </label>
            </div>
          )}

          {activeTool === 'PERSONALIZE' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900">
                Dynamic Personalization Variables
              </h3>
              <p className="text-xs text-slate-500">
                Insert tokens like <code>&#123;&#123;name&#125;&#125;</code> or{' '}
                <code>&#123;&#123;company&#125;&#125;</code> into any hotspot or chapter title.
              </p>
              <div className="flex flex-wrap gap-1.5">
                {['{{name}}', '{{company}}', '{{role}}'].map((token) => (
                  <button
                    key={token}
                    type="button"
                    onClick={() =>
                      updateStep({
                        hotspotText: `${currentStep.hotspotText} ${token}`,
                      })
                    }
                    className="px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 text-xs font-mono font-semibold"
                  >
                    + {token}
                  </button>
                ))}
              </div>
              <div className="pt-2 border-t border-slate-200 space-y-2">
                <label className="block text-xs font-semibold text-slate-700">
                  Test Prospect Name
                </label>
                <input
                  type="text"
                  value={personalizeName}
                  onChange={(e) => setPersonalizeName(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                />
                <label className="block text-xs font-semibold text-slate-700">
                  Test Account Company
                </label>
                <input
                  type="text"
                  value={personalizeCompany}
                  onChange={(e) => setPersonalizeCompany(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                />
              </div>
            </div>
          )}

          {activeTool === 'ENHANCE_AI' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900">
                Enhance &amp; Translate with AI
              </h3>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Rewrite Callout Tone
                </label>
                <select
                  value={aiTone}
                  onChange={(e) => setAiTone(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs mb-2"
                >
                  <option value="Benefit-Driven">Benefit-Driven (Sales)</option>
                  <option value="Technical">Technical &amp; Precise</option>
                  <option value="Concise">Concise Action Steps</option>
                </select>
                <button
                  type="button"
                  data-testid="editor-ai-rewrite-btn"
                  onClick={() => runAiAction('AI_TEXT', { tone: aiTone })}
                  className="w-full py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold"
                >
                  Rewrite All Step Hotspots ({aiTone})
                </button>
              </div>

              <div className="pt-3 border-t border-slate-200">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Translate Entire Supademo (30+ Languages)
                </label>
                <select
                  value={aiLanguage}
                  onChange={(e) => setAiLanguage(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs mb-2"
                >
                  <option value="Spanish (es-ES)">Spanish (Español)</option>
                  <option value="French (fr-FR)">French (Français)</option>
                  <option value="German (de-DE)">German (Deutsch)</option>
                  <option value="Japanese (ja-JP)">Japanese (日本語)</option>
                </select>
                <button
                  type="button"
                  data-testid="editor-ai-translate-btn"
                  onClick={() =>
                    runAiAction('AI_TRANSLATE', { language: aiLanguage })
                  }
                  className="w-full py-2 rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-700 text-xs font-semibold"
                >
                  Translate Supademo to {aiLanguage}
                </button>
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* Share & Export Modal */}
      {shareOpen && (
        <div
          data-testid="editor-share-modal"
          className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                Share, Personalize &amp; Export Supademo
              </h3>
              <button
                type="button"
                onClick={() => setShareOpen(false)}
                className="text-xs font-semibold text-slate-500"
              >
                Close
              </button>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">
                Personalized Trackable Share Link
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={personalizedShareUrl}
                  className="flex-1 px-3 py-2 rounded-lg border border-slate-300 bg-slate-50 text-xs font-mono"
                />
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(personalizedShareUrl);
                    setCopiedMsg('Copied share link!');
                  }}
                  className="px-3 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold inline-flex items-center gap-1"
                >
                  <Copy className="w-3.5 h-3.5" /> Copy
                </button>
              </div>
              {copiedMsg && (
                <p className="text-[11px] text-emerald-600 font-semibold">
                  {copiedMsg}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">
                Responsive Iframe Embed Code
              </label>
              <pre className="p-3 rounded-xl bg-slate-950 text-emerald-300 text-[11px] font-mono overflow-x-auto">
{`<iframe src="${personalizedShareUrl}&embed=true" width="100%" height="640" frameborder="0" allowfullscreen></iframe>`}
              </pre>
            </div>

            <div className="pt-2 border-t border-slate-200 space-y-2">
              <label className="block text-xs font-semibold text-slate-700">
                Export Multi-Format Documentation &amp; Archives
              </label>
              <div className="grid grid-cols-2 gap-2">
                <a
                  href={`/api/demos/${demo.id}/export?format=sop`}
                  target="_blank"
                  rel="noreferrer"
                  data-testid="export-sop-link"
                  className="px-3 py-2 rounded-lg border border-slate-200 hover:border-indigo-300 bg-slate-50 text-xs font-semibold text-slate-800 text-center"
                >
                  Printable SOP / PDF Guide
                </a>
                <a
                  href={`/api/demos/${demo.id}/export?format=html`}
                  data-testid="export-html-link"
                  className="px-3 py-2 rounded-lg border border-slate-200 hover:border-indigo-300 bg-slate-50 text-xs font-semibold text-slate-800 text-center"
                >
                  Download Standalone HTML
                </a>
                <a
                  href={`/api/demos/${demo.id}/export?format=markdown`}
                  data-testid="export-markdown-link"
                  className="px-3 py-2 rounded-lg border border-slate-200 hover:border-indigo-300 bg-slate-50 text-xs font-semibold text-slate-800 text-center"
                >
                  Export Markdown SOP (.md)
                </a>
                <a
                  href={`/api/demos/${demo.id}/export?format=json`}
                  data-testid="export-json-link"
                  className="px-3 py-2 rounded-lg border border-slate-200 hover:border-indigo-300 bg-slate-50 text-xs font-semibold text-slate-800 text-center"
                >
                  Export JSON Schema (.json)
                </a>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 space-y-2">
              <label className="flex items-center justify-between text-xs font-medium text-slate-700">
                <span className="inline-flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-500" /> Password Protect Demo Link
                </span>
                <input
                  type="checkbox"
                  checked={demo.passwordProtected}
                  onChange={(e) =>
                    updateDemoMeta({
                      passwordProtected: e.target.checked,
                      accessPassword: e.target.checked ? 'supademo2026' : null,
                    })
                  }
                />
              </label>
              {demo.passwordProtected && (
                <input
                  type="text"
                  value={demo.accessPassword || ''}
                  onChange={(e) =>
                    updateDemoMeta({ accessPassword: e.target.value })
                  }
                  placeholder="Viewer password..."
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Version History Modal */}
      {versionsOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                Demo Version History
              </h3>
              <button
                type="button"
                onClick={() => setVersionsOpen(false)}
                className="text-xs text-slate-500"
              >
                Close
              </button>
            </div>
            <button
              type="button"
              onClick={handleSaveVersion}
              className="w-full py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold"
            >
              + Save Current Snapshot Version
            </button>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {demo.versions?.map((v) => (
                <div
                  key={v.id}
                  className="p-3 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-bold text-slate-900">
                      v{v.versionNum} — {v.label}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {new Date(v.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRestoreVersion(v.id)}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 text-indigo-600 font-semibold"
                  >
                    Restore
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Comments Drawer Modal */}
      {commentsOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                Team Review Comments
              </h3>
              <button
                type="button"
                onClick={() => setCommentsOpen(false)}
                className="text-xs text-slate-500"
              >
                Close
              </button>
            </div>
            <div className="space-y-2 max-h-56 overflow-y-auto">
              {demo.comments?.map((c) => (
                <div key={c.id} className="p-3 rounded-xl bg-slate-50 text-xs">
                  <div className="font-bold text-slate-800">
                    {c.author?.name || c.author?.email || 'Reviewer'}
                  </div>
                  <p className="text-slate-600 mt-0.5">{c.body}</p>
                </div>
              ))}
            </div>
            <form onSubmit={handleAddComment} className="flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment on this step..."
                className="flex-1 px-3 py-2 rounded-lg border border-slate-300 text-xs"
              />
              <button
                type="submit"
                className="px-3 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold"
              >
                Post
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
