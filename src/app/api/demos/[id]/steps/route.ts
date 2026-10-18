import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const body = await request.json();

  const count = await prisma.demoStep.count({ where: { demoId: id } });
  const stepType = body.stepType || 'IMAGE';

  const step = await prisma.demoStep.create({
    data: {
      demoId: id,
      orderIndex: count,
      stepType,
      title:
        body.title ||
        (stepType === 'CHAPTER'
          ? 'New Chapter Cover'
          : `Step ${count + 1}: Click to continue`),
      subtitle:
        body.subtitle ||
        (stepType === 'CHAPTER'
          ? 'Introduce this section of your interactive product tour.'
          : 'Follow the highlighted hotspot callout.'),
      mediaUrl:
        body.mediaUrl || '/screenshots/40_demo_editor_main_desktop.png',
      htmlContent: body.htmlContent || '',
      hotspotJson: JSON.stringify(
        body.hotspot || {
          text:
            stepType === 'CHAPTER'
              ? 'Continue Tour'
              : `Step ${count + 1}: Click here to proceed`,
          style: stepType === 'CHAPTER' ? 'CALLOUT' : 'POINTER',
          x: 50,
          y: 52,
          bgColor: '#4F46E5',
          textColor: '#FFFFFF',
          backdrop: 'LIGHT',
          borderRadius: 'ROUND',
          animation: 'PING',
          visibility: 'ALWAYS',
          width: 'MD',
          position: 'BOTTOM',
          showNext: true,
          showBack: count > 0,
          actionType: 'NEXT',
          actionTarget: '',
        }
      ),
      chapterJson: JSON.stringify(
        body.chapter || {
          isChapter: stepType === 'CHAPTER',
          chapterType: 'DEFAULT',
          title: body.title || 'New Chapter Section',
          subtitle: 'Guided walkthrough chapter',
          buttonText: 'Continue',
          align: 'CENTER',
          theme: 'DARK',
          blurOpacity: 75,
        }
      ),
      voiceoverJson: JSON.stringify({
        script:
          body.voiceoverScript ||
          `In this step, click the highlighted area to continue the walkthrough.`,
        voiceId: 'Tyler',
        syncMode: 'AUTO',
      }),
      animationJson: JSON.stringify({
        zoomLevel: 1.0,
        panX: 50,
        panY: 50,
        autoplayDuration: 5,
      }),
    },
  });

  return NextResponse.json({ step }, { status: 201 });
}
