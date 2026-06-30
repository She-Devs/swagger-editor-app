import { Box } from '@mantine/core';
import { DashboardLayout } from './components/dashboard/DashboardLayout';

export default function Home() {
  return (
    <Box style={{ height: '100vh' }}>
      <DashboardLayout />
    </Box>
  );
}
