import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const body = await request.json();

  const routeHub = await prisma.routeHub.findUnique({ where: { id } });
  if (!routeHub) {
    return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
  }

  await prisma.routeHub.update({
    where: { id },
    data: { submissionsCount: { increment: 1 } },
  });

  const roleVal = String(
    body.team || body.answers?.role || ''
  );
  const sizeVal = String(
    body.size || body.answers?.companySize || ''
  );
  const isEnterprise =
    roleVal.includes('Sales') || sizeVal.includes('500+');
  const destinationUrl = isEnterprise
    ? '/showcase/cmvdq8jjh033xz20jka70wi4b'
    : `/demo/cmvdpmcll02wb090j10dbikms?name=${encodeURIComponent(
        body.name || 'Alex'
      )}&company=${encodeURIComponent(body.company || 'Acme Corp')}`;

  await prisma.leadCapture.create({
    data: {
      workspaceId: routeHub.workspaceId,
      sourceType: 'ROUTE_HUB',
      sourceId: routeHub.id,
      sourceTitle: routeHub.name,
      email: body.email || body.visitorEmail || 'visitor@company.io',
      name: body.name || 'Buyer',
      company: body.company || 'Enterprise Corp',
      role: roleVal || 'Sales & Presales',
      intent: sizeVal || '500+ Enterprise',
      routedTo: isEnterprise
        ? 'Enterprise Product Enablement Kit'
        : 'Supademo Platform Interactive Tour',
    },
  });

  return NextResponse.json({
    ok: true,
    routedLabel: isEnterprise
      ? 'Enterprise Product Enablement Kit (Showcase)'
      : 'Supademo Platform Interactive Tour (Personalized Demo)',
    destinationUrl,
    redirectUrl: destinationUrl,
  });
}
