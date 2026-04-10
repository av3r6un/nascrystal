type StaticEnvelope<T> = {
  status?: string;
  body?: T;
};

export default defineEventHandler(async (event) => {
  const baseUrl = useRuntimeConfig(event).fastApiBaseUrl.replace(/\/+$/, '');

  const authHeader = getHeader(event, 'authorization');
  if (!authHeader || !authHeader.toLowerCase().startsWith('bearer ')) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Authorization header is required',
    });
  }

  try {
    const response = await $fetch<StaticEnvelope<Record<string, unknown>>>(`${baseUrl}/api/catalog/`, {
      method: 'GET',
      retry: 0,
      timeout: Number(process.env.NUXT_FASTAPI_TIMEOUT_MS ?? 4000),
      headers: {
        Authorization: authHeader,
      },
    });

    if (response.status !== 'success' || !response.body) {
      throw createError({
        statusCode: 502,
        statusMessage: 'Invalid static response from backend',
      });
    }

    return response.body;
  }
  catch (error) {
    console.error('FastAPI catalog request failed', error);
    throw createError({
      statusCode: 502,
      statusMessage: 'Failed to load catalog',
    });
  }
});
