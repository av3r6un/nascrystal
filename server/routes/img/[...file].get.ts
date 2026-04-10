import { join } from 'node:path';
import { getSafeImagePath, serveImageFile } from '@@/server/services/image-file.service';

export default defineEventHandler(async (event) => {
  const imagePath = getSafeImagePath(event, '/img/');
  const publicImgRoot = join(process.cwd(), 'public', 'img');
  const uploadsRoot = join(process.cwd(), 'storage', 'uploads');

  return await serveImageFile(event, imagePath, [publicImgRoot, uploadsRoot], uploadsRoot);
});
