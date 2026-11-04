import { callFastApiAsNitro } from '@@/server/services/auth.service';

export default defineEventHandler(async (event) => {
  const name = String(getQuery(event).name ?? '').trim();
  if (name.length < 3 || name.length > 100) {
    throw createError({ statusCode: 400, statusMessage: 'Enter 3–100 characters' });
  }
  const response = await callFastApiAsNitro<{ body: { items: unknown[] } }>(
    event, '/api/delivery/cdek/cities', { query: { name }, timeout: 25000 },
  );
  return response.body;
});
