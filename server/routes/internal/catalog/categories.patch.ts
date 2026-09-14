export default defineEventHandler(async (event) => {
  const authHeader = getHeader(event, 'authorization');
  if (!authHeader?.toLowerCase().startsWith('bearer ')) {
    throw createError({ statusCode: 401, statusMessage: 'Authorization header is required' });
  }
  const payload = await readBody(event);
  const baseUrl = useRuntimeConfig(event).fastApiBaseUrl.replace(/\/+$/, '');
  const response = await $fetch<{ status: string; body?: { items: Array<{ id: number; name: string; sort_order: number }> } }>(
    `${baseUrl}/api/categories/`,
    {
      method: 'PATCH',
      retry: 0,
      timeout: Number(process.env.NUXT_FASTAPI_TIMEOUT_MS ?? 4000),
      body: payload,
      headers: { Authorization: authHeader },
    },
  );
  if (response.status !== 'success' || !response.body) {
    throw createError({ statusCode: 502, statusMessage: 'Failed to update categories' });
  }
  return response.body;
});
