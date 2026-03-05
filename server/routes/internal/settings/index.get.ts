import { callFastApiAsNitro } from '@@/server/services/auth.service';

type SettingsEnvelope<T> = {
  status?: string;
  body?: T;
};

export default defineEventHandler(async (event) => {
  const response = await callFastApiAsNitro<SettingsEnvelope<Record<string, unknown>>>(
    event,
    '/api/settings/',
    { method: 'GET' },
  );

  if (response.status !== 'success' || !response.body) {
    throw createError({
      statusCode: 502,
      statusMessage: 'Invalid settings response from backend',
    });
  }

  return response.body;
});
