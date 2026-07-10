'use client';

import {
  Badge,
  Code,
  Paper,
  Stack,
  Text,
} from '@mantine/core';
import {
  CodeHighlight,
} from '@mantine/code-highlight';
import '@mantine/code-highlight/styles.css';
import type { ResponseState } from './types';

interface ResponseViewerProps {
  response: ResponseState | null;
  error: string | null;
  requestUrl: string | null;
}


export function ResponseViewer({
  response,
  error,
  requestUrl,
}: ResponseViewerProps) {

  function formatBody(body: string) {
    try {
      return JSON.stringify(
        JSON.parse(body),
        null,
        2
      );
    } catch {
      return body;
    }
  }
  
  return (
    <Paper
      withBorder
      p="md"
    >
      <Text
        fw={600}
        mb="xs"
      >
        Response
      </Text>
      {response ? (
        <Stack gap="md">
          {requestUrl && (
            <Stack gap={4}>
              <Text
                size="sm"
                fw={600}
              >
                Request URL
              </Text>
              <Code block>
                {requestUrl}
              </Code>
            </Stack>
          )}
          <Stack gap={4}>
            <Text
              size="sm"
              fw={600}
            >
              Status
            </Text>
            <Badge
              color={
                response.status >= 200 &&
                response.status < 300
                  ? 'green'
                  : 'red'
              }
              w="fit-content"
            >
              {response.status}
            </Badge>
          </Stack>
          <Stack gap={4}>
            <Text
              size="sm"
              fw={600}
            >
              Response Body
            </Text>
            <CodeHighlight
              language="json"
              code={formatBody(response.body)}
            />
          </Stack>
        </Stack>
      ) : error ? (
        <Text
          size="sm"
          c="red"
        >
          {error}
        </Text>
      ) : (
        <Text
          size="sm"
          c="dimmed"
        >
          Execute a request to see response.
        </Text>
      )}
    </Paper>
  );
}
