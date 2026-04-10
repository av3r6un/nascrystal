import { callFastApiAsNitro } from '@@/server/services/auth.service';

export default defineEventHandler(async (event) => {
  try {
    const response = await callFastApiAsNitro(event, '/api/stock/', {
      method: 'OPTIONS',
    });

    return {
      filters: response?.body.filters,
    };
  }
  catch (error) {
    console.error('FastAPI stock filters request failed!', error);
    throw createError({
      statusCode: 502,
      statusMessage: 'Failed to load stock filters',
    });
  }
});
