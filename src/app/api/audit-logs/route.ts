import { NextResponse } from 'next/server';
import {
  getCurrentSessionUser,
  listAuditLogs,
} from '@/lib/account-admission';

export async function GET(request: Request) {
  const user = await getCurrentSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const limit = Math.min(Number(searchParams.get('limit') || 50), 200);
  const logs = await listAuditLogs(limit);

  return NextResponse.json({ auditLogs: logs, logs });
}
