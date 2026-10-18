import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const showcases = await prisma.showcase.findMany({
    orderBy: { updatedAt: 'desc' },
  });
  return NextResponse.json({ showcases });
}

export async function POST(request: Request) {
  const body = await request.json();
  const workspace = await prisma.workspace.findFirst({
    orderBy: { createdAt: 'asc' },
  });
  if (!workspace) {
    return NextResponse.json({ error: 'NO_WORKSPACE' }, { status: 400 });
  }

  const showcase = await prisma.showcase.create({
    data: {
      workspaceId: workspace.id,
      title: body.title || 'Untitled Showcase',
      description:
        body.description ||
        'Multi-demo collection curated for prospects and customer onboarding.',
      theme: body.theme || 'SIDEBAR',
      status: 'PUBLISHED',
      ctaText: body.ctaText || 'Book a Live Demo',
      ctaUrl: body.ctaUrl || 'https://supademo.com/enterprise',
      sectionsJson: JSON.stringify(
        body.sections || [
          {
            id: 'sec_default',
            title: '1. Featured Interactive Walkthroughs',
            items: [
              {
                id: 'it_1',
                type: 'DEMO',
                refId: 'cmvdpmcll02wb090j10dbikms',
                title: 'Supademo Platform Interactive Tour',
                duration: '5 steps',
              },
            ],
          },
        ]
      ),
    },
  });

  return NextResponse.json({ showcase }, { status: 201 });
}
