export default defineEventHandler(async (event) => {
  const authHeader = getHeader(event, 'authorization');
  if (!authHeader?.toLowerCase().startsWith('bearer ')) {
    throw createError({ statusCode: 401, statusMessage: 'Authorization header is required' });
  }

  const id = getRouterParam(event, 'id');
  if (!id || !/^\d+$/.test(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid category ID' });
  }

  const baseUrl = useRuntimeConfig(event).fastApiBaseUrl.replace(/\/+$/, '');
  try {
    await $fetch(`${baseUrl}/api/category/${id}`, {
      method: 'DELETE',
      retry: 0,
      timeout: Number(process.env.NUXT_FASTAPI_TIMEOUT_MS ?? 4000),
      headers: { Authorization: authHeader },
    });
  }
  catch (error) {
    const status = (error as { statusCode?: number }).statusCode;
    throw createError({
      statusCode: status && status >= 400 && status < 500 ? status : 502,
      statusMessage: 'Failed to delete category',
    });
  }

  return sendNoContent(event);
});
