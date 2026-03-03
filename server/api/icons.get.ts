import { readdirSync } from 'fs';
import { resolve } from 'path';

export default defineEventHandler(() => {
  const dir = resolve('public/icons');
  return readdirSync(dir)
    .filter(f => f.endsWith('.svg'))
    .map(f => f.replace('.svg', ''));
});
