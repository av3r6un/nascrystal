type BaseResponse = {
  status: string;
  body?: unknown;
  message?: string;
};

export default defineEventHandler(async (event) => {
  const authorization = getHeader(event, 'authorization');
  if (!authorization?.toLowerCase().startsWith('bearer ')) {
    throw createError({ statusCode: 401, statusMessage: 'Authorization header is required!' });
  }
  const baseUrl = useRuntimeConfig(event).fastApiBaseUrl.replace(/\/+$/, '');
  const slug = getRouterParam(event, 'slug');
  if (!slug || !/^[a-z0-9_-]+$/.test(slug)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid integration code' });
  }

  try {
    const response = await $fetch<BaseResponse>(`${baseUrl}/api/integrations/${encodeURIComponent(slug)}`, {
      method: 'GET',
      headers: { Authorization: authorization },
      retry: 0,
      timeout: Number(process.env.NUXT_FASTAPI_TIMEOUT_MS ?? 4000),
    });
    if (response.status !== 'success' || !response.body) {
      throw createError({ statusCode: 502 });
    }
    return response.body;
  }
  catch (error: unknown) {
    const status = (error as { statusCode?: number }).statusCode;
    throw createError({
      statusCode: status && status >= 400 && status < 500 ? status : 502,
      statusMessage: 'Integration request failed',
    });
  }
});
