import { prisma } from '@/lib/prisma';

export type AuditAction =
  | 'BOOTSTRAP_ADMIN_CREATED'
  | 'INVITE_CREATED'
  | 'INVITE_ACCEPTED'
  | 'INVITE_REVOKED'
  | 'INVITE_REJECTED'
  | 'USER_LOGIN'
  | 'USER_LOGIN_FAILED'
  | 'MEMBER_ROLE_UPDATED'
  | 'USER_STATUS_CHANGED'
  | 'SETTINGS_UPDATED'
  | 'DEMO_CREATED'
  | 'DEMO_PUBLISHED'
  | 'AI_COMMAND_EXECUTED';

export async function recordAuditLog(params: {
  workspaceId?: string | null;
  actorUserId?: string | null;
  actorEmail?: string | null;
  action: AuditAction | string;
  targetType?: string | null;
  targetId?: string | null;
  metadata?: Record<string, unknown>;
  ipAddress?: string | null;
}) {
  try {
    return await prisma.auditLog.create({
      data: {
        workspaceId: params.workspaceId ?? null,
        actorUserId: params.actorUserId ?? null,
        actorEmail: params.actorEmail ?? null,
        action: params.action,
        targetType: params.targetType ?? null,
        targetId: params.targetId ?? null,
        metadataJson: JSON.stringify(params.metadata ?? {}),
        ipAddress: params.ipAddress ?? '127.0.0.1',
      },
    });
  } catch {
    return null;
  }
}

export async function listAuditLogs(limit = 50) {
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: {
      actor: {
        select: { id: true, name: true, email: true, role: true },
      },
    },
  });
  return logs.map((l) => ({
    ...l,
    metadata: (() => {
      try {
        return JSON.parse(l.metadataJson || '{}');
      } catch {
        return {};
      }
    })(),
  }));
}
