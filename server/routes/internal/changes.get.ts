type ChangeEventItem = {
  id: number;
  action: string;
  event_type: string;
  payload: Record<string, unknown>;
  actor_uid: string | null;
  created: string;
  created_ts: number;
};

type ChangeEventsResponse = {
  items: ChangeEventItem[];
};

export default defineEventHandler(async (event) => {
  const limit = Number(getQuery(event).limit ?? 20);

  if (!Number.isFinite(limit) || limit < 1) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid limit',
    });
  }

  const authHeader = getHeader(event, 'authorization');
  if (!authHeader || !authHeader.toLowerCase().startsWith('bearer ')) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Authorization header is required',
    });
  }

  const baseUrl = useRuntimeConfig(event).fastApiBaseUrl.replace(/\/+$/, '');

  try {
    const response = await $fetch<ChangeEventsResponse>(`${baseUrl}/api/changes/`, {
      method: 'GET',
      retry: 0,
      timeout: Number(process.env.NUXT_FASTAPI_TIMEOUT_MS ?? 4000),
      query: { limit },
      headers: {
        Authorization: authHeader,
      },
    });

    return {
      items: Array.isArray(response?.body.items) ? response.body.items : [],
    };
  }
  catch (error) {
    console.error('FastAPI changes request failed', error);
    throw createError({
      statusCode: 502,
      statusMessage: 'Failed to load changes',
    });
  }
});
