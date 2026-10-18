import { NextResponse } from 'next/server';
import { verifyInvitationToken } from '@/lib/account-admission';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token') || '';
  const result = await verifyInvitationToken(token);
  const status = result.valid
    ? 200
    : result.reason === 'INVALID'
      ? 404
      : 410;
  return NextResponse.json(result, { status });
}
