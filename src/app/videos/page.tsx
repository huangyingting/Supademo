'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { WorkspaceShell } from '@/components/WorkspaceShell';
import { Video, Sparkles, Play, Clock, Plus } from 'lucide-react';

interface VideoItem {
  id: string;
  title: string;
  description: string;
  durationSec: number;
  scope: string;
  thumbnailUrl: string;
  viewsCount: number;
  convertedDemoId?: string | null;
}

export default function VideosPage() {
  const router = useRouter();
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [scope, setScope] = useState('TEAM');
  const [convertingId, setConvertingId] = useState('');
  const [isRecordingScreen, setIsRecordingScreen] = useState(false);
  const [recorderRef, setRecorderRef] = useState<MediaRecorder | null>(null);

  async function loadVideos() {
    const res = await fetch(`/api/videos?scope=${scope}`);
    const data = await res.json();
    setVideos(data.videos || []);
  }

  useEffect(() => {
    loadVideos();
  }, [scope]);

  async function handleConvert(id: string) {
    setConvertingId(id);
    try {
      const res = await fetch(`/api/videos/${id}/convert`, { method: 'POST' });
      const data = await res.json();
      if (data.demo?.id) {
        router.push(`/demo/${data.demo.id}/edit`);
      }
    } finally {
      setConvertingId('');
    }
  }

  async function handleStartScreenCapture() {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getDisplayMedia) {
      await handleAddRecording();
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });
      const chunks: BlobPart[] = [];
      const mr = new MediaRecorder(stream);
      mr.ondataavailable = (ev) => {
        if (ev.data.size > 0) chunks.push(ev.data);
      };
      mr.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        setIsRecordingScreen(false);
        const blob = new Blob(chunks, { type: 'video/webm' });
        const formData = new FormData();
        formData.append('file', blob, `screen-recording-${Date.now()}.webm`);
        const upRes = await fetch('/api/uploads', { method: 'POST', body: formData });
        const upData = upRes.ok ? await upRes.json() : null;
        await fetch('/api/videos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: `Live Screen Capture — ${new Date().toLocaleTimeString()}`,
            description: 'Recorded directly in browser via MediaRecorder + getDisplayMedia.',
            durationSec: 45,
            scope,
            videoUrl: upData?.url,
          }),
        });
        await loadVideos();
      };
      mr.start();
      setRecorderRef(mr);
      setIsRecordingScreen(true);
    } catch {
      await handleAddRecording();
    }
  }

  function handleStopScreenCapture() {
    if (recorderRef && recorderRef.state !== 'inactive') {
      recorderRef.stop();
    }
  }

  async function handleAddRecording() {
    await fetch('/api/videos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: `Screen Recording — ${new Date().toLocaleTimeString()}`,
        description: 'Captured via Supademo Screen & Camera Recorder.',
        durationSec: 75,
        scope,
      }),
    });
    await loadVideos();
  }

  async function handleUploadVideoFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    const upRes = await fetch('/api/uploads', { method: 'POST', body: formData });
    const upData = upRes.ok ? await upRes.json() : null;
    await fetch('/api/videos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: file.name.replace(/\.[^.]+$/, ''),
        description: `Uploaded media asset (${Math.round(file.size / 1024)} KB)`,
        durationSec: 60,
        scope,
        thumbnailUrl: file.type.startsWith('image/') ? upData?.url : undefined,
        videoUrl: upData?.url,
      }),
    });
    await loadVideos();
  }

  return (
    <WorkspaceShell
      title="Videos & Screen Recordings"
      subtitle="Record crisp product videos or convert any video into an interactive step-by-step Supademo"
      actions={
        <div className="flex items-center gap-2">
          <label className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer">
            Upload Video / Image
            <input
              type="file"
              accept="video/*,image/*"
              onChange={handleUploadVideoFile}
              className="hidden"
            />
          </label>
          {isRecordingScreen ? (
            <button
              type="button"
              onClick={handleStopScreenCapture}
              className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold inline-flex items-center gap-1.5"
            >
              Stop Screen Capture
            </button>
          ) : (
            <button
              type="button"
              onClick={handleStartScreenCapture}
              className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Record Screen (Browser)
            </button>
          )}
        </div>
      }
    >
      <div className="space-y-6">
        <div className="p-4 rounded-2xl bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
              Chrome Extension MV3 + Native Browser Recorder
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Load the unpacked Chrome Extension from <code>/extension/manifest.json</code> to auto-capture clicks and DOM snapshots on any website, or record/upload directly in your browser.
            </p>
          </div>
          <button
            type="button"
            onClick={handleAddRecording}
            className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold"
          >
            + Quick Sample Recording
          </button>
        </div>
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl w-fit">
          {[
            { id: 'TEAM', label: 'Shared with Team' },
            { id: 'PERSONAL', label: 'Personal' },
            { id: 'ARCHIVED', label: 'Archived' },
          ].map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setScope(s.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold ${
                scope === s.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {videos.map((v) => (
            <div
              key={v.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="relative h-48 bg-slate-900">
                  <img
                    src={v.thumbnailUrl || '/screenshots/40_demo_editor_main_desktop.png'}
                    alt={v.title}
                    className="w-full h-full object-cover opacity-90"
                  />
                  <span className="absolute bottom-3 right-3 px-2 py-0.5 rounded bg-slate-950/80 text-white text-xs font-mono inline-flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {Math.floor(v.durationSec / 60)}:
                    {String(v.durationSec % 60).padStart(2, '0')}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="text-base font-bold text-slate-900">{v.title}</h3>
                  <p className="text-xs text-slate-500 mt-1">{v.description}</p>
                </div>
              </div>

              <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500">{v.viewsCount} views</span>
                <div className="flex items-center gap-2">
                  {v.convertedDemoId && (
                    <Link
                      href={`/demo/${v.convertedDemoId}`}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 inline-flex items-center gap-1"
                    >
                      <Play className="w-3 h-3" /> View Interactive Demo
                    </Link>
                  )}
                  <button
                    type="button"
                    disabled={convertingId === v.id}
                    onClick={() => handleConvert(v.id)}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold inline-flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>
                      {convertingId === v.id
                        ? 'Converting...'
                        : 'Convert to Interactive Supademo'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </WorkspaceShell>
  );
}
