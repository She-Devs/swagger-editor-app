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
  bg = '#f1f3f5', 
  size = 'xl', 
  type = 'oval',
  color = '#228be6' 
}: LoaderProps) {
  
  if (!visible) return null;

  return (
    <Center 
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 9999,
        height: '100vh', 
        width: '100vw',
        backgroundColor: bg 
      }}
    >
      <Loader color={color} size={size} type={type} style={{ color: color }} />
    </Center>
  );
}
