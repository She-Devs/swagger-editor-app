'use client';

import { useEffect } from 'react';
import { useMantineColorScheme } from '@mantine/core';

export function ColorSchemeInitializer() {
  const { setColorScheme } = useMantineColorScheme();
  
  useEffect(() => {
    // Восстанавливаем сохраненную тему только на клиенте
    const saved = localStorage.getItem('mantine-color-scheme') as 'light' | 'dark' | 'auto' | null;
    if (saved) {
      setColorScheme(saved);
    }
  }, [setColorScheme]);

  return null;
}
