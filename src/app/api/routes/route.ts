import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const routes = await prisma.routeHub.findMany({
    orderBy: { updatedAt: 'desc' },
  });
  return NextResponse.json({ routes });
}

export async function POST(request: Request) {
  const body = await request.json();
  const workspace = await prisma.workspace.findFirst({
    orderBy: { createdAt: 'asc' },
  });
  if (!workspace) {
    return NextResponse.json({ error: 'NO_WORKSPACE' }, { status: 400 });
  }

  const routeHub = await prisma.routeHub.create({
    data: {
      workspaceId: workspace.id,
      name: body.name || 'New Route Hub Flow',
      entryMode: body.entryMode || 'BOTH',
      status: 'PUBLISHED',
      styleJson: JSON.stringify({
        theme: 'DARK',
        accentColor: '#4F46E5',
        headline: 'See a tailored Supademo experience for your team',
        subheadline: 'Answer 2 quick questions so we can route you to the best interactive demo.',
      }),
      nodesJson: JSON.stringify([
        {
          id: 'node_form',
          type: 'FORM',
          title: 'Lead & Intent Qualification Form',
          fields: [
            { id: 'f_email', label: 'Work Email', type: 'email', required: true },
            { id: 'f_company', label: 'Company Name', type: 'text', required: true },
            {
              id: 'f_team',
              label: 'Primary Use Case',
              type: 'select',
              options: ['Sales & Presales', 'Product & Onboarding', 'Marketing & Website'],
            },
          ],
        },
        {
          id: 'node_integrations',
          type: 'INTEGRATIONS',
          title: 'CRM & Slack Sync',
          providers: ['HubSpot', 'Salesforce', 'Slack'],
        },
        {
          id: 'node_route_1',
          type: 'ROUTE',
          title: 'Route A: Enterprise Showcase',
          condition: 'Primary Use Case = Sales & Presales',
          destinationType: 'SHOWCASE',
          destinationId: 'cmvdq8jjh033xz20jka70wi4b',
          destinationLabel: 'Enterprise Product Enablement Kit',
        },
        {
          id: 'node_route_2',
          type: 'ROUTE',
          title: 'Route B: Flagship Interactive Tour',
          condition: 'Default Fallback',
          destinationType: 'DEMO',
          destinationId: 'cmvdpmcll02wb090j10dbikms',
          destinationLabel: 'Supademo Platform Interactive Tour',
        },
      ]),
      edgesJson: JSON.stringify([
        { from: 'node_form', to: 'node_integrations' },
        { from: 'node_integrations', to: 'node_route_1' },
        { from: 'node_integrations', to: 'node_route_2' },
      ]),
    },
  });

  return NextResponse.json({ routeHub }, { status: 201 });
}
