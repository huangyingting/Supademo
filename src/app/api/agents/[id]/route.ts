import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const agent = await prisma.aiAgent.findUnique({ where: { id } });
  if (!agent) {
    return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
  }
  const demos = await prisma.demo.findMany({
    select: { id: true, title: true, type: true, viewsCount: true },
  });
  const videos = await prisma.videoRecording.findMany({
    select: { id: true, title: true, durationSec: true },
  });
  return NextResponse.json({ agent, demos, videos });
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const body = await request.json();

  const data: Record<string, unknown> = {};
  if (body.name !== undefined) data.name = body.name;
  if (body.status !== undefined) data.status = body.status;
  if (body.readinessScore !== undefined) data.readinessScore = body.readinessScore;
  if (body.identity !== undefined) data.identityJson = JSON.stringify(body.identity);
  if (body.interfaceConfig !== undefined)
    data.interfaceJson = JSON.stringify(body.interfaceConfig);
  if (body.guardrails !== undefined)
    data.guardrailsJson = JSON.stringify(body.guardrails);
  if (body.quickLinks !== undefined)
    data.quickLinksJson = JSON.stringify(body.quickLinks);
  if (body.security !== undefined)
    data.securityJson = JSON.stringify(body.security);
  if (body.knowledgeBase !== undefined)
    data.knowledgeBaseJson = JSON.stringify(body.knowledgeBase);
  if (body.monitor !== undefined)
    data.monitorJson = JSON.stringify(body.monitor);

  const updated = await prisma.aiAgent.update({
    where: { id },
    data,
  });

  return NextResponse.json({ agent: updated });
}
