import { callFastApiAsNitro } from '@@/server/services/auth.service';

export default defineEventHandler(async (event) => {
  const uuid = getQuery(event).purchase;

  if (typeof uuid !== 'string' || uuid.trim().length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Purchase UUID is required',
    });
  }

  try {
    const response = await callFastApiAsNitro(event, `/api/purchases/by-uuid/${uuid}/payment`, {
      method: 'POST',
    });

    return response.body;
  }
  catch (error) {
    console.error('FastAPI purchase payment request failed', error);
    throw createError({
      statusCode: 502,
      statusMessage: 'Failed to create purchase payment',
    });
  }
});
