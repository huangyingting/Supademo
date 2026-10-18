import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const scope = searchParams.get('scope') || '';

  const where: Record<string, unknown> = {};
  if (scope && scope !== 'ALL') {
    where.scope = scope;
  } else {
    where.scope = { not: 'ARCHIVED' };
  }

  const videos = await prisma.videoRecording.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { folder: true },
  });

  return NextResponse.json({ videos });
}

export async function POST(request: Request) {
  const body = await request.json();
  const workspace = await prisma.workspace.findFirst({
    orderBy: { createdAt: 'asc' },
  });
  if (!workspace) {
    return NextResponse.json({ error: 'NO_WORKSPACE' }, { status: 400 });
  }

  const video = await prisma.videoRecording.create({
    data: {
      workspaceId: workspace.id,
      title: body.title || 'New Screen Recording',
      description: body.description || 'Captured via Supademo Screen Recorder.',
      durationSec: Number(body.durationSec) || 90,
      scope: body.scope || 'TEAM',
      thumbnailUrl:
        body.thumbnailUrl || '/screenshots/40_demo_editor_main_desktop.png',
    },
  });

  return NextResponse.json({ video }, { status: 201 });
}
