'use client';

import { Button, Group } from '@mantine/core';
import {
  IconSend,
  IconTerminal,
  IconX,
} from '@tabler/icons-react';

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
    <Group>
      <Button
        onClick={onExecute}
        loading={loading}
        leftSection={<IconSend size={14} />}
      >
        Execute
      </Button>

      <Button
        variant="light"
        onClick={onGenerateCurl}
        leftSection={<IconTerminal size={14} />}
      >
        Generate cURL
      </Button>

      <Button
        variant="subtle"
        color="gray"
        onClick={onClear}
        leftSection={<IconX size={14} />}
      >
        Clear
      </Button>
    </Group>
  );
}
