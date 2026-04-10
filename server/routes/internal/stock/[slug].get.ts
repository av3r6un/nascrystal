import { callFastApiAsNitro } from '@@/server/services/auth.service';

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug');

  if (!slug) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Stock slug is required',
    });
  }

  try {
    const response = await callFastApiAsNitro<Record<string, any> | null>(
      event, `/api/stock/${slug}`, { method: 'GET' },
    );

    if (response && 'status' in response && response.status && response.status !== 'success') {
      throw createError({
        statusCode: 502,
        statusMessage: 'Invalid stock response from backend',
      });
    }

    const stockBody = response?.body ?? response;
    if (!stockBody) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Stock item not found',
      });
    }

    return stockBody;
  }
  catch (error) {
    console.error('FastAPI stock item request failed!', error);
    throw createError({
      statusCode: 502,
      statusMessage: 'Failed to load product info',
    });
  }
});
