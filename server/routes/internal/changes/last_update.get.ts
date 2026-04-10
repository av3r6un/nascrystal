type LastUpdateEnvelope = {
  status?: string;
  body?: unknown;
  last_update?: unknown;
};

type LastUpdateApiResponse = LastUpdateEnvelope | string | number | null;

const getLastUpdateValue = (response: LastUpdateEnvelope | unknown) => {
  if (!response || typeof response !== 'object') return null;

  const source = response as LastUpdateEnvelope;
  const body = source.body;

  if (typeof source.last_update === 'string' || typeof source.last_update === 'number') {
    return source.last_update;
  }

  if (typeof body === 'string' || typeof body === 'number') {
    return body;
  }

  if (!body || typeof body !== 'object') return null;

  const candidate = (body as Record<string, unknown>).last_update;
  return typeof candidate === 'string' || typeof candidate === 'number'
    ? candidate
    : null;
};

const parseLastUpdateTs = (value: unknown) => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value > 1e12 ? Math.floor(value / 1000) : Math.floor(value);
  }

  if (typeof value === 'string') {
    const normalized = value.trim();
    if (!normalized) return null;

    const numericValue = Number(normalized);
    if (Number.isFinite(numericValue)) {
      return numericValue > 1e12 ? Math.floor(numericValue / 1000) : Math.floor(numericValue);
    }

    const parsed = Date.parse(normalized);
    if (!Number.isNaN(parsed)) {
      return Math.floor(parsed / 1000);
    }
  }

  return null;
};

export default defineEventHandler(async (event) => {
  const authHeader = getHeader(event, 'authorization');
  if (!authHeader || !authHeader.toLowerCase().startsWith('bearer ')) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Authorization header is required',
    });
  }

  const baseUrl = useRuntimeConfig(event).fastApiBaseUrl.replace(/\/+$/, '');

  try {
    const response = await $fetch<LastUpdateApiResponse>(`${baseUrl}/api/changes/last_update`, {
      method: 'GET',
      retry: 0,
      timeout: Number(process.env.NUXT_FASTAPI_TIMEOUT_MS ?? 4000),
      headers: {
        Authorization: authHeader,
      },
    });

    if (response && typeof response === 'object' && 'status' in response && response.status && response.status !== 'success') {
      throw createError({
        statusCode: 502,
        statusMessage: 'Invalid last update response from backend',
      });
    }

    return {
      last_update_ts: parseLastUpdateTs(getLastUpdateValue(response)),
    };
  }
  catch (error) {
    console.error('FastAPI last update request failed', error);
    throw createError({
      statusCode: 502,
      statusMessage: 'Failed to load last update',
    });
  }
});
