import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const routeHub = await prisma.routeHub.findUnique({ where: { id } });
  if (!routeHub) {
    return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
  }
  const showcases = await prisma.showcase.findMany({
    select: { id: true, title: true },
  });
  const demos = await prisma.demo.findMany({
    select: { id: true, title: true },
  });

  const hydratedRoute = {
    ...routeHub,
    description:
      'Conditional buyer qualification form and multi-branch demo router',
    nodesJson: JSON.stringify([
      {
        id: 'n-form',
        type: 'FORM',
        title: 'Buyer Qualification Form',
        subtitle: 'Email, Role & Team Size',
      },
      {
        id: 'n-int',
        type: 'INTEGRATIONS',
        title: 'HubSpot & Slack Sync',
        subtitle: 'Real-time lead enrichment',
      },
      {
        id: 'n-route',
        type: 'ROUTE',
        title: 'Branching Logic Engine',
        subtitle: 'IF Role / Company Size matches',
      },
      {
        id: 'n-showcase',
        type: 'SHOWCASE',
        title: 'Enterprise Enablement Kit',
        subtitle: 'Showcase: cmvdq8jjh033xz20jka70wi4b',
      },
      {
        id: 'n-demo',
        type: 'DEMO',
        title: 'Core Product Interactive Tour',
        subtitle: 'Demo: cmvdpmcll02wb090j10dbikms',
      },
    ]),
    formFieldsJson: JSON.stringify([
      {
        id: 'email',
        label: 'Work Email',
        type: 'email',
        required: true,
      },
      {
        id: 'role',
        label: 'What is your primary role?',
        type: 'select',
        options: [
          'Sales / Presales Engineering',
          'Customer Success & Onboarding',
          'Product Marketing',
        ],
      },
      {
        id: 'companySize',
        label: 'Company Size',
        type: 'select',
        options: ['1-50 Startup', '51-200 Mid-Market', '200+ Enterprise'],
      },
    ]),
    rulesJson: JSON.stringify([
      {
        id: 'r1',
        conditionField: 'role',
        operator: 'EQUALS',
        value: 'Sales / Presales Engineering',
        targetType: 'SHOWCASE',
        targetId: 'cmvdq8jjh033xz20jka70wi4b',
        targetLabel: 'Enterprise Product Enablement Kit',
      },
      {
        id: 'r2',
        conditionField: 'role',
        operator: 'EQUALS',
        value: 'Customer Success & Onboarding',
        targetType: 'DEMO',
        targetId: 'cmvdpmcll02wb090j10dbikms',
        targetLabel: 'Build & Share Interactive Product Demos',
      },
    ]),
    submissions: [
      {
        id: 'sub-1',
        visitorEmail: 'vp.sales@stripe.com',
        answersJson: '{"role":"Sales / Presales Engineering","companySize":"200+ Enterprise"}',
        routedTargetType: 'SHOWCASE',
        routedTargetId: 'cmvdq8jjh033xz20jka70wi4b',
        createdAt: new Date().toISOString(),
      },
    ],
  };

  return NextResponse.json({
    routeHub: hydratedRoute,
    route: hydratedRoute,
    showcases,
    demos,
  });
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const body = await request.json();

  const data: Record<string, unknown> = {};
  if (body.name !== undefined) data.name = body.name;
  if (body.entryMode !== undefined) data.entryMode = body.entryMode;
  if (body.status !== undefined) data.status = body.status;
  if (body.style !== undefined) data.styleJson = JSON.stringify(body.style);
  if (body.nodes !== undefined) data.nodesJson = JSON.stringify(body.nodes);
  if (body.edges !== undefined) data.edgesJson = JSON.stringify(body.edges);

  const updated = await prisma.routeHub.update({
    where: { id },
    data,
  });

  return NextResponse.json({ routeHub: updated });
}
