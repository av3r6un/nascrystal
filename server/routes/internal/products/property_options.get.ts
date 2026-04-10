type PropertyOptionsBody = {
  items?: unknown[];
};

type PropertyOptionsEnvelope = {
  status?: string;
  body?: PropertyOptionsBody | unknown[];
};

const getPropertyOptionsItems = (response: PropertyOptionsEnvelope | PropertyOptionsBody | unknown[] | null | undefined) => {
  if (!response) return [];

  const body = Array.isArray(response)
    ? response
    : ('body' in response && response.body ? response.body : response);

  if (Array.isArray(body)) {
    return body;
  }

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

  const baseUrl = useRuntimeConfig(event).fastApiBaseUrl.replace(/\/+$/, '');

  try {
    const response = await $fetch<PropertyOptionsEnvelope | PropertyOptionsBody | unknown[]>(
      `${baseUrl}/api/products/property_options/`,
      {
        method: 'GET',
        retry: 0,
        timeout: Number(process.env.NUXT_FASTAPI_TIMEOUT_MS ?? 4000),
        headers: {
          Authorization: authHeader,
        },
      },
    );

    if (!Array.isArray(response) && 'status' in response && response.status && response.status !== 'success') {
      throw createError({
        statusCode: 502,
        statusMessage: 'Invalid property options response from backend',
      });
    }

    return {
      items: getPropertyOptionsItems(response),
    };
  }
  catch (error) {
    console.error('FastAPI product property options request failed', error);
    throw createError({
      statusCode: 502,
      statusMessage: 'Failed to load product property options',
    });
  }
});
