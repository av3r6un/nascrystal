import { mkdir, writeFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { randomUUID } from 'node:crypto';

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'image/x-icon',
  'image/vnd.microsoft.icon',
]);

const EXT_BY_MIME: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/svg+xml': '.svg',
  'image/vnd.microsoft.icon': '.ico',
  'image/x-icon': '.ico',
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
  console.log(filePart.type);

  if (!filePart.type || !ALLOWED_MIME_TYPES.has(filePart.type)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Unsupported image type',
    });
  }

  const sourceExt = extname(filePart.filename ?? '').toLowerCase();
  const safeExt = EXT_BY_MIME[filePart.type] ?? (sourceExt || '.bin');
  const fileName = `${Date.now()}-${randomUUID()}${safeExt}`;

  const uploadDir = join(process.cwd(), 'storage', 'uploads');
  await mkdir(uploadDir, { recursive: true });

  const absolutePath = join(uploadDir, fileName);
  await writeFile(absolutePath, filePart.data);

  return {
    path: `/uploads/${fileName}`,
  };
});
