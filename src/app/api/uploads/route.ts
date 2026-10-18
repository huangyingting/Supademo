import { NextResponse } from 'next/server';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { getCurrentSessionUser, recordAuditLog } from '@/lib/account-admission';

const ALLOWED_EXT: Record<string, string> = {
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'video/mp4': '.mp4',
  'video/webm': '.webm',
};

export async function POST(request: Request) {
  const user = await getCurrentSessionUser();
  if (user && user.role === 'VIEWER') {
    return NextResponse.json(
      { error: 'FORBIDDEN', message: 'Viewers cannot upload media assets.' },
      { status: 403 }
    );
  }

  const contentType = request.headers.get('content-type') || '';
  const uploadsDir = path.join(
    /*turbopackIgnore: true*/ process.cwd(),
    'public',
    'uploads'
  );
  await fs.mkdir(uploadsDir, { recursive: true });

  let buffer: Buffer;
  let mimeType = 'image/png';
  let originalName = 'capture.png';

  if (contentType.includes('multipart/form-data')) {
    const formData = await request.formData();
    const file = formData.get('file');
    if (!file || typeof file === 'string') {
      return NextResponse.json(
        { error: 'MISSING_FILE', message: 'Multipart field "file" is required.' },
        { status: 400 }
      );
    }
    mimeType = file.type || 'image/png';
    originalName = file.name || 'capture.png';
    buffer = Buffer.from(await file.arrayBuffer());
  } else {
    const body = await request.json();
    if (!body.dataUrl || typeof body.dataUrl !== 'string') {
      return NextResponse.json(
        { error: 'INVALID_PAYLOAD', message: 'Provide multipart file or base64 dataUrl.' },
        { status: 400 }
      );
    }
    const match = body.dataUrl.match(/^data:([^;]+);base64,(.+)$/);
    if (!match) {
      return NextResponse.json(
        { error: 'INVALID_DATA_URL', message: 'Malformed base64 dataUrl.' },
        { status: 400 }
      );
    }
    mimeType = match[1];
    originalName = body.filename || 'capture.png';
    buffer = Buffer.from(match[2], 'base64');
  }

  const ext = ALLOWED_EXT[mimeType] || '.png';
  const hash = crypto
    .createHash('sha256')
    .update(buffer)
    .digest('hex')
    .slice(0, 16);
  const fileName = `${Date.now()}-${hash}${ext}`;
  const filePath = path.join(/*turbopackIgnore: true*/ uploadsDir, fileName);

  await fs.writeFile(filePath, buffer);

  const publicUrl = `/uploads/${fileName}`;

  await recordAuditLog({
    actorUserId: user?.id ?? null,
    actorEmail: user?.email ?? null,
    action: 'MEDIA_ASSET_UPLOADED',
    targetType: 'MediaUpload',
    targetId: fileName,
    metadata: {
      originalName,
      mimeType,
      bytes: buffer.byteLength,
      publicUrl,
    },
  });

  return NextResponse.json(
    {
      ok: true,
      url: publicUrl,
      mimeType,
      bytes: buffer.byteLength,
      sha256Prefix: hash,
    },
    { status: 201 }
  );
}
