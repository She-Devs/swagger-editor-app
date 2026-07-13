'use client';

import { Button, Group } from '@mantine/core';
import { Link } from '@/i18n/navigation';

export function EmptyStateActions({ label }: { label: string }) {
  return (
    <Group justify="center" gap="sm">
      <Button component={Link} href="/" variant="light">
        {label}
      </Button>
    </Group>
  );
}
