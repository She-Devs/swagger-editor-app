'use client';

import { Button, Group } from '@mantine/core';
import { IconSend, IconTerminal, IconX } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';

interface ExecuteActionsProps {
  onExecute: () => void;
  onGenerateCurl: () => void;
  onClear: () => void;
  loading?: boolean;
}

export function ExecuteActions({
  onExecute,
  onGenerateCurl,
  onClear,
  loading = false,
}: ExecuteActionsProps) {
  const t = useTranslations('TryItOut.ExecuteActions');
    
  return (
    <Group gap="sm">
      <Button
        onClick={onExecute}
        loading={loading}
        disabled={loading}
        leftSection={!loading && <IconSend size={14} />}
      >
        {t('execute')}
      </Button>

      <Button
        variant="light"
        onClick={onGenerateCurl}
        disabled={loading}
        leftSection={<IconTerminal size={14} />}
      >
        {t('generateCurl')}
      </Button>

      <Button
        variant="subtle"
        color="gray"
        onClick={onClear}
        disabled={loading}
        leftSection={<IconX size={14} />}
      >
        {t('clear')}
      </Button>
    </Group>
  );
}
