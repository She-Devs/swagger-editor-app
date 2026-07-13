'use client';

import { Paper, Stack, Text } from '@mantine/core';
import { CodeHighlight } from '@mantine/code-highlight';
import { useTranslations } from 'next-intl';

interface CurlViewerProps {
  curl: string | null;
}

export function CurlViewer({ curl }: CurlViewerProps) {
  const t = useTranslations('TryItOut.CurlViewer');
   
  if (!curl) return null;

  return (
    <Paper withBorder p="md" radius="md">
      <Stack gap="xs">
        <Text fw={600} size="sm">
          cURL
        </Text>
        <CodeHighlight 
          code={curl} 
          language="bash" 
          withCopyButton={true} 
          copyLabel={t('copyLabel')} 
          copiedLabel={t('copiedLabel')} 
        />
      </Stack>
    </Paper>
  );
}
