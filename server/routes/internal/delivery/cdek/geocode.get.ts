export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const geocode = String(query.geocode ?? '').trim();
  const results = Number(query.results ?? 10);
  if (!geocode || geocode.length > 500 || !Number.isInteger(results) || results < 1 || results > 50) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid geocoding request' });
  }
  const config = useRuntimeConfig(event);
  const key = config.yandexGeocoderApiKey;
  const referer = config.yandexGeocoderReferer || (import.meta.dev ? 'http://localhost:3000/' : config.public.siteUrl);
  if (!key) {
    throw createError({ statusCode: 503, statusMessage: 'HTTP Geocoder API key is not configured' });
  }
  try {
    return await $fetch('https://geocode-maps.yandex.ru/v1/', {
      query: { apikey: key, geocode, format: 'json', lang: 'ru_RU', results },
      headers: { Referer: referer },
      retry: 0, timeout: 15000,
    });
  }
  catch (error) {
    // Fetch errors contain the URL with the key: never log or forward them.
    const status = (error as { response?: { status?: number } }).response?.status;
    const message = status === 401 || status === 403
      ? 'Яндекс отклонил ключ HTTP Геокодера. Проверьте его активацию, доступ к сервису и ограничения в кабинете Яндекса.'
      : status === 429
        ? 'Яндекс отклонил запрос из-за ограничения частоты или квоты геокодера.'
        : 'Не удалось получить адрес от геокодера Яндекса.';
    throw createError({
      statusCode: 502, statusMessage: 'Yandex geocoding failed',
      data: { message, upstream_status: status ?? null },
    });
  }
});
