import { prisma } from '@/lib/prisma';
import { recordAuditLog } from './audit';
import { AccountAdmissionError } from './errors';
import {
  isValidAccountEmail,
  normalizeAccountEmail,
  normalizeRole,
  type SupademoRole,
} from './policy';
import { generateInvitationToken, hashInvitationToken } from './tokens';

const DEFAULT_TTL_HOURS = 72;

export async function createInvitation(input: {
  invitedEmail: string;
  role?: SupademoRole | string;
  createdByUserId: string;
  ttlHours?: number;
  baseUrl?: string;
}) {
  const invitedEmail = normalizeAccountEmail(input.invitedEmail);
  if (!isValidAccountEmail(invitedEmail)) {
    throw new AccountAdmissionError(
      400,
      'INVALID_EMAIL',
      'Enter a valid email address to invite.'
    );
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: invitedEmail },
  });
  if (existingUser) {
    throw new AccountAdmissionError(
      409,
      'EMAIL_ALREADY_REGISTERED',
      'An account already exists for this email address.'
    );
  }

  const role = normalizeRole(input.role);
  const ttlHours = Math.min(Math.max(Number(input.ttlHours) || DEFAULT_TTL_HOURS, 1), 720);
  const expiresAt = new Date(Date.now() + ttlHours * 60 * 60 * 1000);
  const { rawToken, tokenHash } = generateInvitationToken();

  const workspace = await prisma.workspace.findFirst({
    orderBy: { createdAt: 'asc' },
  });

  // Revoke any older pending invitations for the same email so only the newest is active
  await prisma.invitation.updateMany({
    where: {
      invitedEmail,
      status: 'PENDING',
    },
    data: {
      status: 'REVOKED',
      revokedAt: new Date(),
    },
  });

  const invitation = await prisma.invitation.create({
    data: {
      tokenHash,
      invitedEmail,
      role,
      status: 'PENDING',
      workspaceId: workspace?.id ?? null,
      expiresAt,
      createdByUserId: input.createdByUserId,
    },
    include: {
      createdBy: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  await recordAuditLog({
    workspaceId: workspace?.id ?? null,
    actorUserId: input.createdByUserId,
    actorEmail: invitation.createdBy?.email ?? null,
    action: 'INVITE_CREATED',
    targetType: 'Invitation',
    targetId: invitation.id,
    metadata: {
      invitedEmail,
      role,
      expiresAt: expiresAt.toISOString(),
    },
  });

  const origin =
    input.baseUrl ||
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXTAUTH_URL ||
    'http://localhost:3100';
  const inviteUrl = `${origin.replace(/\/$/, '')}/invite/${rawToken}`;
  const joinUrl = `${origin.replace(/\/$/, '')}/join/${rawToken}`;

  return {
    invitation,
    rawToken,
    inviteUrl,
    joinUrl,
  };
}

export async function verifyInvitationToken(rawToken: string) {
  if (!rawToken || !rawToken.trim()) {
    return { valid: false as const, reason: 'INVALID' as const };
  }

  const workspace = await prisma.workspace.findFirst({
    orderBy: { createdAt: 'asc' },
  });

  // Support the workspace shareable invite link seen on app.supademo.com/join/[token]
  if (workspace && rawToken.trim() === workspace.inviteShareToken) {
    return {
      valid: true as const,
      isWorkspaceShareLink: true,
      workspaceName: workspace.name,
      invitedEmail: '',
      role: 'CREATOR' as SupademoRole,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    };
  }

  const tokenHash = hashInvitationToken(rawToken);
  const invitation = await prisma.invitation.findUnique({
    where: { tokenHash },
    include: {
      createdBy: { select: { name: true, email: true } },
    },
  });

  if (!invitation) {
    return { valid: false as const, reason: 'INVALID' as const };
  }

  const now = new Date();
  if (invitation.status === 'REVOKED' || invitation.revokedAt) {
    return {
      valid: false as const,
      reason: 'REVOKED' as const,
      invitedEmail: invitation.invitedEmail,
    };
  }
  if (invitation.status === 'ACCEPTED' || invitation.usedAt) {
    return {
      valid: false as const,
      reason: 'ALREADY_USED' as const,
      invitedEmail: invitation.invitedEmail,
    };
  }
  if (invitation.expiresAt <= now || invitation.status === 'EXPIRED') {
    if (invitation.status === 'PENDING') {
      await prisma.invitation.update({
        where: { id: invitation.id },
        data: { status: 'EXPIRED' },
      });
    }
    return {
      valid: false as const,
      reason: 'EXPIRED' as const,
      invitedEmail: invitation.invitedEmail,
    };
  }

  return {
    valid: true as const,
    isWorkspaceShareLink: false,
    invitationId: invitation.id,
    workspaceName: workspace?.name || 'My Company',
    inviterName: invitation.createdBy?.name || 'Workspace Admin',
    invitedEmail: invitation.invitedEmail,
    role: invitation.role as SupademoRole,
    expiresAt: invitation.expiresAt.toISOString(),
  };
}

export async function revokeInvitation(
  invitationId: string,
  actorUserId: string
) {
  const invitation = await prisma.invitation.findUnique({
    where: { id: invitationId },
  });
  if (!invitation) {
    throw new AccountAdmissionError(
      404,
      'INVITATION_NOT_FOUND',
      'Invitation not found.'
    );
  }
  if (invitation.status === 'ACCEPTED') {
    throw new AccountAdmissionError(
      409,
      'INVITATION_ALREADY_USED',
      'Cannot revoke an invitation that has already been accepted.'
    );
  }

  const updated = await prisma.invitation.update({
    where: { id: invitationId },
    data: {
      status: 'REVOKED',
      revokedAt: new Date(),
    },
  });

  await recordAuditLog({
    workspaceId: invitation.workspaceId,
    actorUserId,
    action: 'INVITE_REVOKED',
    targetType: 'Invitation',
    targetId: invitation.id,
    metadata: {
      invitedEmail: invitation.invitedEmail,
      role: invitation.role,
    },
  });

  return updated;
}

export async function listInvitations() {
  const now = new Date();
  await prisma.invitation.updateMany({
    where: {
      status: 'PENDING',
      expiresAt: { lte: now },
    },
    data: {
      status: 'EXPIRED',
    },
  });

  return prisma.invitation.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      createdBy: {
        select: { id: true, name: true, email: true },
      },
      acceptedBy: {
        select: { id: true, name: true, email: true },
      },
    },
  });
}
