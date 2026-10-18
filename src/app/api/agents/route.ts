import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const agents = await prisma.aiAgent.findMany({
    orderBy: { updatedAt: 'desc' },
  });
  const workspace = await prisma.workspace.findFirst({
    orderBy: { createdAt: 'asc' },
  });

  return NextResponse.json({
    agents,
    aiCreditsRemaining: workspace?.aiCreditsRemaining ?? 1500,
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  const workspace = await prisma.workspace.findFirst({
    orderBy: { createdAt: 'asc' },
  });
  if (!workspace) {
    return NextResponse.json({ error: 'NO_WORKSPACE' }, { status: 400 });
  }

  const name = (body.name || 'New AI Demo Agent').trim();
  const slug = `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString(36)}`;

  const agent = await prisma.aiAgent.create({
    data: {
      workspaceId: workspace.id,
      name,
      slug,
      status: 'LIVE',
      creditsUsed: 0,
      readinessScore: 88,
      identityJson: JSON.stringify({
        agentName: name,
        roleTitle: 'Interactive Product Discovery Agent',
        voiceId: 'Kelsey',
        language: 'English (US)',
        welcomeMessage: `Hi! I'm ${name}. Tell me your use case and I'll launch the right interactive demo.`,
        personaPrompt: 'Helpful B2B Solutions Engineer.',
      }),
      interfaceJson: JSON.stringify({
        primaryColor: '#4F46E5',
        theme: 'DARK',
        position: 'BOTTOM_RIGHT',
        launcherLabel: 'Ask AI & Watch Demo',
        showAvatar: true,
      }),
      guardrailsJson: JSON.stringify({
        strictKnowledgeBaseOnly: true,
        blockCompetitorComparisons: true,
        requireWorkEmailBeforeDemo: false,
        fallbackEscalationUrl: 'https://supademo.com/enterprise',
        restrictedTopics: [],
      }),
      quickLinksJson: JSON.stringify([
        { id: 'ql1', label: 'Watch Flagship Tour', url: '/demo/cmvdpmcll02wb090j10dbikms' },
      ]),
      securityJson: JSON.stringify({
        allowedDomains: ['localhost', 'supademo.com'],
        rateLimitPerIpHour: 60,
        captureLeadEmail: true,
        gdprConsentBanner: true,
      }),
      knowledgeBaseJson: JSON.stringify({
        demoIds: ['cmvdpmcll02wb090j10dbikms'],
        videoIds: ['vid_onboarding_01'],
        documents: [],
        websites: [{ id: 'w1', url: 'https://supademo.com', pagesCrawled: 8, lastSynced: 'Just now' }],
        textSnippets: [],
      }),
      monitorJson: JSON.stringify({
        totalSessions: 1,
        qualifiedLeads: 1,
        avgDurationSec: 90,
        demoLaunchRate: '100%',
        sessions: [],
        triggers: [],
        knowledgeGaps: [],
      }),
    },
  });

  return NextResponse.json({ agent }, { status: 201 });
}
