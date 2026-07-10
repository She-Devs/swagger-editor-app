'use client';

import { useMemo } from 'react';
import { Badge, Code, Paper, Stack, Text, Group } from '@mantine/core';
import { CodeHighlight } from '@mantine/code-highlight';
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
  
  const detectedLanguage = useMemo(() => {
    if (!response?.headers) return 'json';
    
    const contentType = response.headers['content-type'] || response.headers['Content-Type'] || '';
    
    if (contentType.includes('html')) return 'html';
    if (contentType.includes('yaml') || contentType.includes('yml')) return 'yaml';
    if (contentType.includes('xml')) return 'xml';
    
    return 'json';
  }, [response]);

  const formattedBody = useMemo(() => {
    if (!response?.body) return '';
    try {
      return JSON.stringify(JSON.parse(response.body), null, 2);
    } catch {
      return response.body;
    }
  }, [response]);


  const formattedHeaders = useMemo(() => {
    if (!response?.headers || Object.keys(response.headers).length === 0) return null;
  
    const ALLOWED_HEADERS = ['content-type', 'content-length', 'cache-control'];
    const filtered: Record<string, string> = {};

    for (const [key, value] of Object.entries(response.headers)) {
      const lowerKey = key.toLowerCase();
      if (ALLOWED_HEADERS.includes(lowerKey)) {
        filtered[lowerKey] = value;
      }
    }

    if (Object.keys(filtered).length === 0) return null;

    return JSON.stringify(filtered, null, 2);
  }, [response]);

  const friendlyErrorMessage = useMemo(() => {
    if (response && response.status >= 400 && response.body) {
      try {
        const parsed: unknown = JSON.parse(response.body);
        if (parsed && typeof parsed === 'object' && 'message' in parsed) {
          return String((parsed as Record<string, unknown>).message);
        }
      } catch {
      }
    }
    return null;
  }, [response]);

  return (
    <Paper withBorder p="md" radius="md">
      <Text fw={600} mb="xs">
        Response
      </Text>
      
      {response ? (
        <Stack gap="md">
          {requestUrl && (
            <Stack gap={4}>
              <Text size="sm" fw={600}>Request URL</Text>
              <Code block style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                {requestUrl}
              </Code>
            </Stack>
          )}
          
          <Stack gap={4}>
            <Text size="sm" fw={600}>Status</Text>
            <Group gap="xs">
              <Badge
                color={
                  response.status >= 200 && response.status < 300
                    ? 'green'
                    : response.status >= 400 && response.status < 500
                      ? 'orange'
                      : 'red'
                }
                w="fit-content"
              >
                {response.status}
              </Badge>
            </Group>
          </Stack>

          {friendlyErrorMessage && (
            <Stack gap={4}>
              <Text size="sm" fw={600} c="red">Error Message</Text>
              <Paper withBorder p="sm" bg="var(--mantine-color-red-light)" radius="sm">
                <Text size="sm" c="red" fw={500}>
                  {friendlyErrorMessage}
                </Text>
              </Paper>
            </Stack>
          )}

          {formattedHeaders && (
            <Stack gap={4}>
              <Text size="sm" fw={600}>Response Headers</Text>
              <CodeHighlight
                language="json"
                code={formattedHeaders}
                withCopyButton
              />
            </Stack>
          )}

          <Stack gap={4}>
            <Text size="sm" fw={600}>Response Body</Text>
            <CodeHighlight
              language={detectedLanguage}
              code={formattedBody}
              withCopyButton
            />
          </Stack>
        </Stack>
      ) : error ? (
        <Text size="sm" c="red" fw={500}>
          {error}
        </Text>
      ) : (
        <Text size="sm" c="dimmed">
          Execute a request to see response.
        </Text>
      )}
    </Paper>
  );
}
