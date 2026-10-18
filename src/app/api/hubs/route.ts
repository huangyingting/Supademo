import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const hubs = await prisma.demoHub.findMany({
    orderBy: { updatedAt: 'desc' },
  });
  return NextResponse.json({ hubs });
}

export async function POST(request: Request) {
  const body = await request.json();
  const workspace = await prisma.workspace.findFirst({
    orderBy: { createdAt: 'asc' },
  });
  if (!workspace) {
    return NextResponse.json({ error: 'NO_WORKSPACE' }, { status: 400 });
  }

  const hub = await prisma.demoHub.create({
    data: {
      workspaceId: workspace.id,
      name: body.name || 'New In-App Demo Hub',
      status: 'PUBLISHED',
      appearanceJson: JSON.stringify({
        headerTitle: 'How can we help you today?',
        headerSubtitle: 'Browse interactive guides and product tours.',
        searchPlaceholder: 'Search interactive guides...',
        alignment: 'LEFT',
        headerBgType: 'GRADIENT',
        headerBgValue: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
        contentTheme: 'LIGHT',
        launcherText: 'Interactive Guides',
        launcherPosition: 'BOTTOM_RIGHT',
        footerLinks: [
          { label: 'Documentation', url: 'https://supademo.com/features' },
          { label: 'Contact Support', url: 'https://supademo.com/enterprise' },
        ],
      }),
      contentJson: JSON.stringify({
        categories: [
          {
            id: 'cat_1',
            title: 'Getting Started',
            demoIds: ['cmvdpmcll02wb090j10dbikms'],
          },
        ],
      }),
      installJson: JSON.stringify({
        triggerMode: 'FLOATING_BADGE',
        cssSelector: '#supademo-hub-trigger',
        allowedDomains: ['localhost:3100'],
      }),
    },
  });

  return NextResponse.json({ hub }, { status: 201 });
}
