import { Box, ScrollArea } from '@mantine/core';
import Editor from '@/components/features/Editor';
import { useEffect, useState } from 'react';
import parseAndDetectFormat, { DataFormat } from '@/utils/parseAndDetectFormat';
import { DATA_FORMATS } from '@/constants';
import validateSchema, { ValidationResult } from '@/utils/validateSchema';

export function EditorPanel() {
  const [schema, setSchema] = useState(''); 
  const [format, setFormat] = useState<DataFormat>(DATA_FORMATS.YAML);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      validateSchema(schema).then((result) => {
        setValidationResult(result);
      });
    }, 500);

    return () => clearTimeout(timer);
  },  [schema]);

  function handleChangeEditor (newText: string) {
    setSchema(newText);
    const newFormatResult = parseAndDetectFormat(newText);

    if (newFormatResult) {
      setFormat(newFormatResult.format);
    }
  }

  return (
    <ScrollArea h="100%" type="auto" >
      <Box p={5} style={{ minHeight: 0 }}>
        <Editor 
          value={schema}
          onChange={handleChangeEditor}
          format={format}
          errors={validationResult?.errors ?? []}
        />
      </Box>
    </ScrollArea>
  );
}
