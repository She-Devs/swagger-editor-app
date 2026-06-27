'use client';

import { useTranslations } from 'next-intl';
import { Box, Button, Group, Text, Container } from '@mantine/core';
import '@mantine/core/styles.css';
import classes from './Header.module.css';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { LanguageToggle } from '@/components/ui/LanguageToggle';
import { Link } from '@/i18n/navigation';
import { LOGO } from '@/constants';

export function Header() {
  const t = useTranslations('Navigation');

  return (
    <Box component="header" className={classes.header}>
      <Container size="2xl" className={classes.container}>
        <Text component="a" href="/" className={classes.logo}>
          {LOGO}
        </Text>
        <Group gap="xl">
          <Link className={classes.link} href="/">
            {t('main')}
          </Link>
          <Link className={classes.link} href="/about">
            {t('about')}
          </Link>
        </Group>
        <Group gap="sm">
          <Button variant="default" className={classes.loginBtn}>
            {t('sign-in')}
          </Button>
          <Button className={classes.signupBtn}> {t('sign-up')}</Button>
          <ThemeToggle />
          <LanguageToggle />
        </Group>
      </Container>
    </Box>
  );
}
