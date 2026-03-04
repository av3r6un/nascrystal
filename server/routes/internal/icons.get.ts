import { readdirSync } from 'fs';
import { resolve } from 'path';

export default defineEventHandler(() => {
  const dir = process.env.NODE_ENV === 'production'
    ? resolve('.output/public/icons')
    : resolve('public/icons');
  return readdirSync(dir)
    .filter(f => f.endsWith('.svg'))
    .map(f => f.replace('.svg', ''));
});
