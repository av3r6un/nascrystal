import { callFastApiAsNitro, callFastApiAsUser } from '@@/server/services/auth.service';

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

    const request = uuid ? callFastApiAsNitro : callFastApiAsUser;
    const response = await request<{ body: unknown }>(event, url, {
      method: 'GET',
      timeout: 65000,
    });

    return response.body;
  }
  catch (error) {
    throw createError({
      statusCode: (error as { statusCode?: number }).statusCode || 502,
      statusMessage: 'Failed to load purchases',
    });
  }
});
