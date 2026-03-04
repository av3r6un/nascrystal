type StaticEnvelope<T> = {
  status?: string;
  body?: T;
};

export default defineEventHandler(async (event) => {
  const authHeader = getHeader(event, 'authorization');
  if (!authHeader || !authHeader.toLowerCase().startsWith('bearer ')) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Authorization header is required',
    });
  }

  const payload = await readBody<Record<string, unknown>>(event);
  const baseUrl = useRuntimeConfig(event).fastApiBaseUrl.replace(/\/+$/, '');

  const response = await $fetch<StaticEnvelope<Record<string, unknown>>>(`${baseUrl}/api/static/`, {
    method: 'POST',
    retry: 0,
    timeout: Number(process.env.NUXT_FASTAPI_TIMEOUT_MS ?? 4000),
    body: payload,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': authHeader,
    },
  });

  if (response.status !== 'success') {
    throw createError({
      statusCode: 502,
      statusMessage: 'Invalid static response from backend',
    });
  }

  return response.body ?? {};
});
