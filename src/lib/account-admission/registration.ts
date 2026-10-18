import { prisma } from '@/lib/prisma';
import { recordAuditLog } from './audit';
import { AccountAdmissionError } from './errors';
import { hashPassword } from './passwords';
import {
  isInviteOnlyMode,
  isValidAccountEmail,
  normalizeAccountEmail,
  normalizeRole,
} from './policy';
import { hashInvitationToken } from './tokens';

export async function registerUserWithAdmission(input: {
  email: string;
  name?: string | null;
  password: string;
  invitationToken?: string | null;
}) {
  const normalizedEmail = normalizeAccountEmail(input.email || '');
  if (!isValidAccountEmail(normalizedEmail)) {
    throw new AccountAdmissionError(
      400,
      'INVALID_EMAIL',
      'Please enter a valid work email address.'
    );
  }

  const passwordHash = await hashPassword(input.password);
  const displayName =
    input.name?.trim() || normalizedEmail.split('@')[0] || 'Supademo Creator';
  const rawToken = input.invitationToken?.trim() || '';

  const workspace = await prisma.workspace.findFirst({
    orderBy: { createdAt: 'asc' },
  });

  if (isInviteOnlyMode() && !rawToken) {
    await recordAuditLog({
      workspaceId: workspace?.id ?? null,
      actorEmail: normalizedEmail,
      action: 'INVITE_REJECTED',
      targetType: 'Registration',
      metadata: { reason: 'INVITATION_REQUIRED', email: normalizedEmail },
    });
    throw new AccountAdmissionError(
      403,
      'INVITATION_REQUIRED',
      'Public registration is disabled. A valid single-use invitation link is required to create an account.'
    );
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });
  if (existingUser) {
    throw new AccountAdmissionError(
      409,
      'EMAIL_ALREADY_REGISTERED',
      'An account with this email address already exists.'
    );
  }

  // Case 1: Single-use SHA-256 invitation token
  if (rawToken && (!workspace || rawToken !== workspace.inviteShareToken)) {
    const tokenHash = hashInvitationToken(rawToken);
    const now = new Date();

    const invitation = await prisma.invitation.findUnique({
      where: { tokenHash },
    });

    if (!invitation) {
      await recordAuditLog({
        workspaceId: workspace?.id ?? null,
        actorEmail: normalizedEmail,
        action: 'INVITE_REJECTED',
        targetType: 'Invitation',
        metadata: { reason: 'INVALID_INVITATION_TOKEN', email: normalizedEmail },
      });
      throw new AccountAdmissionError(
        403,
        'INVALID_INVITATION_TOKEN',
        "This invite link isn't valid. The link may have been revoked or replaced."
      );
    }

    if (invitation.status === 'REVOKED' || invitation.revokedAt) {
      await recordAuditLog({
        workspaceId: workspace?.id ?? null,
        actorEmail: normalizedEmail,
        action: 'INVITE_REJECTED',
        targetType: 'Invitation',
        targetId: invitation.id,
        metadata: { reason: 'INVITATION_REVOKED', email: normalizedEmail },
      });
      throw new AccountAdmissionError(
        410,
        'INVITATION_REVOKED',
        'This invitation has been revoked by a workspace administrator.'
      );
    }

    if (invitation.status === 'ACCEPTED' || invitation.usedAt) {
      await recordAuditLog({
        workspaceId: workspace?.id ?? null,
        actorEmail: normalizedEmail,
        action: 'INVITE_REJECTED',
        targetType: 'Invitation',
        targetId: invitation.id,
        metadata: { reason: 'INVITATION_ALREADY_USED', email: normalizedEmail },
      });
      throw new AccountAdmissionError(
        410,
        'INVITATION_ALREADY_USED',
        'This single-use invitation code has already been redeemed.'
      );
    }

    if (invitation.expiresAt <= now || invitation.status === 'EXPIRED') {
      await prisma.invitation.update({
        where: { id: invitation.id },
        data: { status: 'EXPIRED' },
      });
      await recordAuditLog({
        workspaceId: workspace?.id ?? null,
        actorEmail: normalizedEmail,
        action: 'INVITE_REJECTED',
        targetType: 'Invitation',
        targetId: invitation.id,
        metadata: { reason: 'INVITATION_EXPIRED', email: normalizedEmail },
      });
      throw new AccountAdmissionError(
        410,
        'INVITATION_EXPIRED',
        'This invitation link has expired. Ask a workspace admin for a new one.'
      );
    }

    if (normalizeAccountEmail(invitation.invitedEmail) !== normalizedEmail) {
      await recordAuditLog({
        workspaceId: workspace?.id ?? null,
        actorEmail: normalizedEmail,
        action: 'INVITE_REJECTED',
        targetType: 'Invitation',
        targetId: invitation.id,
        metadata: {
          reason: 'EMAIL_MISMATCH',
          attemptedEmail: normalizedEmail,
          invitedEmail: invitation.invitedEmail,
        },
      });
      throw new AccountAdmissionError(
        403,
        'EMAIL_MISMATCH',
        `This invitation was issued exclusively for ${invitation.invitedEmail}.`
      );
    }

    const assignedRole = normalizeRole(invitation.role);

    const user = await prisma.$transaction(async (tx) => {
      const consumed = await tx.invitation.updateMany({
        where: {
          id: invitation.id,
          status: 'PENDING',
          usedAt: null,
          revokedAt: null,
          expiresAt: { gt: now },
        },
        data: {
          status: 'ACCEPTED',
          usedAt: now,
        },
      });

      if (consumed.count !== 1) {
        throw new AccountAdmissionError(
          410,
          'INVITATION_ALREADY_USED',
          'This single-use invitation code has already been redeemed.'
        );
      }

      const createdUser = await tx.user.create({
        data: {
          email: normalizedEmail,
          name: displayName,
          passwordHash,
          role: assignedRole,
          status: 'ACTIVE',
          onboardingCompleted: true,
        },
      });

      await tx.invitation.update({
        where: { id: invitation.id },
        data: { acceptedByUserId: createdUser.id },
      });

      if (workspace) {
        await tx.workspaceMember.create({
          data: {
            workspaceId: workspace.id,
            userId: createdUser.id,
            role: assignedRole,
          },
        });
      }

      return createdUser;
    });

    await recordAuditLog({
      workspaceId: workspace?.id ?? null,
      actorUserId: user.id,
      actorEmail: user.email,
      action: 'INVITE_ACCEPTED',
      targetType: 'Invitation',
      targetId: invitation.id,
      metadata: {
        email: user.email,
        role: user.role,
        invitationId: invitation.id,
      },
    });

    return user;
  }

  // Case 2: Public mode or workspace share token
  const user = await prisma.user.create({
    data: {
      email: normalizedEmail,
      name: displayName,
      passwordHash,
      role: 'CREATOR',
      status: 'ACTIVE',
      onboardingCompleted: true,
    },
  });

  if (workspace) {
    await prisma.workspaceMember.create({
      data: {
        workspaceId: workspace.id,
        userId: user.id,
        role: 'CREATOR',
      },
    });
  }

  await recordAuditLog({
    workspaceId: workspace?.id ?? null,
    actorUserId: user.id,
    actorEmail: user.email,
    action: 'INVITE_ACCEPTED',
    targetType: 'User',
    targetId: user.id,
    metadata: { email: user.email, role: user.role, mode: 'workspace_share' },
  });

  return user;
}
