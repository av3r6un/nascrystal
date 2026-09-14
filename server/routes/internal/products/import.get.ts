type ImportResponse = {
  status?: string;
  body?: {
    products: number;
    variants: number;
    skipped_products: Array<{ id: string; name: string }>;
  };
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
    const response = await $fetch<ImportResponse>(`${baseUrl}/api/moysklad/import`, {
      method: 'GET',
      retry: 0,
      timeout: 120000,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
    });

    if (response && response?.status !== 'success') {
      throw createError({
        statusCode: 502,
        statusMessage: 'Invalid MoySklad import response from backend',
      });
    }

    return response.body;
  }
  catch (error) {
    console.error('FastAPI MoySklad import request failed', error);
    throw createError({
      statusCode: 502,
      statusMessage: 'Failed to import products',
    });
  }
});
