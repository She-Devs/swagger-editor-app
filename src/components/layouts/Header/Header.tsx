'use client';

import { useTranslations } from 'next-intl';
import { Box, Button, Group, Container } from '@mantine/core';
import '@mantine/core/styles.css';
import classes from './Header.module.css';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { LanguageToggle } from '@/components/ui/LanguageToggle';
import { Link } from '@/i18n/navigation';
import { LOGO } from '@/constants';
import { useEffect, useState } from 'react';

export function Header() {
  const t = useTranslations('Navigation');
  const isAuth = true;
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <Box component="header"  className={`${classes.header} ${scrolled ? classes.scrolled : ''}`}>
      <Container size="2xl" className={classes.container}>
        <Link href="/" className={classes.logo}>
          {LOGO}
        </Link>
        <Group gap="xl">
          <Link className={classes.link} href="/">
            {t('main')}
          </Link>
          <Link className={classes.link} href="/about">
            {t('about')}
          </Link>
        </Group>
        <Group gap="sm">

          {isAuth ? (
            <>
              <Button variant="default" className={classes.loginBtn}>
                {t('sign-in')}
              </Button>
              <Button className={classes.signupBtn}> {t('sign-up')}</Button></>    
          ): (
            <>
              <Button variant="default" className={classes.loginBtn}>
                {t('history')}
              </Button>
              <Button className={classes.signupBtn}> {t('sign-out')}</Button>
            </>
          )}
          
          <ThemeToggle />
          <LanguageToggle />
        </Group>
      </Container>
    </Box>
  );
}
