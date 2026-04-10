type PropertyOptionsEnvelope = {
  status?: string;
  body?: {
    items?: unknown[];
  };
};

const getItems = (response: PropertyOptionsEnvelope | { items?: unknown[] } | null | undefined) => {
  if (!response) return [];
  const body = 'body' in response && response.body ? response.body : response;
  return Array.isArray(body?.items) ? body.items : [];
};

export default defineEventHandler(async (event) => {
  const authHeader = getHeader(event, 'authorization');
  if (!authHeader || !authHeader.toLowerCase().startsWith('bearer ')) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Authorization header is required',
    });
  }

  const payload = await readBody<{ items?: Array<{ id?: unknown; name?: unknown }> }>(event);
  if (!Array.isArray(payload?.items) || payload.items.length < 1) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Body must contain a non-empty "items" array',
    });
  }

  const baseUrl = useRuntimeConfig(event).fastApiBaseUrl.replace(/\/+$/, '');

  try {
    const response = await $fetch<PropertyOptionsEnvelope | { items?: unknown[] }>(`${baseUrl}/api/products/property_options/`, {
      method: 'PATCH',
      retry: 0,
      timeout: Number(process.env.NUXT_FASTAPI_TIMEOUT_MS ?? 4000),
      body: {
        items: payload.items.map(item => ({
          id: item.id,
          name: item.name,
        })),
      },
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
    });

    if ('status' in response && response.status && response.status !== 'success') {
      throw createError({
        statusCode: 502,
        statusMessage: 'Invalid property options response from backend',
      });
    }

    return {
      items: getItems(response),
    };
  }
  catch (error) {
    console.error('FastAPI property options patch request failed', error);
    throw createError({
      statusCode: 502,
      statusMessage: 'Failed to update property options',
    });
  }
});
