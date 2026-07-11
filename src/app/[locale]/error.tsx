'use client';

import { Button, Text, Stack, Title } from '@mantine/core';
import { useTranslations } from 'next-intl';

export default function Error({ reset }: { error: Error; reset: () => void }) {
  const t = useTranslations('ErrorBoundary');

  return (
    <Stack align="center" justify="center" style={{ height: '100vh' }}>
      <Title order={2}>{t('title')}</Title>
      <Text c="dimmed">{t('description')}</Text>
      <Button onClick={reset}>{t('retry')}</Button>
    </Stack>
  );
}
