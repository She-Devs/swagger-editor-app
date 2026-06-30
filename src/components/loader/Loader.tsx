'use client';

import { Center, Loader } from '@mantine/core';

interface LoaderProps {
  visible?: boolean;
  bg?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  type?: 'bars' | 'dots' | 'oval';
  color?: string;
}

export function LoaderComponent({ 
  visible = true,
  size = 'xl', 
  type = 'oval',
  color = '#228be6'
}: LoaderProps) {
  
  if (!visible) return null;

  return (
    <Center 
      pos="fixed" 
      inset={0} 
      h="100vh" 
      w="100vw" 
    >
      <Loader 
        color={color} 
        size={size} 
        type={type} 
        style={{ 
          stroke: color,
          color: color
        }} 
      />
    </Center>
  );
}
