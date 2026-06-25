import { callFastApiAsNitro } from '@@/server/services/auth.service';

export default defineEventHandler(async (event) => {
  const uuid = getQuery(event).purchase;

  if (!uuid) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Purchase UUID is required',
    });
  }

  try {
    const response = await callFastApiAsNitro(event, `/api/purchases/by-uuid/${uuid}`, {
      method: 'GET',
    });

    return response.body;
  }
  catch (error) {
    console.error('FastAPI purchases request failed', error);
    throw createError({
      statusCode: 502,
      statusMessage: 'Failed to load purchases',
    });
  }
});
