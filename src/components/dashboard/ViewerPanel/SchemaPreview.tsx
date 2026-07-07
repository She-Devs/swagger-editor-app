import { Code, ScrollArea, Text } from '@mantine/core';

export function SchemaPreview({ schema }: { schema: Record<string, unknown> | undefined }) {
  if (!schema) return <Text size="xs" c="dimmed">—</Text>;
  return (
    <ScrollArea>
      <Code block fz="xs" style={{ maxHeight: 160 }}>
        {JSON.stringify(schema, null, 2)}
      </Code>
    </ScrollArea>
  );
}
