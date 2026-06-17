import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { callFastApiAsNitro } from '@@/server/services/auth.service';
import { parse } from 'yaml';

type StaticEnvelope<T> = {
  status?: string;
  body?: T;
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
};

const isEmptyRecord = (value: unknown) => {
  return !isRecord(value) || Object.keys(value).length === 0;
};

const readFallbackPage = async (slug: string, locale: string) => {
  if (!/^[\w.-]+$/.test(slug)) return null;

  const source = await readFile(join(process.cwd(), 'public', 'static', `${slug}.yaml`), 'utf8');
  const parsed = parse(source);
  const pages = Array.isArray(parsed) ? parsed : [parsed];

  return pages.find(page => isRecord(page) && `${page.locale ?? ''}`.toLowerCase() === locale)
    ?? pages.find(isRecord)
    ?? null;
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
  ).catch(() => null);

  if (response?.status === 'success' && !isEmptyRecord(response.body)) {
    return response.body;
  }

  const fallbackPage = await readFallbackPage(slug, locale).catch(() => null);
  if (fallbackPage) return fallbackPage;

  throw createError({
    statusCode: 502,
    statusMessage: 'Invalid static response from backend',
  });
});
