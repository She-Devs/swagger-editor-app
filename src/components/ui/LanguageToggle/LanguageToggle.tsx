'use client';

import { Button } from '@mantine/core';
import { useRouter, usePathname } from '@/i18n/navigation';
import { useLocale } from 'next-intl';
import { useTransition } from 'react';
import classes from './../../layouts/Header/Header.module.css';
import { Locale } from '@/i18n/request';
import { lANG_EN, lANG_RU } from '@/constants';

export function LanguageToggle() {
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = useLocale();
  const [isPending, startTransition] = useTransition();

  const toggleLanguage = () => {
    const newLocale = currentLocale === Locale.EN ? Locale.RU : Locale.EN;

    startTransition(() => {
      router.replace(pathname, { locale: newLocale });
    });
  };

  return (
    <Button
      className={classes.iconBtn}
      onClick={toggleLanguage}
      loading={isPending}
    >
      {currentLocale === Locale.EN ? lANG_RU : lANG_EN}
    </Button>
  );
}
