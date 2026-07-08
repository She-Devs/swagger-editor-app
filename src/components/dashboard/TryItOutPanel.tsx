'use client';

import {
  Button,
  Code,
  Divider,
  Group,
  Paper,
  Stack,
  Text,
  TextInput,
  Textarea,
} from '@mantine/core';
import { OAOperation } from './ViewerPanel/types';
import { useState } from 'react';


interface TryItOutPanelProps {
  method: string;
  path: string;
  operation: OAOperation;
}

export function TryItOutPanel({
  method,
  path,
  operation,
}: TryItOutPanelProps) {
  const parameters = operation.parameters ?? [];

  const [values, setValues] = useState<Record<string, string>>({});
  const [body, setBody] = useState('');

  const grouped = {
    path: parameters.filter((p) => p.in === 'path'),
    query: parameters.filter((p) => p.in === 'query'),
    header: parameters.filter((p) => p.in === 'header'),
    cookie: parameters.filter((p) => p.in === 'cookie'),
  };

  function updateValue(name: string, value: string) {
    setValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function renderSection(
    title: string,
    params: typeof parameters
  ) {
    if (params.length === 0) return null;

    return (
      <Stack gap="xs">
        <Text fw={600}>{title}</Text>

        {params.map((param) => (
          <TextInput
            key={`${param.in}-${param.name}`}
            label={param.name}
            description={param.description}
            required={param.required}
            value={values[param.name] ?? ''}
            onChange={(e) =>
              updateValue(param.name, e.currentTarget.value)
            }
          />
        ))}
      </Stack>
    );
  }

  return (
    <Stack gap="lg">
      <Paper withBorder p="md">
        <Stack gap="md">

          <Group>
            <Code>{method.toUpperCase()}</Code>
            <Code>{path}</Code>
          </Group>

          {renderSection('Path Parameters', grouped.path)}

          {renderSection('Query Parameters', grouped.query)}

          {renderSection('Headers', grouped.header)}

          {renderSection('Cookies', grouped.cookie)}

          {operation.requestBody && (
            <>
              <Divider />

              <Textarea
                label="Request Body"
                minRows={8}
                autosize
                value={body}
                onChange={(e) =>
                  setBody(e.currentTarget.value)
                }
              />
            </>
          )}

          <Group>
            <Button>
              Execute
            </Button>

            <Button variant="light">
              Generate cURL
            </Button>
          </Group>

        </Stack>
      </Paper>

      <Paper withBorder p="md">
        <Text fw={600}>
          Response
        </Text>

        <Text c="dimmed" size="sm">
          Execute a request to see the response.
        </Text>
      </Paper>
    </Stack>
  );
}
