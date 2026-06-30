'use client';

import { Button } from '@mantine/core';
import { useRouter, usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useTransition } from 'react';
import classes from './../layouts/Header/Header.module.css';

export function LanguageToggle() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const [isPending, startTransition] = useTransition();

  const toggleLanguage = () => {
    const newLocale = locale === 'en' ? 'ru' : 'en';
    const segments = pathname.split('/');
    segments[1] = newLocale;
    const newPathname = segments.join('/') || '/';

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
      {locale === 'en' ? 'RU' : 'EN'}
    </Button>
  );
}
