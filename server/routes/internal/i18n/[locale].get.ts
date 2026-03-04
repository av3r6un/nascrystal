import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import type { H3Event } from 'h3';
import { callFastApiAsNitro } from '@@/server/services/auth.service';

type MessageTree = Record<string, unknown>;

type FastApiLocaleResponse = {
  status?: string;
  body?: MessageTree;
};

const LOCALES_DIR = resolve(process.cwd(), 'i18n', 'locales');
const SUPPORTED_LOCALES = new Set(['en', 'ru']);

const isPlainObject = (value: unknown): value is MessageTree => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

const deepMerge = (base: MessageTree, patch: MessageTree): MessageTree => {
  const result: MessageTree = { ...base };

  for (const [key, value] of Object.entries(patch)) {
    const baseValue = result[key];
    if (isPlainObject(baseValue) && isPlainObject(value)) {
      result[key] = deepMerge(baseValue, value);
      continue;
    }
    result[key] = value;
  }

  return result;
};

const loadBaseLocale = async (locale: string): Promise<MessageTree> => {
  const filePath = resolve(LOCALES_DIR, `${locale}.json`);
  const fileContent = await readFile(filePath, 'utf8');
  return JSON.parse(fileContent) as MessageTree;
};

const loadFastApiOverrides = async (event: H3Event, locale: string): Promise<MessageTree> => {
  try {
    const response = await callFastApiAsNitro<FastApiLocaleResponse>(event, `/api/i18n/${locale}`, {
      method: 'GET',
    });

    if (response.status !== 'success' || !isPlainObject(response.body)) {
      return {};
    }

    return response.body;
  }
  catch (error) {
    console.error(`Locale overrides request failed for "${locale}"`, error);
    return {};
  }
};

export default defineEventHandler(async (event) => {
  const locale = getRouterParam(event, 'locale');

  if (!locale || !SUPPORTED_LOCALES.has(locale)) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Locale not supported',
    });
  }

  const baseLocale = await loadBaseLocale(locale);
  const overrides = await loadFastApiOverrides(event, locale);

  return deepMerge(baseLocale, overrides);
});
