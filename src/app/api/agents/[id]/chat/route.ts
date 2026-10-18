import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const body = await request.json();
  const message = String(body.message || '').trim();

  const agent = await prisma.aiAgent.findUnique({ where: { id } });
  if (!agent) {
    return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
  }

  await prisma.aiAgent.update({
    where: { id },
    data: { creditsUsed: { increment: 5 } },
  });

  return NextResponse.json({
    reply: `Based on your question (*"${message}"*), I recommend launching our **Supademo Platform Interactive Tour** (\`/demo/cmvdpmcll02wb090j10dbikms\`). It walks through interactive hotspots, AI voiceovers, dynamic personalization variables, and enterprise SOC 2 security controls step by step.`,
    recommendedDemoId: 'cmvdpmcll02wb090j10dbikms',
    recommendedDemoTitle: 'Supademo Platform Interactive Tour',
  });
}
