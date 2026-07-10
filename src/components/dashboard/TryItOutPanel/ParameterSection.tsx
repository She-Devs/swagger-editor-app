'use client';

import { Stack, Text, TextInput } from '@mantine/core';
import type { OAParameter } from '../ViewerPanel/types';

interface ParameterSectionProps {
  title: string;
  params: OAParameter[];
  validationErrors: Record<string, string>;
  values: Record<string, string>;
  onValueChange: (inType: string, name: string, value: string) => void;
}

export function ParameterSection({
  title,
  params,
  validationErrors,
  values,
  onValueChange,
}: ParameterSectionProps) {
  if (!params.length) return null;

  return (
    <Stack gap="xs">
      <Text fw={600} size="sm" c="dimmed">
        {title}
      </Text>
      {params.map((param) => {
        const key = `${param.in}_${param.name}`;
        const error = validationErrors[key];
        const value = values[key] ?? '';

        return (
          <TextInput
            key={key}
            label={param.name}
            description={param.description}
            required={param.required}
            error={error}
            value={value}
            onChange={(e) => onValueChange(param.in, param.name, e.currentTarget.value)}
          />
        );
      })}
    </Stack>
  );
}
