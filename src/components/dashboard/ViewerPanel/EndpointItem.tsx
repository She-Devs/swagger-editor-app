'use client';

import { useState } from 'react';
import {
  Accordion,
  Badge,
  Box,
  Code,
  Divider,
  Group,
  Paper,
  Stack,
  Text,
  UnstyledButton,
} from '@mantine/core';
import { IconChevronDown, IconChevronRight } from '@tabler/icons-react';
import { ParametersTable } from './ParametersTable';
import { ResponsesSection } from './ResponsesSection';
import { SchemaPreview } from './SchemaPreview';
import { METHOD_COLORS } from './types';
import type { OAOperation, OAParameter } from './types';

interface EndpointItemProps {
  method: string;
  path: string;
  operation: OAOperation;
}

export function EndpointItem({ method, path, operation }: EndpointItemProps) {
  const [open, setOpen] = useState(false);
  const parameters: OAParameter[] = (operation.parameters ?? []) as OAParameter[];
  const color = METHOD_COLORS[method] ?? 'gray';

  return (
    <Paper withBorder radius="md" mb="xs" style={{ overflow: 'hidden' }}>
      <UnstyledButton
        onClick={() => setOpen((v) => !v)}
        style={{ width: '100%' }}
        p="sm"
      >
        <Group justify="space-between" wrap="nowrap">
          <Group gap="sm" wrap="nowrap">
            <Badge
              color={color}
              size="md"
              radius="sm"
              style={{ minWidth: 64, textAlign: 'center', textTransform: 'uppercase', fontWeight: 700 }}
            >
              {method}
            </Badge>
            <Code fz="sm" style={{ wordBreak: 'break-all' }}>{path}</Code>
          </Group>
          <Group gap="xs" wrap="nowrap">
            {operation.summary && (
              <Text
                size="xs"
                c="dimmed"
                style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
              >
                {operation.summary}
              </Text>
            )}
            {open ? <IconChevronDown size={16} /> : <IconChevronRight size={16} />}
          </Group>
        </Group>
      </UnstyledButton>

      {open && (
        <>
          <Divider />
          <Box p="md">
            {operation.description && (
              <Text size="sm" c="dimmed" mb="md">{operation.description}</Text>
            )}

            <Accordion variant="separated" radius="md" defaultValue={null}>
              {(['path', 'query', 'header', 'cookie'] as const).map((paramIn) => (
                <Accordion.Item key={paramIn} value={paramIn}>
                  <Accordion.Control>
                    <Group gap="xs">
                      <Text size="sm" fw={500}>Parameters</Text>
                      <Badge size="xs" color="gray" variant="outline">{paramIn}</Badge>
                      <Badge size="xs" color="blue" variant="light">
                        {parameters.filter((p) => p.in === paramIn).length}
                      </Badge>
                    </Group>
                  </Accordion.Control>
                  <Accordion.Panel>
                    <ParametersTable parameters={parameters} filterIn={paramIn} />
                  </Accordion.Panel>
                </Accordion.Item>
              ))}

              {operation.requestBody && (
                <Accordion.Item value="requestBody">
                  <Accordion.Control>
                    <Group gap="xs">
                      <Text size="sm" fw={500}>Request Body</Text>
                      {operation.requestBody.required && <Badge size="xs" color="red">required</Badge>}
                    </Group>
                  </Accordion.Control>
                  <Accordion.Panel>
                    {operation.requestBody.description && (
                      <Text size="xs" c="dimmed" mb="xs">{operation.requestBody.description}</Text>
                    )}
                    <Stack gap="xs">
                      {Object.entries(operation.requestBody.content ?? {}).map(([ct, mediaType]) => (
                        <Box key={ct}>
                          <Text size="xs" fw={500} mb={4}>{ct}</Text>
                          <SchemaPreview schema={mediaType?.schema} />
                        </Box>
                      ))}
                    </Stack>
                  </Accordion.Panel>
                </Accordion.Item>
              )}

              {operation.responses && Object.keys(operation.responses).length > 0 && (
                <Accordion.Item value="responses">
                  <Accordion.Control>
                    <Text size="sm" fw={500}>Responses</Text>
                  </Accordion.Control>
                  <Accordion.Panel>
                    <ResponsesSection responses={operation.responses} />
                  </Accordion.Panel>
                </Accordion.Item>
              )}
            </Accordion>
          </Box>
        </>
      )}
    </Paper>
  );
}
