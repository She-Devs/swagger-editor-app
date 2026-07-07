'use client';

import { OpenAPI } from 'openapi-types';
import { Badge, Box, Code, Group, Stack, Text, Title } from '@mantine/core';
import { EndpointItem } from './EndpointItem';
import { HTTP_METHODS } from './types';
import type { OAOperation } from './types';

interface EndpointListProps {
  schema: OpenAPI.Document | null;
}

export function EndpointList({ schema }: EndpointListProps) {
  if (!schema?.paths || Object.keys(schema.paths).length === 0) {
    return <Text c="dimmed" ta="center" mt="xl">No endpoints found</Text>;
  }

  const paths = Object.keys(schema.paths).sort();

  return (
    <Stack gap="lg">
      <Title order={4} c="dimmed">
        Endpoints ({paths.reduce((acc, p) => {
          const item = schema.paths?.[p] as Record<string, unknown> | undefined;
          return acc + HTTP_METHODS.filter((m) => item?.[m]).length;
        }, 0)})
      </Title>

      {paths.map((path) => {
        const pathItem = schema.paths?.[path] as Record<string, OAOperation> | undefined;
        const methods = HTTP_METHODS.filter((m) => pathItem?.[m]);
        if (!methods.length) return null;

        return (
          <Box key={path}>
            <Group gap="xs" mb="xs">
              <Text size="xs" c="dimmed" fw={600} tt="uppercase">Path</Text>
              <Code fz="sm" fw={700}>{path}</Code>
              <Badge size="xs" color="gray" variant="outline">{methods.length} method{methods.length !== 1 ? 's' : ''}</Badge>
            </Group>
            <Stack gap={4}>
              {methods.map((method) => (
                <EndpointItem
                  key={`${method}:${path}`}
                  method={method}
                  path={path}
                  operation={pathItem![method]}
                />
              ))}
            </Stack>
          </Box>
        );
      })}
    </Stack>
  );
}
