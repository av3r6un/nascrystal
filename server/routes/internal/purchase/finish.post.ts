import { callFastApiAsNitro } from '@@/server/services/auth.service';

export default defineEventHandler(async (event) => {
  const id = getQuery(event).id;

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Purchase ID is required',
    });
  }

  try {
    const response = await callFastApiAsNitro(event, `/api/purchases/${id}`, {
      method: 'POST',
    });

    return response.body;
  }
  catch (error) {
    console.error('FastAPI purchase finish request failed', error);
    throw createError({
      statusCode: 502,
      statusMessage: 'Failed to finish purchase',
    });
  }
});
