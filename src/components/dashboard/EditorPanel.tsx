import { Box, ScrollArea } from '@mantine/core';
import Editor from '@/components/features/Editor';
import { useState } from 'react';
import detectFormat, { DataFormat } from '@/utils/detectFormat';
import { DATA_FORMATS } from '@/constants';

export function EditorPanel() {
  const [schema, setSchema] = useState(''); 
  const [format, setFormat] = useState<DataFormat>(DATA_FORMATS.YAML);

  function handleChangeEditor (newText: string) {
    setSchema(newText);
    const newFormatResult = detectFormat(newText);

    if (newFormatResult) {
      setFormat(newFormatResult);
    }
  }

  return (
    <ScrollArea h="100%" type="auto" bg="#1e90ff33">
      <Box p={5} style={{ minHeight: 0 }}>
        <Editor 
          value={schema}
          onChange={handleChangeEditor}
          format={format}
          errors={[]}
        />
      </Box>
    </ScrollArea>
  );
}
