'use client';

import { Center, Loader } from '@mantine/core';

interface LoaderProps {
  visible?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  type?: 'bars' | 'dots' | 'oval';
}

export function LoaderComponent({ 
  visible = true,
  size = 'xl', 
  type = 'oval'
}: LoaderProps) {
  
  if (!visible) return null;

  return (
    <Center 
      pos="fixed" 
      inset={0} 
      h="100vh" 
      w="100vw"
      style={{
        backgroundColor: 'var(--mantine-color-body)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999, 
      }}
    >
      <Loader 
        size={size} 
        type={type} 
      />
    </Center>
  );
}
