import type { H3Event } from 'h3';

export async function integrationRequest(event: H3Event, method: 'GET' | 'PUT', body?: unknown, code = 'cdek') {
  const authorization = getHeader(event, 'authorization');
  if (!authorization?.toLowerCase().startsWith('bearer ')) {
    throw createError({ statusCode: 401, statusMessage: 'Authorization required' });
  }
  const baseUrl = useRuntimeConfig(event).fastApiBaseUrl.replace(/\/+$/, '');
  const path = method === 'GET' ? '/api/integrations' : `/api/integrations/${encodeURIComponent(code)}`;
  try {
    const response = await $fetch<{ status: string; body: unknown }>(`${baseUrl}${path}`, {
      method, body, headers: { Authorization: authorization }, retry: 0,
      timeout: method === 'PUT' ? 30000 : Number(process.env.NUXT_FASTAPI_TIMEOUT_MS ?? 4000),
    });
    if (response.status !== 'success' || !response.body) {
      throw createError({ statusCode: 502 });
    }
    return response.body;
  }
  catch (error: unknown) {
    // Fetch errors may include submitted credentials. Never log or forward them.
    const status = (error as { statusCode?: number }).statusCode;
    throw createError({
      statusCode: status && status >= 400 && status < 500 ? status : 502,
      statusMessage: 'Integration request failed',
      data: { message: 'Не удалось проверить или сохранить настройки. Проверьте поля и доступность СДЭК.' },
    });
  }
}
