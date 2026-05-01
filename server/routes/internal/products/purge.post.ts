export default defineEventHandler(async (event) => {
  const authHeader = getHeader(event, 'authorization');
  if (!authHeader || !authHeader.toLowerCase().startsWith('bearer ')) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Authorization header is required',
    });
  }

  const baseUrl = useRuntimeConfig(event).fastApiBaseUrl.replace(/\/+$/, '');

  try {
    const response = await $fetch(`${baseUrl}/api/products/purge/`, {
      method: 'POST',
      retry: 0,
      timeout: Number(process.env.NUXT_FASTAPI_TIMEOUT_MS ?? 4000),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
    });

    if (response && response?.status !== 'success') {
      throw createError({
        statusCode: 502,
        statusMessage: 'Invalid products purge response from backend',
      });
    }

    return { status: 'success' };
  }
  catch (error) {
    console.error('FastAPI products purge request failed', error);
    throw createError({
      statusCode: 502,
      statusMessage: 'Failed to purge products',
    });
  }
});
