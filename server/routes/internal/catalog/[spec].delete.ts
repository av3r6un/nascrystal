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

  const identifierKey = spec === 'category' ? 'uid' : 'id';
  const payload = await readBody<Record<string, unknown>>(event).catch(() => null);
  const query = getQuery(event);
  const identifier = `${query[identifierKey] ?? payload?.[identifierKey] ?? ''}`.trim();

  if (!identifier) {
    throw createError({
      statusCode: 400,
      statusMessage: `${identifierKey} is required`,
    });
  }

  const baseUrl = useRuntimeConfig(event).fastApiBaseUrl.replace(/\/+$/, '');
  const response = await $fetch<Record<string, unknown>>(`${baseUrl}/api/${spec}/${encodeURIComponent(identifier)}`, {
    method: 'DELETE',
    retry: 0,
    timeout: Number(process.env.NUXT_FASTAPI_TIMEOUT_MS ?? 4000),
    headers: {
      Authorization: authHeader,
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
