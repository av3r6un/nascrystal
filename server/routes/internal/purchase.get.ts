import { callFastApiAsNitro } from '@@/server/services/auth.service';

export default defineEventHandler(async (event) => {
  const uuid = getQuery(event).purchase;
  const id = getQuery(event).id;

  if (!uuid && !id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Purchase UUID/ID is required',
    });
  }

  try {
    const url = uuid ? `/api/purchases/by-uuid/${uuid}` : `/api/purchases/${id}`;

    const response = await callFastApiAsNitro(event, url, {
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
