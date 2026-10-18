import { prisma } from '@/lib/prisma';
import { recordAuditLog } from './audit';
import { verifyPassword } from './passwords';
import { normalizeAccountEmail } from './policy';

export async function authorizeUserCredentials(
  email?: string,
  password?: string
) {
  if (!email || !password) return null;
  const normalizedEmail = normalizeAccountEmail(email);

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user || !user.passwordHash) {
    await recordAuditLog({
      actorEmail: normalizedEmail,
      action: 'USER_LOGIN_FAILED',
      targetType: 'User',
      metadata: { reason: 'USER_NOT_FOUND' },
    });
    return null;
  }

  if (user.status !== 'ACTIVE') {
    await recordAuditLog({
      actorUserId: user.id,
      actorEmail: user.email,
      action: 'USER_LOGIN_FAILED',
      targetType: 'User',
      targetId: user.id,
      metadata: { reason: 'USER_DISABLED' },
    });
    return null;
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    await recordAuditLog({
      actorUserId: user.id,
      actorEmail: user.email,
      action: 'USER_LOGIN_FAILED',
      targetType: 'User',
      targetId: user.id,
      metadata: { reason: 'INVALID_PASSWORD' },
    });
    return null;
  }

  await recordAuditLog({
    actorUserId: user.id,
    actorEmail: user.email,
    action: 'USER_LOGIN',
    targetType: 'User',
    targetId: user.id,
    metadata: { role: user.role },
  });

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    status: user.status,
  };
}
