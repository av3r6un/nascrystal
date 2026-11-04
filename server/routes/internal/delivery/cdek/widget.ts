import { callFastApiAsNitro } from '@@/server/services/auth.service';

export default defineEventHandler(async (event) => {
  if (!['GET', 'POST'].includes(event.method)) {
    throw createError({ statusCode: 405 });
  }
  try {
    const response = await callFastApiAsNitro<{ body: unknown }>(event, '/api/delivery/cdek/widget', {
      method: event.method as 'GET' | 'POST',
      query: getQuery(event),
      body: event.method === 'POST' ? await readBody(event) : undefined,
      timeout: 25000,
    });
    setHeader(event, 'X-Service-Version', '4.1.0');
    return response.body;
  }
  catch {
    throw createError({ statusCode: 502, statusMessage: 'Не удалось загрузить данные СДЭК' });
  }
});
