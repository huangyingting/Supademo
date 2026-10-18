import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string; stepId: string }> }
) {
  const { stepId } = await context.params;
  const body = await request.json();

  const data: Record<string, unknown> = {};
  for (const field of [
    'title',
    'subtitle',
    'stepType',
    'mediaUrl',
    'htmlContent',
    'orderIndex',
  ]) {
    if (body[field] !== undefined) {
      data[field] = body[field];
    }
  }
  const currentStep = await prisma.demoStep.findUnique({
    where: { id: stepId },
  });
  if (!currentStep) {
    return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
  }

  let hs: Record<string, any> = {};
  let ann: Record<string, any> = {};
  let vo: Record<string, any> = {};
  let anim: Record<string, any> = {};
  let ch: Record<string, any> = {};
  try { hs = JSON.parse(currentStep.hotspotJson || '{}'); } catch {}
  try { ann = JSON.parse(currentStep.annotationsJson || '{}'); } catch {}
  try { vo = JSON.parse(currentStep.voiceoverJson || '{}'); } catch {}
  try { anim = JSON.parse(currentStep.animationJson || '{}'); } catch {}
  try { ch = JSON.parse(currentStep.chapterJson || '{}'); } catch {}

  if (body.hotspot !== undefined) {
    hs = { ...hs, ...body.hotspot };
  }
  if (body.hotspotX !== undefined) hs.x = Number(body.hotspotX);
  if (body.hotspotY !== undefined) hs.y = Number(body.hotspotY);
  if (body.hotspotText !== undefined) hs.text = String(body.hotspotText);
  if (body.hotspotStyle !== undefined) hs.style = String(body.hotspotStyle);
  data.hotspotJson = JSON.stringify(hs);

  if (body.annotations !== undefined) {
    ann = { ...ann, ...body.annotations };
  }
  if (body.blurRegionsJson !== undefined) {
    try {
      ann.blurRegions = typeof body.blurRegionsJson === 'string' ? JSON.parse(body.blurRegionsJson) : body.blurRegionsJson;
    } catch {}
  }
  data.annotationsJson = JSON.stringify(ann);

  if (body.voiceover !== undefined) {
    vo = { ...vo, ...body.voiceover };
  }
  if (body.voiceoverScript !== undefined) {
    vo.script = String(body.voiceoverScript);
  }
  data.voiceoverJson = JSON.stringify(vo);

  if (body.animation !== undefined) {
    anim = { ...anim, ...body.animation };
  }
  if (body.zoomLevel !== undefined) {
    anim.zoomLevel = Number(body.zoomLevel);
  }
  data.animationJson = JSON.stringify(anim);

  if (body.chapter !== undefined) {
    ch = { ...ch, ...body.chapter };
  }
  if (body.chapterConfigJson !== undefined) {
    try {
      ch = typeof body.chapterConfigJson === 'string' ? JSON.parse(body.chapterConfigJson) : body.chapterConfigJson;
    } catch {}
  }
  data.chapterJson = JSON.stringify(ch);

  const updated = await prisma.demoStep.update({
    where: { id: stepId },
    data,
  });

  return NextResponse.json({
    step: {
      ...updated,
      hotspotX: hs.x ?? 50,
      hotspotY: hs.y ?? 50,
      hotspotText: hs.text ?? updated.subtitle ?? updated.title,
      hotspotStyle: hs.style ?? 'BEACON',
      blurRegionsJson: JSON.stringify(ann.blurRegions ?? []),
      zoomLevel: anim.zoomLevel ?? 1,
      voiceoverScript: vo.script ?? updated.subtitle ?? updated.title,
      chapterConfigJson: JSON.stringify(ch),
    },
  });
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string; stepId: string }> }
) {
  const { id, stepId } = await context.params;
  await prisma.demoStep.delete({ where: { id: stepId } });

  const remaining = await prisma.demoStep.findMany({
    where: { demoId: id },
    orderBy: { orderIndex: 'asc' },
  });
  for (let i = 0; i < remaining.length; i++) {
    await prisma.demoStep.update({
      where: { id: remaining[i].id },
      data: { orderIndex: i },
    });
  }

  return NextResponse.json({ ok: true });
}
