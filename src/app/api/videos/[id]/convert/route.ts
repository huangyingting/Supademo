import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const video = await prisma.videoRecording.findUnique({ where: { id } });
  if (!video) {
    return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
  }

  const demo = await prisma.demo.create({
    data: {
      workspaceId: video.workspaceId,
      folderId: video.folderId,
      title: `${video.title} (Interactive Supademo)`,
      description: `Converted from video recording: ${video.description}`,
      type: 'UPLOAD',
      scope: video.scope,
      status: 'PUBLISHED',
      tagsJson: JSON.stringify(['Video Conversion', 'Onboarding']),
      steps: {
        create: [
          {
            orderIndex: 0,
            stepType: 'CHAPTER',
            title: video.title,
            subtitle: 'Interactive tour automatically extracted from your video recording.',
            mediaUrl: video.thumbnailUrl || '/screenshots/40_demo_editor_main_desktop.png',
            chapterJson: JSON.stringify({
              isChapter: true,
              chapterType: 'DEFAULT',
              title: video.title,
              subtitle: 'Interactive tour automatically extracted from your video recording.',
              buttonText: 'Launch Interactive Version',
              align: 'CENTER',
              theme: 'DARK',
              blurOpacity: 75,
            }),
          },
          {
            orderIndex: 1,
            stepType: 'IMAGE',
            title: 'Step 1: Key Workflow Action',
            subtitle: 'Extracted from video keyframe at 00:24.',
            mediaUrl: video.thumbnailUrl || '/screenshots/40_demo_editor_main_desktop.png',
            hotspotJson: JSON.stringify({
              text: 'Click here to execute the workflow action',
              style: 'POINTER',
              x: 45,
              y: 48,
              bgColor: '#4F46E5',
              textColor: '#FFFFFF',
              backdrop: 'LIGHT',
              borderRadius: 'ROUND',
              animation: 'PING',
              visibility: 'ALWAYS',
              width: 'MD',
              position: 'BOTTOM',
              showNext: true,
              showBack: true,
              actionType: 'NEXT',
              actionTarget: '',
            }),
          },
        ],
      },
    },
  });

  await prisma.videoRecording.update({
    where: { id },
    data: { convertedDemoId: demo.id },
  });

  return NextResponse.json({ demo }, { status: 201 });
}
