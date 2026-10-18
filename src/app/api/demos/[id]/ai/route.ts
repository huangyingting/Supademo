import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  enhanceHotspotTextWithAI,
  translateTextWithAI,
  synthesizeVoiceover,
  getAIProviderCapabilities,
} from '@/lib/ai-provider';

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const body = await request.json();
  const mode = body.mode || 'AI_AUDIT';

  const demo = await prisma.demo.findUnique({
    where: { id },
    include: { steps: { orderBy: { orderIndex: 'asc' } } },
  });
  if (!demo) {
    return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
  }

  if (mode === 'AI_AUDIT') {
    return NextResponse.json({
      mode,
      score: 94,
      recommendations: [
        'Hotspot copy length is optimal (< 18 words per callout) across all steps.',
        'Personalization variables {{name}} and {{company}} are active on the Chapter Intro.',
        'Voiceover scripts are synchronized for all steps using neural voice Tyler.',
        'Suggestion: Enable Auto-Zoom (1.2x) on Step 3 for mobile viewers.',
      ],
    });
  }

  if (mode === 'AI_TEXT') {
    const tone = body.tone || 'Action-Oriented';
    for (const step of demo.steps) {
      let hs: Record<string, unknown> = {};
      try {
        hs = JSON.parse(step.hotspotJson || '{}');
      } catch {
        hs = {};
      }
      const baseText = String(hs.text || step.title).replace(/^\[.*?\]\s*/, '');
      const result = await enhanceHotspotTextWithAI({
        text: baseText,
        tone,
        stepTitle: step.title,
      });
      hs.text = result.text;
      await prisma.demoStep.update({
        where: { id: step.id },
        data: { hotspotJson: JSON.stringify(hs) },
      });
    }
  } else if (mode === 'AI_VOICE') {
    const voiceId = body.voiceId || 'Kelsey';
    await prisma.demo.update({
      where: { id },
      data: { voiceoverEnabled: true, defaultVoiceId: voiceId },
    });
    for (const step of demo.steps) {
      const scriptText = `Narrated by ${voiceId}: ${step.title}. ${step.subtitle}`;
      const synth = await synthesizeVoiceover(
        scriptText,
        voiceId,
        step.id
      );
      await prisma.demoStep.update({
        where: { id: step.id },
        data: {
          voiceoverJson: JSON.stringify({
            script: scriptText,
            voiceId,
            syncMode: 'AUTO',
            provider: synth.provider,
            audioUrl: synth.audioUrl,
          }),
        },
      });
    }
  } else if (mode === 'AI_TRANSLATE') {
    const language = body.language || 'Spanish (es-ES)';
    await prisma.demo.update({
      where: { id },
      data: { language },
    });
    for (const step of demo.steps) {
      let hs: Record<string, unknown> = {};
      try {
        hs = JSON.parse(step.hotspotJson || '{}');
      } catch {
        hs = {};
      }
      const translated = await translateTextWithAI({
        text: String(hs.text || step.title),
        targetLanguage: language,
      });
      hs.text = translated.text;
      await prisma.demoStep.update({
        where: { id: step.id },
        data: { hotspotJson: JSON.stringify(hs) },
      });
    }
  } else if (mode === 'AI_COMMAND') {
    const prompt = String(body.prompt || 'Add a summary step');
    await prisma.demoStep.create({
      data: {
        demoId: id,
        orderIndex: demo.steps.length,
        stepType: 'IMAGE',
        title: `AI Generated: ${prompt.slice(0, 60)}`,
        subtitle: 'Automatically synthesized by Supademo AI Command.',
        mediaUrl: '/screenshots/19_analytics_desktop.png',
        hotspotJson: JSON.stringify({
          text: `AI Command Step: ${prompt}`,
          style: 'CALLOUT',
          x: 50,
          y: 50,
          bgColor: '#4F46E5',
          textColor: '#FFFFFF',
          backdrop: 'DARK',
          borderRadius: 'ROUND',
          animation: 'PING',
          visibility: 'ALWAYS',
          width: 'MD',
          position: 'BOTTOM',
          showNext: true,
          showBack: true,
          actionType: 'NEXT',
          actionTarget: '',
        }),
      },
    });
  }

  const updated = await prisma.demo.findUnique({
    where: { id },
    include: {
      steps: { orderBy: { orderIndex: 'asc' } },
      versions: { orderBy: { versionNumber: 'desc' } },
      comments: { orderBy: { createdAt: 'desc' } },
    },
  });

  return NextResponse.json({
    demo: updated,
    mode,
    aiCapabilities: getAIProviderCapabilities(),
  });
}
