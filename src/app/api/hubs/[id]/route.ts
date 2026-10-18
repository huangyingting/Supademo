import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const hub = await prisma.demoHub.findUnique({ where: { id } });
  if (!hub) {
    return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
  }
  const demos = await prisma.demo.findMany({
    select: {
      id: true,
      title: true,
      description: true,
      type: true,
      viewsCount: true,
      steps: { select: { id: true, title: true, mediaUrl: true } },
    },
  });

  let appearance: Record<string, any> = {};
  let content: Record<string, any> = {};
  try {
    appearance = JSON.parse(hub.appearanceJson || '{}');
  } catch {}
  try {
    content = JSON.parse(hub.contentJson || '{}');
  } catch {}

  const hydratedHub = {
    ...hub,
    title: appearance.headerTitle || hub.name || 'Interactive Product Guides',
    subtitle:
      appearance.headerSubtitle ||
      'Step-by-step walkthroughs & instant answers inside your app',
    theme: appearance.theme || 'LIGHT',
    accentColor: appearance.primaryColor || '#4F46E5',
    launcherPosition: appearance.position || 'BOTTOM_RIGHT',
    launcherStyle: 'PILL',
    launcherText: appearance.launcherLabel || 'Interactive Guides',
    cardsJson: JSON.stringify(
      content.cards ||
        demos.map((d) => ({
          id: `card-${d.id}`,
          title: d.title,
          category: 'Getting Started',
          demoId: d.id,
        }))
    ),
    installSnippet: `<script src="https://cdn.supademo.com/supademo-hub.min.js" data-hub-id="${hub.id}" async></script>`,
  };

  return NextResponse.json({ hub: hydratedHub, demos });
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
  if (body.appearance !== undefined)
    data.appearanceJson = JSON.stringify(body.appearance);
  if (body.content !== undefined)
    data.contentJson = JSON.stringify(body.content);
  if (body.install !== undefined)
    data.installJson = JSON.stringify(body.install);

  const updated = await prisma.demoHub.update({
    where: { id },
    data,
  });

  return NextResponse.json({ hub: updated });
}
