import { prisma } from '@/lib/prisma';
import { recordAuditLog } from './audit';
import { isInviteOnlyMode, normalizeAccountEmail } from './policy';

export async function authorizeInvitedOAuthSignIn(params: {
  email?: string | null;
  name?: string | null;
}) {
  if (!params.email) return false;
  const normalizedEmail = normalizeAccountEmail(params.email);

  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existingUser) {
    return existingUser.status === 'ACTIVE';
  }

  const now = new Date();
  const pendingInvite = await prisma.invitation.findFirst({
    where: {
      invitedEmail: normalizedEmail,
      status: 'PENDING',
      usedAt: null,
      revokedAt: null,
      expiresAt: { gt: now },
    },
    orderBy: { createdAt: 'desc' },
  });

  if (!pendingInvite) {
    if (isInviteOnlyMode()) {
      await recordAuditLog({
        actorEmail: normalizedEmail,
        action: 'INVITE_REJECTED',
        targetType: 'OAuthSignIn',
        metadata: { reason: 'OAUTH_INVITATION_REQUIRED', email: normalizedEmail },
      });
      return false;
    }
    return true;
  }

  const workspace = await prisma.workspace.findFirst({
    orderBy: { createdAt: 'asc' },
  });

  const user = await prisma.$transaction(async (tx) => {
    const created = await tx.user.create({
      data: {
        email: normalizedEmail,
        name: params.name?.trim() || normalizedEmail.split('@')[0],
        role: pendingInvite.role,
        status: 'ACTIVE',
        onboardingCompleted: true,
      },
    });
    await tx.invitation.update({
      where: { id: pendingInvite.id },
      data: {
        status: 'ACCEPTED',
        usedAt: now,
        acceptedByUserId: created.id,
      },
    });
    if (workspace) {
      await tx.workspaceMember.create({
        data: {
          workspaceId: workspace.id,
          userId: created.id,
          role: pendingInvite.role,
        },
      });
    }
    return created;
  });

  await recordAuditLog({
    workspaceId: workspace?.id ?? null,
    actorUserId: user.id,
    actorEmail: user.email,
    action: 'INVITE_ACCEPTED',
    targetType: 'Invitation',
    targetId: pendingInvite.id,
    metadata: { via: 'oauth', role: user.role },
  });

  return true;
}
