'use client';

import { ActionIcon, useMantineColorScheme } from '@mantine/core';
import { useEffect, useState } from 'react';
import classes from './../layouts/Header/Header.module.css';

export function ThemeToggle() {
  const { toggleColorScheme, colorScheme } = useMantineColorScheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <ActionIcon variant="default" size="xl" radius="md" />;
  }

  return (
    <ActionIcon
      onClick={() => toggleColorScheme()}
      variant="default"
      size="xl"
      radius="md"
      className={classes.iconBtn}
    >
      {colorScheme === 'dark' ? '🌙' : '☀️'}
    </ActionIcon>
  );
}
