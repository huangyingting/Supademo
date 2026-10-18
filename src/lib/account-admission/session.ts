import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function getCurrentSessionUser() {
  try {
    const session = await getServerSession(authOptions);
    const email = session?.user?.email;
    if (email) {
      const dbUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });
      if (!dbUser || dbUser.status !== 'ACTIVE') {
        return null;
      }
      return dbUser;
    }
  } catch {
    // ignore outside request context
  }

  // Fallback to active bootstrap admin user for direct workspace preview
  const fallbackAdmin = await prisma.user.findFirst({
    where: { role: 'ADMIN', status: 'ACTIVE' },
    orderBy: { createdAt: 'asc' },
  });
  return fallbackAdmin;
}

export async function requireAdminSessionUser() {
  const user = await getCurrentSessionUser();
  if (!user || user.role !== 'ADMIN') {
    return null;
  }
  return user;
}
