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
  if ('body' in response) return response.body ?? null;
  return response;
};

export default defineEventHandler(async (event) => {
  const requestQuery = getQuery(event);
  const allowedKeys = [
    'page_index', 'page_size', 'category', 'fixation', 'cuts', 'size', 'color', 'form',
    '0', '1', '2', '3', '4',
  ];
  const normalizedQuery = Object.fromEntries(
    allowedKeys
      .filter(key => requestQuery[key] !== undefined && requestQuery[key] !== '')
      .map(key => [key, requestQuery[key]]),
  );
  normalizedQuery.page_index ??= '0';

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
