import { callFastApiAsNitro } from '@@/server/services/auth.service';

export default defineEventHandler(async (event) => {
  try {
    const response = await callFastApiAsNitro(event, '/api/purchases/', {
      method: 'GET',
    });

    return Array.isArray(response?.body.items) ? response.body.items : [];
  }
  catch (error) {
    console.error('FastAPI purchases request failed', error);
    throw createError({
      statusCode: 502,
      statusMessage: 'Failed to load purchases',
    });
  }
});
