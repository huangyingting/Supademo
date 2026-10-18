import { NextResponse } from 'next/server';
import { getCurrentSessionUser } from '@/lib/account-admission';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const user = await getCurrentSessionUser();
  const body = await request.json();

  const steps = await prisma.demoStep.findMany({
    where: { demoId: id },
    orderBy: { orderIndex: 'asc' },
  });

  const latest = await prisma.demoVersion.findFirst({
    where: { demoId: id },
    orderBy: { versionNumber: 'desc' },
  });

  const nextVersionNumber = (latest?.versionNumber || 0) + 1;
  const version = await prisma.demoVersion.create({
    data: {
      demoId: id,
      versionNumber: nextVersionNumber,
      label: body.label || `v${nextVersionNumber}.0 — Published Snapshot`,
      status: 'PUBLISHED',
      stepsSnapshotJson: JSON.stringify(steps),
      authorName: user?.name || 'Joshuah Powlowski',
    },
  });

  return NextResponse.json({ version }, { status: 201 });
}
