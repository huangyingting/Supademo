import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const workspace = await prisma.workspace.findFirst({
    orderBy: { createdAt: 'asc' },
    include: {
      folders: true,
      tags: true,
      _count: {
        select: {
          demos: true,
          videos: true,
          agents: true,
          showcases: true,
          hubs: true,
          routes: true,
          members: true,
        },
      },
    },
  });

  return NextResponse.json({ workspace });
}

export async function PATCH(request: Request) {
  const body = await request.json();
  const workspace = await prisma.workspace.findFirst({
    orderBy: { createdAt: 'asc' },
  });
  if (!workspace) {
    return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
  }

  const data: Record<string, unknown> = {};
  if (typeof body.name === 'string' && body.name.trim()) {
    data.name = body.name.trim();
  }
  if (typeof body.plan === 'string') {
    data.plan = body.plan;
  }
  if (body.activateTrial) {
    data.plan = 'GROWTH_TRIAL';
    data.trialEndsAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
  }
  if (body.checklist) {
    data.checklistJson = JSON.stringify(body.checklist);
  }

  const updated = await prisma.workspace.update({
    where: { id: workspace.id },
    data,
  });

  return NextResponse.json({ workspace: updated });
}
