export default defineEventHandler(async (event) => {
  const { id } = getQuery(event);
  const authorization = getHeader(event, 'authorization');
  const body = await readBody(event);
  if (!/^\d+$/.test(String(id ?? '')) || !['refresh', 'dispatch'].includes(body?.action)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid delivery action' });
  }
  if (!authorization?.startsWith('Bearer ')) throw createError({ statusCode: 401 });
  const base = useRuntimeConfig(event).fastApiBaseUrl.replace(/\/+$/, '');
  const path = body.action === 'refresh' ? '/delivery/refresh' : '';
  try {
    const options = { headers: { Authorization: authorization }, retry: 0, timeout: 65000 };
    await $fetch(base + '/api/purchases/' + id + path, {
      ...options, method: body.action === 'dispatch' ? 'PUT' : 'POST',
    });
    const response = await $fetch<{ body: unknown }>(base + '/api/purchases/' + id, options);
    return response.body;
  }
  catch (error) {
    const failure = error as { statusCode?: number; data?: { message?: string; data?: { message?: string }; errors?: { message?: string }[] } };
    const message = failure.data?.errors?.[0]?.message || failure.data?.data?.message || failure.data?.message;
    throw createError({ statusCode: failure.statusCode || 502, statusMessage: 'Delivery action failed',
      data: { message: message || 'Не удалось выполнить действие со СДЭК' } });
  }
});
