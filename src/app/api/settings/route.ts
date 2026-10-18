import { NextResponse } from 'next/server';
import {
  getCurrentSessionUser,
  recordAuditLog,
} from '@/lib/account-admission';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const workspace = await prisma.workspace.findFirst({
    orderBy: { createdAt: 'asc' },
    include: { tags: { orderBy: { name: 'asc' } } },
  });
  const user = await getCurrentSessionUser();

  if (!workspace) {
    return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
  }

  return NextResponse.json({
    workspace,
    currentUser: user
      ? {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          jobTitle: user.jobTitle,
        }
      : null,
  });
}

export async function PATCH(request: Request) {
  const user = await getCurrentSessionUser();
  if (user && user.role === 'VIEWER') {
    return NextResponse.json(
      { error: 'FORBIDDEN', message: 'Viewers cannot modify workspace settings.' },
      { status: 403 }
    );
  }

  const body = await request.json();
  const workspace = await prisma.workspace.findFirst({
    orderBy: { createdAt: 'asc' },
  });
  if (!workspace) {
    return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
  }

  const data: Record<string, unknown> = {};
  if (body.brandSettings !== undefined)
    data.brandSettingsJson = JSON.stringify(body.brandSettings);
  if (body.playerSettings !== undefined)
    data.playerSettingsJson = JSON.stringify(body.playerSettings);
  if (body.customDomain !== undefined)
    data.customDomainJson = JSON.stringify(body.customDomain);
  if (body.generalSettings !== undefined) {
    data.generalSettingsJson = JSON.stringify(body.generalSettings);
    if (body.generalSettings.workspaceName) {
      data.name = body.generalSettings.workspaceName;
    }
  }
  if (body.securitySettings !== undefined)
    data.securitySettingsJson = JSON.stringify(body.securitySettings);
  if (body.versioningSettings !== undefined)
    data.versioningSettingsJson = JSON.stringify(body.versioningSettings);
  if (body.integrations !== undefined)
    data.integrationsJson = JSON.stringify(body.integrations);
  if (body.pronunciations !== undefined)
    data.pronunciationsJson = JSON.stringify(body.pronunciations);
  if (body.apiKeys !== undefined)
    data.apiKeysJson = JSON.stringify(body.apiKeys);
  if (body.plan !== undefined) data.plan = body.plan;

  if (body.newTag && body.newTag.name) {
    await prisma.tag.create({
      data: {
        workspaceId: workspace.id,
        name: body.newTag.name.trim(),
        color: body.newTag.color || '#4F46E5',
      },
    });
  }

  if (body.deleteTagId) {
    await prisma.tag.delete({ where: { id: body.deleteTagId } }).catch(() => {});
  }

  if (body.profile && user) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        name: body.profile.name ?? user.name,
        jobTitle: body.profile.jobTitle ?? user.jobTitle,
      },
    });
  }

  const updated = await prisma.workspace.update({
    where: { id: workspace.id },
    data,
    include: { tags: { orderBy: { name: 'asc' } } },
  });

  await recordAuditLog({
    workspaceId: workspace.id,
    actorUserId: user?.id ?? null,
    actorEmail: user?.email ?? null,
    action: 'SETTINGS_UPDATED',
    targetType: 'Workspace',
    targetId: workspace.id,
    metadata: { section: body.section || 'general' },
  });

  return NextResponse.json({ workspace: updated });
}
