import { NextResponse } from 'next/server';
import {
  normalizeRole,
  recordAuditLog,
  requireAdminSessionUser,
} from '@/lib/account-admission';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdminSessionUser();
  if (!admin) {
    return NextResponse.json(
      { error: 'FORBIDDEN', message: 'Admin privileges required.' },
      { status: 403 }
    );
  }

  const { id } = await context.params;
  const body = await request.json();

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) {
    return NextResponse.json(
      { error: 'NOT_FOUND', message: 'Member not found.' },
      { status: 404 }
    );
  }

  const nextRole = body.role ? normalizeRole(body.role) : target.role;
  const nextStatus =
    body.status === 'DISABLED' || body.status === 'ACTIVE'
      ? body.status
      : target.status;

  const updated = await prisma.user.update({
    where: { id },
    data: {
      role: nextRole,
      status: nextStatus,
    },
  });

  await prisma.workspaceMember.updateMany({
    where: { userId: id },
    data: { role: nextRole },
  });

  if (body.role && body.role !== target.role) {
    await recordAuditLog({
      actorUserId: admin.id,
      actorEmail: admin.email,
      action: 'MEMBER_ROLE_UPDATED',
      targetType: 'User',
      targetId: updated.id,
      metadata: {
        email: updated.email,
        previousRole: target.role,
        newRole: nextRole,
      },
    });
  }

  if (body.status && body.status !== target.status) {
    await recordAuditLog({
      actorUserId: admin.id,
      actorEmail: admin.email,
      action: 'USER_STATUS_CHANGED',
      targetType: 'User',
      targetId: updated.id,
      metadata: {
        email: updated.email,
        previousStatus: target.status,
        newStatus: nextStatus,
      },
    });
  }

  return NextResponse.json({
    member: {
      id: updated.id,
      email: updated.email,
      name: updated.name,
      role: updated.role,
      status: updated.status,
    },
  });
}
