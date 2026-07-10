'use client';

import { Paper, Stack, Text } from '@mantine/core';
import { CodeHighlight } from '@mantine/code-highlight';

interface CurlViewerProps {
  curl: string | null;
}

export function CurlViewer({
  curl,
}: CurlViewerProps) {
  if (!curl) {
    return null;
  }

  return (
    <Paper withBorder p="md">
      <Stack gap="sm">
        <Text fw={600}>
          cURL
        </Text>

        <CodeHighlight
          code={curl}
          language="bash"
        />
      </Stack>
    </Paper>
  );
}
