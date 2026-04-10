export default defineEventHandler(async (event) => {
  const authHeader = getHeader(event, 'authorization');
  if (!authHeader || !authHeader.toLowerCase().startsWith('bearer ')) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Authorization header is required',
    });
  }

  const payload = await readBody(event);
  const baseUrl = useRuntimeConfig(event).fastApiBaseUrl.replace(/\/+$/, '');

  try {
    const response = await $fetch(`${baseUrl}/api/catalog/options`, {
      method: 'PATCH',
      retry: 0,
      timeout: Number(process.env.NUXT_FASTAPI_TIMEOUT_MS ?? 4000),
      body: payload,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
    });

    if ('status' in response && response.status && response.status !== 'success') {
      throw createError({
        statusCode: 502,
        statusMessage: 'Invalid categories response from backend',
      });
    }
    return { status: 'success' };
  }
  catch (error) {
    console.error('FastAPI categories patch request failed', error);
    throw createError({
      statusCode: 502,
      statusMessage: 'Failed to update categories',
    });
  }
});
