import { createClient } from '@/lib/supabase/server';
import { HistoryList } from '@/components/HistoryList/HistoryList';
import { EmptyStateActions } from '@/components/ui/EmptyStateActions/EmptyStateActions';
import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { Box, Container, Group, Text, Title } from '@mantine/core';
import { IconHistory } from '@tabler/icons-react';
import classes from './HistoryPage.module.css';
 
export default async function HistoryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;
  if (!user) redirect(`/${locale}`);
 
  const t = await getTranslations('History');
 
  const { data: history, error } = await supabase
    .from('requests_history')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
 
  return (
    <Container size="xl" py="xl">
      <Group gap="sm" mb="xl">
        <IconHistory size={28} />
        <Title order={2}>{t('title')}</Title>
      </Group>
 
      {history.length === 0 ? (
        <Box p="xl" className={classes.emptyState}>
          <Text size="lg" fw={500} mb="xs">{t('empty')}</Text>
          <Text size="sm" c="dimmed" mb="xl">{t('emptyHint')}</Text>
          <EmptyStateActions label={t('goToEditor')} />
        </Box>
      ) : (
        <HistoryList history={history} t={{
          method: t('method'),
          url: t('url'),
          status: t('status'),
          timestamp: t('timestamp'),
          details: t('details'),
          duration: t('duration'),
          requestSize: t('requestSize'),
          responseSize: t('responseSize'),
          error: t('error'),
        }} />
      )}
    </Container>
  );
}
