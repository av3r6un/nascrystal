import { access, readFile } from 'node:fs/promises';
import { constants } from 'node:fs';
import { extname, join } from 'node:path';

const MIME_BY_EXT: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
};

export default defineEventHandler(async (event) => {
  const file = getRouterParam(event, 'file');
  if (!file || !/^[a-zA-Z0-9._-]+$/.test(file)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid file name',
    });
  }

  const uploadsRoot = join(process.cwd(), 'storage', 'uploads');
  const filePath = join(uploadsRoot, file);

  try {
    await access(filePath, constants.R_OK);
  }
  catch {
    throw createError({
      statusCode: 404,
      statusMessage: 'File not found',
    });
  }

  const ext = extname(file).toLowerCase();
  const contentType = MIME_BY_EXT[ext] ?? 'application/octet-stream';
  setHeader(event, 'Content-Type', contentType);
  setHeader(event, 'Cache-Control', 'public, max-age=31536000, immutable');

  return await readFile(filePath);
});
