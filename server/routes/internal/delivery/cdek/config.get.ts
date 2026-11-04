import { callFastApiAsNitro } from '@@/server/services/auth.service';

export default defineEventHandler(async (event) => {
  const response = await callFastApiAsNitro<{ body: Record<string, unknown> }>(event, '/api/delivery/cdek/widget/config', {
    query: { quantity: getQuery(event).quantity }, timeout: 25000,
  });
  return { ...response.body, geocoderConfigured: Boolean(useRuntimeConfig(event).yandexGeocoderApiKey) };
});
