export default defineEventHandler(async (event) => {
  const authHeader = getHeader(event, 'authorization');
  if (!authHeader || !authHeader.toLowerCase().startsWith('bearer ')) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Authorization header is required',
    });
  }

  const spec = getRouterParam(event, 'spec');
  if (!spec || !['category', 'size', 'color'].includes(spec)) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Catalog endpoint not found',
    });
  }

  const payload = await readBody(event);
  const baseUrl = useRuntimeConfig(event).fastApiBaseUrl.replace(/\/+$/, '');
  const response = await $fetch<Record<string, unknown>>(`${baseUrl}/api/${spec}`, {
    method: 'PUT',
    retry: 0,
    timeout: Number(process.env.NUXT_FASTAPI_TIMEOUT_MS ?? 4000),
    body: payload,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': authHeader,
    },
  });

  if (response?.status && response.status !== 'success') {
    throw createError({
      statusCode: 502,
      statusMessage: `Invalid ${spec} response from backend`,
    });
  }

  return response?.body ?? response ?? {};
});
