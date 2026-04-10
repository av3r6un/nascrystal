import { callFastApiAsNitro } from '@@/server/services/auth.service';

export default defineEventHandler(async (event) => {
  const requestQuery = getQuery(event);
  const normalizedQuery = {
    ...requestQuery,
    page_index: `${requestQuery.page_index ?? 0}`,
  };

  try {
    const response = await callFastApiAsNitro(event, '/api/stock/', {
      method: 'GET',
      query: normalizedQuery,
    });

    const items = Array.isArray(response?.body.items) ? response.body.items : [];
    const pageIndex = response?.body.page_index ?? 0;
    const hasNextPage = response?.body.has_next_page ?? false;
    return {
      stock: items,
      pageIndex,
      hasNextPage,
    };
  }
  catch (error) {
    console.error('FastAPI stock request failed!', error);
    throw createError({
      statusCode: 502,
      statusMessage: 'Failed to load stock',
    });
  }
});
