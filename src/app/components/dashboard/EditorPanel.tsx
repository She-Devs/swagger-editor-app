import { Box, ScrollArea } from '@mantine/core';

interface EditorPanelProps {
  children?: React.ReactNode;
}

export function EditorPanel({ children }: EditorPanelProps) {
  return (
    <ScrollArea h="100%" type="auto" bg="#1e90ff33">
      <Box p={12} style={{ minHeight: 0 }}>
        {children || 'Editor Panel Content'}
      </Box>
    </ScrollArea>
  );
}
