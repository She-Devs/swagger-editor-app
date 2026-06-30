'use client';

import { ActionIcon, useMantineColorScheme } from '@mantine/core';
import { useState } from 'react';
import classes from './../layouts/Header/Header.module.css';
import { THEME_DARK, THEME_MOON, THEME_SUN } from '@/constants';

export function ThemeToggle() {
  const { toggleColorScheme, colorScheme } = useMantineColorScheme();

  const [mounted] = useState(() => {
    if (typeof window !== 'undefined') {
      return true;
    }
    return false;
  });

  if (!mounted) {
    return <ActionIcon variant="default" size="xl" radius="md" suppressHydrationWarning />;
  }

  return (
    <ActionIcon
      onClick={() => toggleColorScheme()}
      variant="default"
      size="xl"
      radius="md"
      className={classes.iconBtn}
    >
      {colorScheme === THEME_DARK ? THEME_MOON : THEME_SUN}
    </ActionIcon>
  );
}
