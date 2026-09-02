import { callFastApiAsNitro } from '@@/server/services/auth.service';

type CatalogEnvelope<T> = {
  status?: string;
  body?: T;
};

export default defineEventHandler(async (event) => {
  try {
    const response = await callFastApiAsNitro<CatalogEnvelope<Record<string, unknown>>>(event, '/api/products/attributes', {
      method: 'GET',
    });

    if (response.status !== 'success' || !response.body) {
      throw createError({
        statusCode: 502,
        statusMessage: 'Invalid static response from backend',
      });
    }

    return response.body;
  }
  catch (error) {
    console.error('FastAPI catalog request failed', error);
    throw createError({
      statusCode: 502,
      statusMessage: 'Failed to load catalog',
    });
  }
});
