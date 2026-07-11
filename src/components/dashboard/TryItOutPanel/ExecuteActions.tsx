'use client';

import { Button, Group } from '@mantine/core';
import { IconSend, IconTerminal, IconX } from '@tabler/icons-react';

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
  return (
    <Group gap="sm">
      <Button
        onClick={onExecute}
        loading={loading}
        disabled={loading}
        leftSection={!loading && <IconSend size={14} />}
      >
        Execute
      </Button>

      <Button
        variant="light"
        onClick={onGenerateCurl}
        disabled={loading}
        leftSection={<IconTerminal size={14} />}
      >
        Generate cURL
      </Button>

      <Button
        variant="subtle"
        color="gray"
        onClick={onClear}
        disabled={loading}
        leftSection={<IconX size={14} />}
      >
        Clear
      </Button>
    </Group>
  );
}
