type ProductsBody = {
  items?: unknown[];
};

type ProductsEnvelope = {
  status?: string;
  body?: ProductsBody;
};

const getProductsBody = (response: ProductsEnvelope | ProductsBody | null | undefined) => {
  if (!response) return null;
  return 'body' in response && response.body ? response.body : response;
};

export default defineEventHandler(async (event) => {
  const authHeader = getHeader(event, 'authorization');
  const page = getQuery(event).page || 1;
  if (!authHeader || !authHeader.toLowerCase().startsWith('bearer ')) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Authorization header is required',
    });
  }

  const baseUrl = useRuntimeConfig(event).fastApiBaseUrl.replace(/\/+$/, '');

  try {
    const response = await $fetch<ProductsEnvelope | ProductsBody>(`${baseUrl}/api/products/`, {
      method: 'GET',
      retry: 0,
      timeout: Number(process.env.NUXT_FASTAPI_TIMEOUT_MS ?? 4000),
      headers: {
        Authorization: authHeader,
      },
      query: {
        page_index: page - 1,
      },
    });

    if ('status' in response && response.status && response.status !== 'success') {
      throw createError({
        statusCode: 502,
        statusMessage: 'Invalid products response from backend',
      });
    }

    const body = getProductsBody(response);

    return {
      items: Array.isArray(body?.items) ? body.items : [],
      page_index: body?.page_index,
      has_next_page: body?.has_next_page || false,
    };
  }
  catch (error) {
    console.error('FastAPI products request failed', error);
    throw createError({
      statusCode: 502,
      statusMessage: 'Failed to load products',
    });
  }
});
