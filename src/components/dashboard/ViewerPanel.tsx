import { Box, ScrollArea } from '@mantine/core';
import { ValidationErrors } from '../features/ValidationErrors/ValidationErrors';

export function ViewerPanel() {
  return (
    <ScrollArea h="100%" type="auto">
      <Box p={12} style={{ minHeight: 0 }}>
        <ValidationErrors/>
      </Box>
    </ScrollArea>
  );
}
