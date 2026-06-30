'use client';

import { useTranslations } from 'next-intl';
import { Box, Group, Text, Container } from '@mantine/core';
import '@mantine/core/styles.css';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import classes from './Footer.module.css';
import { LOGO, RS_SCHOOL, FOOTER_YEAR } from '@/constants';

export function Footer() {
  const t = useTranslations('Navigation');
  return (
    <Box component="footer" className={classes.footer}>
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
          <Link
            className={classes.link}
            href="https://rs.school/courses/javascript"
          >
            <Image
              src="/rss-logo.svg"
              alt=" RS School"
              width={20}
              height={20}
            />
            {RS_SCHOOL}
          </Link>
        </Group>
        <Text className={classes.year}>{FOOTER_YEAR}</Text>
      </Container>
    </Box>
  );
}
