import { callFastApiAsNitro } from '@@/server/services/auth.service';

type StockBody = {
  items?: unknown[];
  page_index?: number;
  page_size?: number;
  has_next_page?: boolean;
};

type StockEnvelope = {
  status?: string;
  body?: StockBody;
};

const getStockBody = (response: StockEnvelope | StockBody | null | undefined) => {
  if (!response) return null;
  return 'body' in response && response.body ? response.body : response;
};

export default defineEventHandler(async (event) => {
  const requestQuery = getQuery(event);
  const normalizedQuery = {
    ...requestQuery,
    page_index: `${requestQuery.page_index ?? 0}`,
  };

  try {
    const response = await callFastApiAsNitro<StockEnvelope | StockBody>(event, '/api/stock/', {
      method: 'GET',
      query: normalizedQuery,
    });

    const body = getStockBody(response);
    return {
      stock: Array.isArray(body?.items) ? body.items : [],
      pageIndex: body?.page_index ?? 0,
      pageSize: body?.page_size ?? 20,
      hasNextPage: body?.has_next_page ?? false,
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
