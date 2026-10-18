import { NextResponse } from 'next/server';
import {
  AccountAdmissionError,
  requireAdminSessionUser,
  revokeInvitation,
} from '@/lib/account-admission';

export async function POST(
  _request: Request,
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
  try {
    const updated = await revokeInvitation(id, admin.id);
    return NextResponse.json({
      id: updated.id,
      status: updated.status,
      revokedAt: updated.revokedAt?.toISOString() ?? null,
    });
  } catch (err) {
    if (err instanceof AccountAdmissionError) {
      return NextResponse.json(
        { error: err.code, message: err.message },
        { status: err.status }
      );
    }
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: 'Failed to revoke invitation.' },
      { status: 500 }
    );
  }
}
