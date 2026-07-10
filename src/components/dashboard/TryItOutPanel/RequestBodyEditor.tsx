'use client';

import { useMemo } from 'react';
import { Divider, Select, Stack, InputWrapper } from '@mantine/core';
import CodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';
import { yaml } from '@codemirror/lang-yaml';

interface RequestBodyEditorProps {
  contentTypes: string[];
  contentType: string | null;
  body: string;
  onContentTypeChange: (type: string) => void;
  onBodyChange: (text: string) => void;
}

export function RequestBodyEditor({
  contentTypes,
  contentType,
  body,
  onContentTypeChange,
  onBodyChange,
}: RequestBodyEditorProps) {
  
  const extensions = useMemo(() => {
    if (!contentType) return [];
    if (contentType.includes('json')) return [json()];
    if (contentType.includes('yaml') || contentType.includes('yml')) return [yaml()];
    return [];
  }, [contentType]);

  const validationError = useMemo(() => {
    if (contentType?.includes('json') && body.trim()) {
      try {
        JSON.parse(body);
        return null;
      } catch (error: unknown) {
        if (error instanceof Error) {
          return error.message;
        }
        return 'Invalid JSON syntax';
      }
    }
    return null;
  }, [body, contentType]);

  return (
    <Stack gap="sm">
      <Divider />
      
      {contentTypes.length > 0 && (
        <Select
          label="Content-Type"
          description="Select body payload formatting option"
          value={contentType}
          data={contentTypes}
          onChange={(value) => {
            if (value) onContentTypeChange(value);
          }}
        />
      )}

      <InputWrapper
        label="Request Body"
        description={`Provide payload matching spec configuration (${contentType || 'raw'})`}
        error={validationError}
      >
        <div 
          style={{ 
            border: `1px solid ${validationError ? 'var(--mantine-color-red-filled)' : 'var(--mantine-color-default-border)'}`,
            borderRadius: 'var(--mantine-radius-sm)',
            overflow: 'hidden',
            fontSize: '14px',
          }}
        >
          <CodeMirror
            value={body}
            height="250px"
            extensions={extensions}
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
