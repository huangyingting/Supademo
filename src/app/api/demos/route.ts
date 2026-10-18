import { NextResponse } from 'next/server';
import { getCurrentSessionUser, recordAuditLog } from '@/lib/account-admission';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const scope = searchParams.get('scope') || '';
  const search = (searchParams.get('search') || '').trim().toLowerCase();
  const tag = searchParams.get('tag') || '';
  const folderId = searchParams.get('folderId') || '';
  const type = searchParams.get('type') || '';

  const where: Record<string, unknown> = {};
  if (scope && scope !== 'ALL') {
    where.scope = scope;
  } else {
    where.scope = { not: 'ARCHIVED' };
  }
  if (folderId) {
    where.folderId = folderId;
  }
  if (type && type !== 'ALL') {
    where.type = type;
  }

  const demos = await prisma.demo.findMany({
    where,
    orderBy: { updatedAt: 'desc' },
    include: {
      creator: { select: { id: true, name: true, email: true } },
      folder: { select: { id: true, name: true, color: true } },
      steps: {
        orderBy: { orderIndex: 'asc' },
        select: {
          id: true,
          orderIndex: true,
          stepType: true,
          title: true,
          mediaUrl: true,
        },
      },
    },
  });

  const filtered = demos.filter((d) => {
    if (
      search &&
      !d.title.toLowerCase().includes(search) &&
      !d.description.toLowerCase().includes(search)
    ) {
      return false;
    }
    if (tag) {
      try {
        const tags: string[] = JSON.parse(d.tagsJson || '[]');
        if (!tags.includes(tag)) return false;
      } catch {
        return false;
      }
    }
    return true;
  });

  const folders = await prisma.folder.findMany({ orderBy: { createdAt: 'asc' } });
  const tags = await prisma.tag.findMany({ orderBy: { name: 'asc' } });

  return NextResponse.json({ demos: filtered, folders, tags });
}

export async function POST(request: Request) {
  const user = await getCurrentSessionUser();
  if (user && user.role === 'VIEWER') {
    return NextResponse.json(
      { error: 'FORBIDDEN', message: 'Viewers cannot create demos.' },
      { status: 403 }
    );
  }

  const body = await request.json();
  const workspace = await prisma.workspace.findFirst({
    orderBy: { createdAt: 'asc' },
  });
  if (!workspace) {
    return NextResponse.json({ error: 'NO_WORKSPACE' }, { status: 400 });
  }

  const title = (body.title || 'Untitled Supademo').trim();
  const type = body.type || 'UPLOAD';
  const scope = body.scope || 'TEAM';

  const demo = await prisma.demo.create({
    data: {
      workspaceId: workspace.id,
      creatorId: user?.id ?? null,
      folderId: body.folderId || null,
      title,
      description:
        body.description ||
        'Interactive step-by-step product walkthrough created in Supademo.',
      type,
      scope,
      status: 'PUBLISHED',
      tagsJson: JSON.stringify(body.tags || ['Getting Started']),
      variablesJson: JSON.stringify([
        { key: 'name', label: 'Prospect Name', fallback: 'Alex' },
        { key: 'company', label: 'Company Name', fallback: 'Acme Corp' },
      ]),
      steps: {
        create: [
          {
            orderIndex: 0,
            stepType: 'CHAPTER',
            title: `Welcome to ${title}, {{name}}`,
            subtitle: 'Explore this interactive walkthrough tailored for {{company}}.',
            mediaUrl: '/screenshots/06_home_dashboard_desktop.png',
            chapterJson: JSON.stringify({
              isChapter: true,
              chapterType: 'DEFAULT',
              title: `Welcome to ${title}, {{name}}`,
              subtitle: 'Explore this interactive walkthrough tailored for {{company}}.',
              buttonText: 'Start Interactive Demo',
              align: 'CENTER',
              theme: 'DARK',
              blurOpacity: 75,
            }),
            hotspotJson: JSON.stringify({
              text: 'Start Interactive Demo',
              style: 'CALLOUT',
              x: 50,
              y: 66,
              bgColor: '#4F46E5',
              textColor: '#FFFFFF',
              backdrop: 'DARK',
              borderRadius: 'ROUND',
              animation: 'PING',
              visibility: 'ALWAYS',
              width: 'MD',
              position: 'BOTTOM',
              showNext: true,
              showBack: false,
              actionType: 'NEXT',
              actionTarget: '',
            }),
            voiceoverJson: JSON.stringify({
              script: `Welcome to ${title}. Click Start to begin the guided product tour.`,
              voiceId: 'Tyler',
              syncMode: 'AUTO',
            }),
          },
          {
            orderIndex: 1,
            stepType: type === 'HTML' || type === 'SANDBOX' ? 'HTML' : 'IMAGE',
            title: 'Step 1: Configure Interactive Hotspots & Branching',
            subtitle: 'Click on the highlighted element to progress to the next step.',
            mediaUrl: '/screenshots/40_demo_editor_main_desktop.png',
            htmlContent:
              type === 'HTML' || type === 'SANDBOX'
                ? '<div style="padding:24px;background:#0F172A;color:#F8FAFC;border-radius:12px;"><h3>Live Interactive HTML Sandbox</h3><p>Click any element inside this live captured DOM state.</p></div>'
                : '',
            hotspotJson: JSON.stringify({
              text: 'Click here to customize Hotspot style, backdrop & AI voiceover',
              style: 'POINTER',
              x: 34,
              y: 42,
              bgColor: '#4F46E5',
              textColor: '#FFFFFF',
              backdrop: 'LIGHT',
              borderRadius: 'ROUND',
              animation: 'PING',
              visibility: 'ALWAYS',
              width: 'MD',
              position: 'RIGHT',
              showNext: true,
              showBack: true,
              actionType: 'NEXT',
              actionTarget: '',
            }),
            voiceoverJson: JSON.stringify({
              script: 'Click the highlighted hotspot to customize callout colors, animations, and voiceovers.',
              voiceId: 'Tyler',
              syncMode: 'AUTO',
            }),
          },
        ],
      },
      versions: {
        create: [
          {
            versionNumber: 1,
            label: 'v1.0 — Initial Creation',
            status: 'PUBLISHED',
            authorName: user?.name || 'Workspace Admin',
          },
        ],
      },
    },
    include: {
      steps: { orderBy: { orderIndex: 'asc' } },
    },
  });

  await recordAuditLog({
    workspaceId: workspace.id,
    actorUserId: user?.id ?? null,
    actorEmail: user?.email ?? null,
    action: 'DEMO_CREATED',
    targetType: 'Demo',
    targetId: demo.id,
    metadata: { title: demo.title, type: demo.type },
  });

  return NextResponse.json({ demo }, { status: 201 });
}
