type ProductStatsBody = {
  products_count?: number;
  variants_count?: number;
};

type ProductStatsEnvelope = {
  status?: string;
  body?: ProductStatsBody;
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
    const response = await $fetch<ProductStatsEnvelope>(`${baseUrl}/api/products/stats`, {
      method: 'GET',
      retry: 0,
      timeout: Number(process.env.NUXT_FASTAPI_TIMEOUT_MS ?? 4000),
      headers: { Authorization: authHeader },
    });
    if (response.status !== 'success' || !response.body) {
      throw createError({ statusCode: 502, statusMessage: 'Invalid product stats response' });
    }
    return {
      productsCount: response.body.products_count ?? 0,
      variantsCount: response.body.variants_count ?? 0,
    };
  }
  catch (error) {
    console.error('FastAPI product stats request failed', error);
    throw createError({ statusCode: 502, statusMessage: 'Failed to load product stats' });
  }
});
