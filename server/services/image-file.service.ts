import { access, readFile } from 'node:fs/promises';
import { constants } from 'node:fs';
import { basename, extname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { createError, getRequestURL, setHeader, type H3Event } from 'h3';

const MIME_BY_EXT: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

const SAFE_SEGMENT_RE = /^[a-zA-Z0-9._-]+$/;

export function getSafeImagePath(event: H3Event, routePrefix: string) {
  const pathname = getRequestURL(event).pathname;

  if (!pathname.startsWith(routePrefix)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid image path',
    });
  }

  let imagePath: string;
  try {
    imagePath = decodeURIComponent(pathname.slice(routePrefix.length));
  }
  catch {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid image path',
    });
  }

  const segments = imagePath.split('/').filter(Boolean);
  if (segments.length === 0 || !segments.every(segment => SAFE_SEGMENT_RE.test(segment))) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid image path',
    });
  }

  return segments.join('/');
}

export async function serveImageFile(
  event: H3Event,
  imagePath: string,
  roots: string[],
  fallbackToBasenameRoot?: string,
) {
  const candidates = [
    ...roots.map(root => resolveInsideRoot(root, imagePath)),
    ...(fallbackToBasenameRoot ? [resolveInsideRoot(fallbackToBasenameRoot, basename(imagePath))] : []),
  ];

  for (const filePath of candidates) {
    try {
      await access(filePath, constants.R_OK);
      const contentType = MIME_BY_EXT[extname(filePath).toLowerCase()] ?? 'application/octet-stream';
      setHeader(event, 'Content-Type', contentType);
      setHeader(event, 'Cache-Control', 'public, max-age=31536000, immutable');

      return await readFile(filePath);
    }
    catch {
      // Try the next candidate root.
    }
  }

  throw createError({
    statusCode: 404,
    statusMessage: 'File not found',
  });
}

function resolveInsideRoot(root: string, imagePath: string) {
  const resolvedRoot = resolve(root);
  const resolvedPath = resolve(join(resolvedRoot, imagePath));
  const rootRelativePath = relative(resolvedRoot, resolvedPath);

  if (rootRelativePath === '..' || rootRelativePath.startsWith(`..${sep}`) || isAbsolute(rootRelativePath)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid image path',
    });
  }

  return resolvedPath;
}
