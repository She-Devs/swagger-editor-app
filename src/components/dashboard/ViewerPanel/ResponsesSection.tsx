import { Badge, Box, Group, Paper, Stack, Text } from '@mantine/core';
import { SchemaPreview } from './SchemaPreview';
import type { OAResponse } from './types';

export function ResponsesSection({ responses }: { responses: Record<string, OAResponse> }) {
  return (
    <Stack gap="xs">
      {Object.entries(responses).map(([statusCode, response]) => {
        const statusNum = parseInt(statusCode, 10);
        const color = statusNum < 300 ? 'teal' : statusNum < 400 ? 'yellow' : 'red';
        const contentTypes = Object.keys(response.content ?? {});
        return (
          <Paper key={statusCode} withBorder p="xs" radius="sm">
            <Group gap="xs" mb={4}>
              <Badge color={color} size="sm" radius="sm">{statusCode}</Badge>
              <Text size="xs" c="dimmed">{response.description ?? ''}</Text>
            </Group>
            {contentTypes.map((ct) => (
              <Box key={ct}>
                <Text size="xs" fw={500} mb={4}>{ct}</Text>
                <SchemaPreview schema={response.content?.[ct]?.schema} />
              </Box>
            ))}
          </Paper>
        );
      })}
    </Stack>
  );
}
