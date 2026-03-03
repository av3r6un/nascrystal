import { callFastApiAsNitro } from '../../services/auth.service';

type StaticEnvelope<T> = {
  status?: string;
  body?: T;
};

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug');
  const locale = `${getQuery(event).locale ?? 'ru'}`.toLowerCase();

  if (!slug) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Slug is required',
    });
  }

  if (!/^[a-z]{2}$/.test(locale)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid locale',
    });
  }

  const response = await callFastApiAsNitro<StaticEnvelope<Record<string, unknown>>>(
    event,
    `/api/static/${slug}/${locale}`,
    { method: 'GET' },
  );

  if (response.status !== 'success' || !response.body) {
    throw createError({
      statusCode: 502,
      statusMessage: 'Invalid static response from backend',
    });
  }

  return response.body;
});
