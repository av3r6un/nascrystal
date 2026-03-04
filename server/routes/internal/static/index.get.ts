type StaticEnvelope<T> = {
  status?: string;
  body?: T;
};

export default defineEventHandler(async (event) => {
  const locale = `${getQuery(event).locale ?? 'ru'}`.toLowerCase();

  if (!/^[a-z]{2}$/.test(locale)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid locale',
    });
  }

  const authHeader = getHeader(event, 'authorization');
  if (!authHeader || !authHeader.toLowerCase().startsWith('bearer ')) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Authorization header is required',
    });
  }

  const baseUrl = useRuntimeConfig(event).fastApiBaseUrl.replace(/\/+$/, '');
  const response = await $fetch<StaticEnvelope<Record<string, unknown>>>(`${baseUrl}/api/static/`, {
    method: 'GET',
    retry: 0,
    timeout: Number(process.env.NUXT_FASTAPI_TIMEOUT_MS ?? 4000),
    query: { locale },
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
});
