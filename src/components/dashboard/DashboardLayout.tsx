'use client';

import { useEffect, useState } from 'react';
import { Splitter } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';

import { EditorPanel } from './EditorPanel';
import { ViewerPanel } from './ViewerPanel';
import { LoaderComponent } from '../loader/Loader';

export function DashboardLayout() {
  const [mounted, setMounted] = useState(false);
  const isLandscape = useMediaQuery('(orientation: landscape)');

   
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <LoaderComponent/>
    );
  }

  return (
    <Splitter
      orientation={isLandscape ? 'horizontal' : 'vertical'}
      style={{ height: '100vh' }}
    >
      <Splitter.Pane defaultSize={50}>
        <EditorPanel />
      </Splitter.Pane>

      <Splitter.Pane defaultSize={50}>
        <ViewerPanel />
      </Splitter.Pane>
    </Splitter>
  );
}
