import { NextResponse } from 'next/server';
import { getCurrentSessionUser } from '@/lib/account-admission';
import { prisma } from '@/lib/prisma';

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const demo = await prisma.demo.findUnique({
    where: { id },
    include: {
      creator: { select: { id: true, name: true, email: true } },
      folder: true,
      steps: { orderBy: { orderIndex: 'asc' } },
      versions: { orderBy: { versionNumber: 'desc' } },
      comments: { orderBy: { createdAt: 'desc' } },
    },
  });

  if (!demo) {
    return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
  }

  const hydratedSteps = demo.steps.map((s) => {
    let hotspot: Record<string, any> = {};
    let voiceover: Record<string, any> = {};
    let animation: Record<string, any> = {};
    try {
      hotspot = JSON.parse(s.hotspotJson || '{}');
    } catch {}
    try {
      voiceover = JSON.parse(s.voiceoverJson || '{}');
    } catch {}
    try {
      animation = JSON.parse(s.animationJson || '{}');
    } catch {}

    return {
      ...s,
      hotspotX: hotspot.x ?? 50,
      hotspotY: hotspot.y ?? 50,
      hotspotText:
        hotspot.text ||
        s.subtitle ||
        'Click here for {{company}} walkthrough step.',
      hotspotPosition: (hotspot.position || 'bottom').toLowerCase(),
      hotspotStyle: hotspot.style || 'POINTER',
      hotspotColor: hotspot.bgColor || '#4F46E5',
      hotspotTrigger: hotspot.trigger || 'CLICK',
      showNextButton: hotspot.showNext ?? true,
      showPrevButton: hotspot.showBack ?? true,
      spotlightEnabled: hotspot.backdrop === 'DARK',
      blurRegionsJson: s.annotationsJson || '[]',
      zoomLevel: animation.zoomScale ?? 1.0,
      transitionType: animation.type || 'SMOOTH_PAN',
      voiceoverScript: voiceover.script || s.subtitle || '',
      voiceoverVoice: voiceover.voiceName || 'Nova (US Female - Warm)',
      chapterConfigJson: s.chapterJson || '{}',
    };
  });

  const hydratedVersions = demo.versions.map((v) => ({
    ...v,
    versionNum: v.versionNumber,
  }));

  return NextResponse.json({
    demo: {
      ...demo,
      passwordProtected: Boolean(demo.password),
      accessPassword: demo.password,
      emailCollection: false,
      allowExport: true,
      dynamicVariablesJson:
        demo.variablesJson ||
        JSON.stringify({ name: 'Elena', company: 'Datadog', role: 'VP Product' }),
      steps: hydratedSteps,
      versions: hydratedVersions,
    },
  });
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentSessionUser();
  if (user && user.role === 'VIEWER') {
    return NextResponse.json(
      { error: 'FORBIDDEN', message: 'Viewers cannot edit demos.' },
      { status: 403 }
    );
  }

  const { id } = await context.params;
  const body = await request.json();

  if (body.action === 'DUPLICATE') {
    const source = await prisma.demo.findUnique({
      where: { id },
      include: { steps: { orderBy: { orderIndex: 'asc' } } },
    });
    if (!source) {
      return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
    }
    const copy = await prisma.demo.create({
      data: {
        workspaceId: source.workspaceId,
        folderId: source.folderId,
        creatorId: user?.id ?? source.creatorId,
        title: `${source.title} (Copy)`,
        description: source.description,
        type: source.type,
        scope: source.scope,
        visibility: source.visibility,
        backgroundStyle: source.backgroundStyle,
        hideBrowserBar: source.hideBrowserBar,
        darkMode: source.darkMode,
        autoplay: source.autoplay,
        voiceoverEnabled: source.voiceoverEnabled,
        defaultVoiceId: source.defaultVoiceId,
        variablesJson: source.variablesJson,
        tagsJson: source.tagsJson,
        steps: {
          create: source.steps.map((s) => ({
            orderIndex: s.orderIndex,
            stepType: s.stepType,
            title: s.title,
            subtitle: s.subtitle,
            mediaUrl: s.mediaUrl,
            htmlContent: s.htmlContent,
            hotspotJson: s.hotspotJson,
            annotationsJson: s.annotationsJson,
            voiceoverJson: s.voiceoverJson,
            animationJson: s.animationJson,
            chapterJson: s.chapterJson,
          })),
        },
      },
      include: { steps: { orderBy: { orderIndex: 'asc' } } },
    });
    return NextResponse.json({ demo: copy });
  }

  const data: Record<string, unknown> = {};
  for (const field of [
    'title',
    'description',
    'scope',
    'visibility',
    'password',
    'status',
    'backgroundStyle',
    'aspectRatio',
    'hideBrowserBar',
    'darkMode',
    'autoplay',
    'autoplayDelaySec',
    'voiceoverEnabled',
    'defaultVoiceId',
    'language',
    'folderId',
  ]) {
    if (body[field] !== undefined) {
      data[field] = body[field];
    }
  }
  if (body.variables !== undefined) {
    data.variablesJson = JSON.stringify(body.variables);
  }
  if (body.tags !== undefined) {
    data.tagsJson = JSON.stringify(body.tags);
  }

  const updated = await prisma.demo.update({
    where: { id },
    data,
    include: {
      steps: { orderBy: { orderIndex: 'asc' } },
      versions: { orderBy: { versionNumber: 'desc' } },
      comments: { orderBy: { createdAt: 'desc' } },
    },
  });

  return NextResponse.json({ demo: updated });
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentSessionUser();
  if (user && user.role === 'VIEWER') {
    return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
  }
  const { id } = await context.params;
  await prisma.demo.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
