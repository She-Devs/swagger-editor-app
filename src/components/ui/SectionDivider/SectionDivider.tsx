import { Box, Divider } from '@mantine/core';
import { IconSparkles } from '@tabler/icons-react';

export function SectionDivider() {
  return (
    <Box
      my="xl"
      display="flex"
      style={{
        alignItems: 'center',
        gap: '20px',
      }}
    >
      <Divider style={{ flex: 1 }} />

      <IconSparkles
        size={22}
        stroke={1.5}
        color="var(--mantine-color-violet-5)"
      />

      <Divider style={{ flex: 1 }} />
    </Box>
  );
}
