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

  const comment = await prisma.demoComment.create({
    data: {
      demoId: id,
      stepIndex: Number(body.stepIndex) || 0,
      authorName: user?.name || body.authorName || 'Joshuah Powlowski',
      authorEmail: user?.email || body.authorEmail || 'powlowskijoshuah@gmail.com',
      body: body.body || 'Looks great!',
      resolved: false,
    },
  });

  return NextResponse.json({ comment }, { status: 201 });
}
