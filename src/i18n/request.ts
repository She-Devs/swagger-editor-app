import { getRequestConfig } from 'next-intl/server';

export const locales = ['en', 'ru'];
export const defaultLocale = 'en';

export default getRequestConfig(async ({ locale }) => {
  const selectedLocale =
    locale && locales.includes(locale) ? locale : defaultLocale;

  return {
    locale: selectedLocale,
    messages: (await import(`../locales/${selectedLocale}.json`)).default,
  };
});
