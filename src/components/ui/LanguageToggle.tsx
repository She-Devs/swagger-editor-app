'use client';

import { Button } from '@mantine/core';
import { useRouter, usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useTransition } from 'react';
import classes from './../layouts/Header/Header.module.css';
import { Locale, localesArray } from '@/i18n/request';
import { lANG_EN, lANG_RU } from '@/constants';

export function LanguageToggle() {
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = useLocale();
  const [isPending, startTransition] = useTransition();

  const toggleLanguage = () => {
    const newLocale = currentLocale === Locale.EN ? Locale.RU : Locale.EN;

    if (!localesArray.includes(newLocale)) {
      return; 
    }
    
    const pathnameWithoutLocale = pathname.replace(/^\/[^\/]+/, '');
    const newPathname = `/${newLocale}${pathnameWithoutLocale}`;

    startTransition(() => {
      router.push(newPathname);
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
