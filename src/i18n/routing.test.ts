import { describe, it, expect, vi } from 'vitest';

vi.mock('next-intl/routing', () => ({
  defineRouting: vi.fn((config: unknown) => config),
}));

describe('i18n/routing', () => {
  it('exports routing with correct locales', async () => {
    const { routing } = await import('./routing');
    expect(routing).toMatchObject({
      locales: ['en', 'ru'],
      defaultLocale: 'en',
      localePrefix: 'always',
    });
  });

  it('includes "en" and "ru" as supported locales', async () => {
    const { routing } = await import('./routing');
    expect(routing.locales).toContain('en');
    expect(routing.locales).toContain('ru');
  });

  it('has "en" as defaultLocale', async () => {
    const { routing } = await import('./routing');
    expect(routing.defaultLocale).toBe('en');
  });
});
