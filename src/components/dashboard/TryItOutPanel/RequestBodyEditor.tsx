'use client';

import { useMemo } from 'react';
import { Divider, Stack, InputWrapper, TextInput } from '@mantine/core';
import CodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';

interface RequestBodyEditorProps {
  body: string;
  onBodyChange: (text: string) => void;
}

export function RequestBodyEditor({ body, onBodyChange }: RequestBodyEditorProps) {
  const validationError = useMemo(() => {
    if (!body.trim()) return null;
    try {
      JSON.parse(body);
      return null;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return error.message;
      }
      return 'Invalid JSON syntax';
    }
  }, [body]);

  return (
    <Stack gap="sm">
      <Divider />
      <TextInput
        label="Content-Type"
        value="application/json"
        disabled
      />

      <InputWrapper
        label="Request Body"
        description="Provide payload matching spec configuration (application/json)"
        error={validationError}
      >
        <div 
          style={{ 
            border: `1px solid ${validationError ? 'var(--mantine-color-red-filled)' : 'var(--mantine-color-default-border)'}`,
            borderRadius: 'var(--mantine-radius-sm)',
            overflow: 'hidden',
            fontSize: '14px',
            marginTop: 'calc(var(--mantine-spacing-xs) / 2)'
          }}
        >
          <CodeMirror
            value={body}
            height="250px"
            extensions={[json()]}
            onChange={(value) => onBodyChange(value)}
            theme="dark"
            basicSetup={{
              lineNumbers: true,
              foldGutter: true,
              dropCursor: true,
              allowMultipleSelections: false,
              indentOnInput: true,
            }}
          />
        </div>
      </InputWrapper>
    </Stack>
  );
}
