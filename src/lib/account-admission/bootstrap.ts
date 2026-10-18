import { prisma } from '@/lib/prisma';
import { recordAuditLog } from './audit';
import { AccountAdmissionError } from './errors';
import { hashPassword } from './passwords';
import { isValidAccountEmail, normalizeAccountEmail } from './policy';

/**
 * CLI-only bootstrap administrator provisioning (`npm run bootstrap:admin`).
 * Never exposed via any HTTP API route.
 */
export async function createBootstrapAdmin(input: {
  email: string;
  password: string;
  name?: string | null;
}) {
  const userCount = await prisma.user.count();
  if (userCount > 0) {
    throw new AccountAdmissionError(
      409,
      'BOOTSTRAP_ALREADY_COMPLETED',
      'Bootstrap refused: users already exist in the database.'
    );
  }

  const email = normalizeAccountEmail(input.email);
  if (!isValidAccountEmail(email)) {
    throw new AccountAdmissionError(
      400,
      'INVALID_EMAIL',
      'Enter a valid bootstrap administrator email address.'
    );
  }

  const passwordHash = await hashPassword(input.password);
  const displayName =
    input.name?.trim() || email.split('@')[0] || 'Workspace Admin';

  let workspace = await prisma.workspace.findFirst({
    orderBy: { createdAt: 'asc' },
  });
  if (!workspace) {
    workspace = await prisma.workspace.create({
      data: {
        name: 'My Company',
        slug: 'my-company',
        plan: 'GROWTH_TRIAL',
        trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      },
    });
  }

  const user = await prisma.user.create({
    data: {
      email,
      name: displayName,
      passwordHash,
      role: 'ADMIN',
      status: 'ACTIVE',
      onboardingCompleted: true,
    },
  });

  await prisma.workspaceMember.upsert({
    where: {
      workspaceId_userId: {
        workspaceId: workspace.id,
        userId: user.id,
      },
    },
    create: {
      workspaceId: workspace.id,
      userId: user.id,
      role: 'ADMIN',
    },
    update: {
      role: 'ADMIN',
    },
  });

  await recordAuditLog({
    workspaceId: workspace.id,
    actorUserId: user.id,
    actorEmail: user.email,
    action: 'BOOTSTRAP_ADMIN_CREATED',
    targetType: 'User',
    targetId: user.id,
    metadata: { email: user.email, role: 'ADMIN', via: 'cli' },
  });

  return user;
}
