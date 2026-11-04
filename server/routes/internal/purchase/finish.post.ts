import { callFastApiAsUser } from '@@/server/services/auth.service';

export default defineEventHandler(async (event) => {
  const id = getQuery(event).id;

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Purchase ID is required',
    });
  }

  try {
    const response = await callFastApiAsUser<{ body: unknown }>(event, `/api/purchases/${id}`, {
      method: 'POST',
    });

    return response.body;
  }
  catch (error) {
    throw createError({
      statusCode: (error as { statusCode?: number }).statusCode || 502,
      statusMessage: 'Failed to finish purchase',
    });
  }
});
