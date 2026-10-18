import { NextResponse } from 'next/server';
import { getCurrentSessionUser } from '@/lib/account-admission';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const currentUser = await getCurrentSessionUser();
  if (!currentUser) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      status: true,
      jobTitle: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ members: users });
}
