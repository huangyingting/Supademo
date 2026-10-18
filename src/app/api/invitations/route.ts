import { NextResponse } from 'next/server';
import {
  AccountAdmissionError,
  createInvitation,
  listInvitations,
  requireAdminSessionUser,
} from '@/lib/account-admission';

export async function GET() {
  const admin = await requireAdminSessionUser();
  if (!admin) {
    return NextResponse.json(
      { error: 'FORBIDDEN', message: 'Admin privileges required.' },
      { status: 403 }
    );
  }

  const invitations = await listInvitations();
  return NextResponse.json({ invitations });
}

export async function POST(request: Request) {
  const admin = await requireAdminSessionUser();
  if (!admin) {
    return NextResponse.json(
      { error: 'FORBIDDEN', message: 'Admin privileges required to issue invitations.' },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const origin = new URL(request.url).origin;
    const result = await createInvitation({
      invitedEmail: body.invitedEmail || body.email || '',
      role: body.role || 'CREATOR',
      ttlHours: body.ttlHours,
      createdByUserId: admin.id,
      baseUrl: origin,
    });

    return NextResponse.json(
      {
        invitation: {
          id: result.invitation.id,
          invitedEmail: result.invitation.invitedEmail,
          role: result.invitation.role,
          status: result.invitation.status,
          expiresAt: result.invitation.expiresAt.toISOString(),
          createdAt: result.invitation.createdAt.toISOString(),
        },
        inviteUrl: result.inviteUrl,
        joinUrl: result.joinUrl,
        rawToken: result.rawToken,
      },
      { status: 201 }
    );
  } catch (err) {
    if (err instanceof AccountAdmissionError) {
      return NextResponse.json(
        { error: err.code, message: err.message },
        { status: err.status }
      );
    }
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: 'Failed to create invitation.' },
      { status: 500 }
    );
  }
}
