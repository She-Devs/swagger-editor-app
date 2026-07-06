import { Box, ScrollArea } from '@mantine/core';
import { ValidationErrors } from '../features/ValidationErrors/ValidationErrors';
import { useEditorStore } from '@/store/useEditorStore';
import { EndpointList } from './EndpointList';

export function ViewerPanel() {
  const validatedData = useEditorStore((state) => state.validatedData);
  const isValid = useEditorStore((state) => state.isValid);

  return (
    <ScrollArea h="100%" type="auto">
      <Box p={12} style={{ minHeight: 0 }}>
        <ValidationErrors/>
        {isValid && <EndpointList schema={validatedData} />}
      </Box>
    </ScrollArea>
  );
}
