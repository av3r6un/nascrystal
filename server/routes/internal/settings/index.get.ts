import { callFastApiAsNitro } from '@@/server/services/auth.service';

type SettingsEnvelope<T> = {
  status?: string;
  body?: T;
};

export default defineEventHandler(async (event) => {
  try {
    const response = await callFastApiAsNitro<SettingsEnvelope<Record<string, unknown>>>(
      event,
      '/api/settings/',
      { method: 'GET' },
    );

    if (response.status !== 'success' || !response.body) {
      return {};
    }

    return response.body;
  }
  catch (error) {
    console.error('Settings request failed', error);
    return {};
  }
});
