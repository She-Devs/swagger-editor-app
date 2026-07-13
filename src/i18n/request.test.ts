import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('next-intl/server', () => ({
  getRequestConfig: (fn: unknown) => fn,
}));

vi.mock('../locales/en.json', () => ({
  default: { hello: 'Hello' },
}));

vi.mock('../locales/ru.json', () => ({
  default: { hello: 'Привет' },
}));

import config, { Locale, localesArray, defaultLocale } from './request';

describe('i18n request config', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('exports correct locales array and default locale', () => {
    expect(localesArray).toEqual(['en', 'ru']);
    expect(defaultLocale).toBe(Locale.EN);
  });

  it('returns requested locale and its messages when locale is valid', async () => {
    const getConfig = config as unknown as (params: {
      locale: string;
    }) => Promise<{ locale: string; messages: unknown }>;

    const result = await getConfig({ locale: 'ru' });

    expect(result.locale).toBe('ru');
    expect(result.messages).toEqual({ hello: 'Привет' });
  });

  it('falls back to default locale when locale is invalid', async () => {
    const getConfig = config as unknown as (params: {
      locale: string;
    }) => Promise<{ locale: string; messages: unknown }>;

    const result = await getConfig({ locale: 'fr' });

    expect(result.locale).toBe(defaultLocale);
    expect(result.messages).toEqual({ hello: 'Hello' });
  });

  it('falls back to default locale when locale is undefined', async () => {
    const getConfig = config as unknown as (params: {
      locale: undefined;
    }) => Promise<{ locale: string; messages: unknown }>;

    const result = await getConfig({ locale: undefined });

    expect(result.locale).toBe(defaultLocale);
    expect(result.messages).toEqual({ hello: 'Hello' });
  });
});
