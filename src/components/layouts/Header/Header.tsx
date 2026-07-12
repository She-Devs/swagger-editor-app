'use client';

import { useTranslations } from 'next-intl';
import { Box, Button, Group, Container } from '@mantine/core';
import '@mantine/core/styles.css';
import classes from './Header.module.css';
import { ThemeToggle } from '@/components/ui/ThemeToggle/ThemeToggle';
import { LanguageToggle } from '@/components/ui/LanguageToggle/LanguageToggle';
import { Link, useRouter } from '@/i18n/navigation';
import { LOGO } from '@/constants';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { createClient } from '@/lib/supabase/client';

export function Header() {
  const t = useTranslations('Navigation');
  const router = useRouter();
  const { user, isLoading } = useAuthStore();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    if (error) {
      return;
    }
    router.push('/');
  };

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
          {user && (
            <Link className={classes.link} href="/history">
              {t('history')}
            </Link>
          )}
        </Group>
        <Group gap="sm">

          {!user && !isLoading ? (
            <>
              <Button component={Link} href="/sign-in" variant="default" className={classes.loginBtn}>
                {t('sign-in')}
              </Button>
              <Button component={Link} href="/sign-up" className={classes.signupBtn}>
                {t('sign-up')}
              </Button>
            </>    
          ) : user ? (
            <>
              <Button onClick={handleSignOut} className={classes.signupBtn}>
                {t('sign-out')}
              </Button>
            </>
          ) : null}
          
          <ThemeToggle />
          <LanguageToggle />
        </Group>
      </Container>
    </Box>
  );
}
