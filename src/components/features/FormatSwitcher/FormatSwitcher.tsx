'use client';

import { useEditorStore } from '@/store/useEditorStore';
import { DATA_FORMATS } from '@/constants';
import { Button } from '@mantine/core';

export function FormatSwitcher() {
  const format = useEditorStore((state) => state.format);
  const convert = useEditorStore((state) => state.convert);

  const handleConvert = () => {
    convert();
  };

  return (
    <Button variant="default" onClick={handleConvert}>
      {format === DATA_FORMATS.JSON ? 'Переключить на YAML' : 'Переключить на JSON'}
    </Button>
  );
}
