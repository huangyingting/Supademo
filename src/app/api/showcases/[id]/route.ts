import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const showcase = await prisma.showcase.findUnique({ where: { id } });
  if (!showcase) {
    return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
  }
  const demos = await prisma.demo.findMany({
    include: { steps: { orderBy: { orderIndex: 'asc' } } },
  });
  const videos = await prisma.videoRecording.findMany();
  return NextResponse.json({ showcase, demos, videos });
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const body = await request.json();

  const data: Record<string, unknown> = {};
  for (const field of [
    'title',
    'description',
    'theme',
    'status',
    'ctaText',
    'ctaUrl',
  ]) {
    if (body[field] !== undefined) data[field] = body[field];
  }
  if (body.sections !== undefined) {
    data.sectionsJson = JSON.stringify(body.sections);
  }

  const updated = await prisma.showcase.update({
    where: { id },
    data,
  });

  return NextResponse.json({ showcase: updated });
}
