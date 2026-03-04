import { mkdir, writeFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { randomUUID } from 'node:crypto';

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
]);

const EXT_BY_MIME: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/svg+xml': '.svg',
};

export default defineEventHandler(async (event) => {
  const authHeader = getHeader(event, 'authorization');
  if (!authHeader || !authHeader.toLowerCase().startsWith('bearer ')) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Authorization header is required',
    });
  }

  const form = await readMultipartFormData(event);
  const filePart = form?.find(part => part.name === 'file');

  if (!filePart || !filePart.data || filePart.data.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'File is required',
    });
  }

  if (!filePart.type || !ALLOWED_MIME_TYPES.has(filePart.type)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Unsupported image type',
    });
  }

  const sourceExt = extname(filePart.filename ?? '').toLowerCase();
  const safeExt = EXT_BY_MIME[filePart.type] ?? (sourceExt || '.bin');
  const fileName = `${Date.now()}-${randomUUID()}${safeExt}`;

  const publicBaseDir = process.env.NODE_ENV === 'production'
    ? join(process.cwd(), '.output', 'public')
    : join(process.cwd(), 'public');
  const uploadDir = join(publicBaseDir, 'img');
  await mkdir(uploadDir, { recursive: true });

  const absolutePath = join(uploadDir, fileName);
  await writeFile(absolutePath, filePart.data);

  return {
    path: `/img/${fileName}`,
  };
});
