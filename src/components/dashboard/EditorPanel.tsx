'use client';

import { Box, ScrollArea } from '@mantine/core';
import Editor from '@/components/features/Editor/Editor';
import { useEffect } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { FormatSwitcher } from '../features/FormatSwitcher/FormatSwitcher';

export function EditorPanel() {
  const schema = useEditorStore((state) => state.schema);
  const format = useEditorStore((state) => state.format);
  const errors = useEditorStore((state) => state.errors);
  const setSchema = useEditorStore((state) => state.setSchema);
  const validate = useEditorStore((state) => state.validate);

  useEffect(() => {
    const timer = setTimeout(() => {
      validate();
    }, 500);

    return () => clearTimeout(timer);
  }, [schema, validate]);

  function handleChangeEditor(newText: string) {
    setSchema(newText);
  }

  return (
    <ScrollArea h="100%" type="auto" >
      <FormatSwitcher />
      <Box p={5} style={{ minHeight: 0 }}>
        <Editor 
          value={schema}
          onChange={handleChangeEditor}
          format={format}
          errors={errors}
        />
      </Box>
    </ScrollArea>
  );
}
