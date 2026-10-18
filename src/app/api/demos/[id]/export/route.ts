import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const { searchParams } = new URL(request.url);
  const format = (searchParams.get('format') || 'sop').toLowerCase();

  const demo = await prisma.demo.findUnique({
    where: { id },
    include: {
      steps: { orderBy: { orderIndex: 'asc' } },
    },
  });

  if (!demo) {
    return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
  }

  const parsedSteps = demo.steps.map((s, idx) => {
    let hotspot: Record<string, any> = {};
    try {
      hotspot = JSON.parse(s.hotspotJson || '{}');
    } catch {}
    return {
      stepNumber: idx + 1,
      stepType: s.stepType,
      title: s.title,
      subtitle: s.subtitle || '',
      calloutText: hotspot.text || s.subtitle || s.title,
      hotspotX: hotspot.x ?? 50,
      hotspotY: hotspot.y ?? 50,
      mediaUrl: s.mediaUrl || '/screenshots/40_demo_editor_main_desktop.png',
    };
  });

  if (format === 'json') {
    return new NextResponse(
      JSON.stringify(
        {
          exportedAt: new Date().toISOString(),
          version: '1.0',
          demo: {
            id: demo.id,
            title: demo.title,
            description: demo.description,
            type: demo.type,
            language: demo.language,
            steps: parsedSteps,
          },
        },
        null,
        2
      ),
      {
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Content-Disposition': `attachment; filename="supademo-${demo.id}.json"`,
        },
      }
    );
  }

  if (format === 'markdown') {
    const mdLines = [
      `# ${demo.title}`,
      ``,
      `> ${demo.description}`,
      ``,
      ...parsedSteps.flatMap((st) => [
        `## Step ${st.stepNumber}: ${st.title} (${st.stepType})`,
        `- **Action Callout**: ${st.calloutText}`,
        `- **Hotspot Coordinates**: (${st.hotspotX}%, ${st.hotspotY}%)`,
        `- **Screenshot**: ![Step ${st.stepNumber}](${st.mediaUrl})`,
        ``,
      ]),
    ];
    return new NextResponse(mdLines.join('\n'), {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Content-Disposition': `attachment; filename="supademo-${demo.id}.md"`,
      },
    });
  }

  // Printable Step-by-Step SOP / PDF Guide or Standalone Interactive HTML
  const htmlDoc = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${demo.title} — Supademo SOP & Interactive Export</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; margin: 0; padding: 32px; background: #f8fafc; color: #0f172a; }
    .container { max-width: 920px; margin: 0 auto; }
    .header { background: #0f172a; color: #fff; padding: 28px; border-radius: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; }
    .step-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px; margin-bottom: 20px; page-break-inside: avoid; }
    .badge { display: inline-block; background: #4f46e5; color: #fff; font-weight: 700; font-size: 12px; padding: 4px 10px; border-radius: 999px; margin-bottom: 8px; }
    .stage { position: relative; border-radius: 12px; overflow: hidden; border: 1px solid #cbd5e1; margin-top: 12px; background: #0f172a; }
    .stage img { width: 100%; display: block; }
    .beacon { position: absolute; width: 28px; height: 28px; border-radius: 50%; background: #4f46e5; color: #fff; font-weight: bold; font-size: 12px; display: flex; align-items: center; justify-content: center; border: 3px solid #fff; box-shadow: 0 4px 14px rgba(0,0,0,0.4); transform: translate(-50%, -50%); }
    .print-btn { background: #4f46e5; color: #fff; border: none; padding: 10px 18px; border-radius: 10px; font-weight: 600; cursor: pointer; }
    @media print { .print-btn { display: none; } body { background: #fff; padding: 0; } }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div>
        <div style="font-size:12px;color:#818cf8;font-weight:700;text-transform:uppercase;">Supademo Step-by-Step SOP Guide</div>
        <h1 style="margin:6px 0 4px;font-size:24px;">${demo.title}</h1>
        <p style="margin:0;font-size:13px;color:#cbd5e1;">${demo.description}</p>
      </div>
      <button class="print-btn" onclick="window.print()">Print / Save as PDF</button>
    </div>
    ${parsedSteps
      .map(
        (st) => `
    <div class="step-card" data-step="${st.stepNumber}">
      <span class="badge">Step ${st.stepNumber} of ${parsedSteps.length} • ${st.stepType}</span>
      <h2 style="margin:4px 0 6px;font-size:18px;">${st.title}</h2>
      <p style="margin:0;font-size:14px;color:#334155;"><strong>Callout:</strong> ${st.calloutText}</p>
      <div class="stage">
        <img src="${st.mediaUrl}" alt="${st.title}" />
        <div class="beacon" style="left:${st.hotspotX}%;top:${st.hotspotY}%;">${st.stepNumber}</div>
      </div>
    </div>`
      )
      .join('\n')}
  </div>
</body>
</html>`;

  return new NextResponse(htmlDoc, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      ...(format === 'html'
        ? {
            'Content-Disposition': `attachment; filename="supademo-${demo.id}.html"`,
          }
        : {}),
    },
  });
}
