import { join } from 'node:path';
import { getSafeImagePath, serveImageFile } from '@@/server/services/image-file.service';

export default defineEventHandler(async (event) => {
  const imagePath = getSafeImagePath(event, '/uploads/');
  const uploadsRoot = join(process.cwd(), 'storage', 'uploads');

  return await serveImageFile(event, imagePath, [uploadsRoot]);
});
