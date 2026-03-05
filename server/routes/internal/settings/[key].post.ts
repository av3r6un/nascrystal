type SettingsEnvelope<T> = {
  status?: string;
  body?: T;
};

type KeyValuePayload = {
  value: unknown;
};

export default defineEventHandler(async (event) => {
  const key = getRouterParam(event, 'key');
  if (!key) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Setting key is required',
    });
  }

  const authHeader = getHeader(event, 'authorization');
  if (!authHeader || !authHeader.toLowerCase().startsWith('bearer ')) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Authorization header is required',
    });
  }

  const payload = await readBody<Partial<KeyValuePayload>>(event);
  if (!payload || !Object.prototype.hasOwnProperty.call(payload, 'value')) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Body must be a JSON object with "value"',
    });
  }

  const baseUrl = useRuntimeConfig(event).fastApiBaseUrl.replace(/\/+$/, '');

  const response = await $fetch<SettingsEnvelope<Record<string, unknown>>>(`${baseUrl}/api/settings/${key}`, {
    method: 'POST',
    retry: 0,
    timeout: Number(process.env.NUXT_FASTAPI_TIMEOUT_MS ?? 4000),
    body: { value: payload.value },
    headers: {
      'Content-Type': 'application/json',
      'Authorization': authHeader,
    },
  });

  if (response.status !== 'success') {
    throw createError({
      statusCode: 502,
      statusMessage: 'Invalid settings response from backend',
    });
  }

  return response.body ?? {};
});
