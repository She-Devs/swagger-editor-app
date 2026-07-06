'use client';

import { useState } from 'react';
import { OpenAPI } from 'openapi-types';
import {
  Accordion,
  Badge,
  Box,
  Code,
  Divider,
  Group,
  Paper,
  ScrollArea,
  Stack,
  Table,
  Text,
  Title,
  UnstyledButton,
} from '@mantine/core';
import { IconChevronDown, IconChevronRight } from '@tabler/icons-react';

interface EndpointListProps {
  schema: OpenAPI.Document | null;
}

const METHOD_COLORS: Record<string, string> = {
  get: 'teal',
  post: 'blue',
  put: 'orange',
  delete: 'red',
  patch: 'yellow',
  options: 'gray',
  head: 'gray',
  trace: 'gray',
};

const HTTP_METHODS = ['get', 'post', 'put', 'delete', 'patch', 'options', 'head', 'trace'];

type OAParameter = {
  name: string;
  in: string;
  required?: boolean;
  description?: string;
  schema?: Record<string, unknown>;
};

type OAResponse = {
  description?: string;
  content?: Record<string, { schema?: Record<string, unknown> }>;
};

type OAOperation = {
  summary?: string;
  description?: string;
  operationId?: string;
  parameters?: OAParameter[];
  requestBody?: {
    description?: string;
    required?: boolean;
    content?: Record<string, { schema?: Record<string, unknown> }>;
  };
  responses?: Record<string, OAResponse>;
};

function SchemaPreview({ schema }: { schema: Record<string, unknown> | undefined }) {
  if (!schema) return <Text size="xs" c="dimmed">—</Text>;
  return (
    <ScrollArea>
      <Code block fz="xs" style={{ maxHeight: 160 }}>
        {JSON.stringify(schema, null, 2)}
      </Code>
    </ScrollArea>
  );
}

function ParametersTable({ parameters, filterIn }: { parameters: OAParameter[]; filterIn: string }) {
  const filtered = parameters.filter((p) => p.in === filterIn);
  if (filtered.length === 0) return <Text size="xs" c="dimmed">None</Text>;
  return (
    <Table fz="xs" withTableBorder withColumnBorders>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Name</Table.Th>
          <Table.Th>Required</Table.Th>
          <Table.Th>Type</Table.Th>
          <Table.Th>Description</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {filtered.map((p) => (
          <Table.Tr key={p.name}>
            <Table.Td><Code fz="xs">{p.name}</Code></Table.Td>
            <Table.Td>{p.required ? <Badge size="xs" color="red">yes</Badge> : <Text size="xs" c="dimmed">no</Text>}</Table.Td>
            <Table.Td><Text size="xs">{(p.schema as { type?: string } | undefined)?.type ?? '—'}</Text></Table.Td>
            <Table.Td><Text size="xs" c="dimmed">{p.description ?? '—'}</Text></Table.Td>
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  );
}

function ResponsesSection({ responses }: { responses: Record<string, OAResponse> }) {
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

function EndpointItem({ method, path, operation }: { method: string; path: string; operation: OAOperation }) {
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
            {operation.summary && <Text size="xs" c="dimmed" style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{operation.summary}</Text>}
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

export function EndpointList({ schema }: EndpointListProps) {
  if (!schema?.paths || Object.keys(schema.paths).length === 0) {
    return (
      <Text c="dimmed" ta="center" mt="xl">No endpoints found</Text>
    );
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
