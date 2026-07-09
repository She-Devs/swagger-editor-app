'use client';

import { Divider, Select, Textarea, Stack } from '@mantine/core';

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

      <Textarea
        label="Request Body"
        description={`Provide payload matching spec configuration (${contentType || ''})`}
        minRows={10}
        autosize
        value={body}
        onChange={(event) => onBodyChange(event.currentTarget.value)}
      />
    </Stack>
  );
}
