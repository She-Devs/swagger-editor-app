'use client';

import { ActionIcon, useMantineColorScheme } from '@mantine/core';
import classes from './../layouts/Header/Header.module.css';
import { THEME_ICONS } from '@/constants';

export function ThemeToggle() {
  const { toggleColorScheme, colorScheme } = useMantineColorScheme();

  const icon = THEME_ICONS[colorScheme as keyof typeof THEME_ICONS] || THEME_ICONS.light;

  return (
    <ActionIcon
      onClick={() => toggleColorScheme()}
      variant="default"
      size="xl"
      radius="md"
      className={classes.iconBtn}
    >
      <span suppressHydrationWarning>{icon}</span>
    </ActionIcon>
  );
}
