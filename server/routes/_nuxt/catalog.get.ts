import { callFastApiAsNitro } from '../services/auth.service';

export default defineEventHandler(async (event) => {
  try {
    return await callFastApiAsNitro(event, '/api/catalog/', {
      method: 'GET',
    });
  }
  catch (error) {
    console.error('FastAPI catalog request failed', error);
    throw createError({
      statusCode: 502,
      statusMessage: 'Failed to load catalog',
    });
  }
});
