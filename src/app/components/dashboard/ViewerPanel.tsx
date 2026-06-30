import { Box, ScrollArea } from '@mantine/core';

interface ViewerPanelProps {
  children?: React.ReactNode;
}

export function ViewerPanel({ children }: ViewerPanelProps) {
  return (
    <ScrollArea h="100%" type="auto">
      <Box p={12} style={{ minHeight: 0 }}>
        {children || 'Viewer Panel Content'}
      </Box>
    </ScrollArea>
  );
}
