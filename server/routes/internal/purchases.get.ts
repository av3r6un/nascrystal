import { callFastApiAsUser } from '@@/server/services/auth.service';

export default defineEventHandler(async (event) => {
  try {
    const response = await callFastApiAsUser<{ body: { items: unknown[] } }>(event, '/api/purchases/', {
      method: 'GET',
    });

    return Array.isArray(response?.body.items) ? response.body.items : [];
  }
  catch (error) {
    throw createError({
      statusCode: (error as { statusCode?: number }).statusCode || 502,
      statusMessage: 'Failed to load purchases',
    });
  }
});
