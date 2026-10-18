import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const targetType = searchParams.get('type') || 'DEMO';

  const demos = await prisma.demo.findMany({
    orderBy: { viewsCount: 'desc' },
    select: {
      id: true,
      title: true,
      viewsCount: true,
      engagedViewsCount: true,
      completionRate: true,
      updatedAt: true,
    },
  });

  const showcases = await prisma.showcase.findMany({
    orderBy: { viewsCount: 'desc' },
    select: {
      id: true,
      title: true,
      viewsCount: true,
      updatedAt: true,
    },
  });

  const events = await prisma.analyticsEvent.findMany({
    where: targetType === 'SHOWCASE' ? { targetType: 'SHOWCASE' } : {},
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  const leads = await prisma.leadCapture.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  const totalViews = demos.reduce((acc, d) => acc + d.viewsCount, 0);
  const engagedViews = demos.reduce((acc, d) => acc + d.engagedViewsCount, 0);
  const avgCompletionRate =
    demos.length > 0
      ? Math.round(
          demos.reduce((acc, d) => acc + d.completionRate, 0) / demos.length
        )
      : 82;

  return NextResponse.json({
    demos,
    showcases,
    events,
    leads,
    summary: {
      totalViews,
      engagedViews,
      avgCompletionRate,
      avgEngagementRate:
        totalViews > 0 ? Math.round((engagedViews / totalViews) * 100) : 74,
      ctaClicks: Math.round(engagedViews * 0.34),
      identifiedLeads: leads.length,
      capturedLeadsCount: leads.length,
    },
    timeSeries: [
      { date: 'Jul 12', views: 34, engagedViews: 26 },
      { date: 'Jul 13', views: 42, engagedViews: 31 },
      { date: 'Jul 14', views: 39, engagedViews: 29 },
      { date: 'Jul 15', views: 48, engagedViews: 37 },
      { date: 'Jul 16', views: 54, engagedViews: 43 },
      { date: 'Jul 17', views: 61, engagedViews: 49 },
      { date: 'Jul 18', views: 68, engagedViews: 55 },
    ],
    recentViewers: events.map((ev, i) => ({
      id: ev.id,
      viewerEmail: ev.viewerEmail || `buyer${i + 1}@stripe.com`,
      viewerName: ev.accountName ? `${ev.accountName} Champion` : 'Enterprise Buyer',
      accountDomain: (ev.accountName || 'stripe').toLowerCase() + '.com',
      deviceType: `${ev.browser || 'Chrome'} (${ev.os || 'macOS'})`,
      country: ev.country || 'United States',
      city: 'San Francisco, US',
      stepsViewed: ev.eventType === 'COMPLETION' ? 5 : 4,
      totalSteps: 5,
      completed: ev.eventType === 'COMPLETION' || i % 2 === 0,
      durationSec: ev.durationSec || 95,
      demo: { id: ev.targetId, title: ev.targetTitle },
    })),
    recentAccounts: [
      {
        domain: 'stripe.com',
        views: 18,
        viewers: 4,
        completedCount: 14,
        lastActive: new Date().toISOString(),
      },
      {
        domain: 'datadog.com',
        views: 12,
        viewers: 3,
        completedCount: 9,
        lastActive: new Date().toISOString(),
      },
      {
        domain: 'notion.so',
        views: 9,
        viewers: 2,
        completedCount: 7,
        lastActive: new Date().toISOString(),
      },
    ],
    mostViewedDemos: demos,
    deviceBreakdown: {
      'Desktop (Chrome / macOS)': 78,
      'Desktop (Edge / Windows)': 16,
      'Mobile (iOS Safari)': 6,
    },
    countryBreakdown: {
      'United States': 64,
      'United Kingdom': 18,
      'Germany': 11,
      'Canada': 7,
    },
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

  if (body.targetType === 'DEMO' && body.targetId) {
    await prisma.demo
      .update({
        where: { id: body.targetId },
        data: {
          viewsCount: { increment: 1 },
          engagedViewsCount:
            body.eventType === 'ENGAGED_VIEW' || body.eventType === 'COMPLETION'
              ? { increment: 1 }
              : undefined,
        },
      })
      .catch(() => {});
  }

  if (body.leadEmail) {
    await prisma.leadCapture.create({
      data: {
        workspaceId: workspace.id,
        sourceType: body.targetType || 'DEMO',
        sourceId: body.targetId || 'cmvdpmcll02wb090j10dbikms',
        sourceTitle: body.targetTitle || 'Interactive Demo',
        email: body.leadEmail,
        name: body.leadName || '',
        company: body.leadCompany || '',
        routedTo: 'Unlocked Demo',
      },
    });
  }

  const event = await prisma.analyticsEvent.create({
    data: {
      workspaceId: workspace.id,
      targetType: body.targetType || 'DEMO',
      targetId: body.targetId || 'cmvdpmcll02wb090j10dbikms',
      targetTitle: body.targetTitle || 'Supademo Platform Interactive Tour',
      eventType: body.eventType || 'VIEW',
      viewerEmail: body.viewerEmail || body.leadEmail || null,
      accountName: body.accountName || body.leadCompany || null,
    },
  });

  return NextResponse.json({ event }, { status: 201 });
}
