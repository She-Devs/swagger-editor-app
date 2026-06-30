import { getRequestConfig } from 'next-intl/server';

export enum Locale {
  EN = 'en',
  RU = 'ru',
}

export const localesArray: string[] = Object.values(Locale); 
export const defaultLocale = Locale.EN;

export default getRequestConfig(async ({ locale }) => {
  const isValidLocale = locale && localesArray.includes(locale);
  const selectedLocale = isValidLocale ? (locale as Locale) : defaultLocale;

  return {
    locale: selectedLocale,
    messages: (await import(`../locales/${selectedLocale}.json`)).default,
  };
});
