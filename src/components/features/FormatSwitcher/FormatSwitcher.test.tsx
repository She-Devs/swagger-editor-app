import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { FormatSwitcher } from './FormatSwitcher';

interface EditorState {
  format: string;
  schema: string;
  isValid: boolean;
  convert: () => void;
}

vi.mock('@/store/useEditorStore', () => ({
  useEditorStore: (selector: (state: EditorState) => unknown) => {
    const state: EditorState = {
      format: 'yaml',
      schema: 'openapi: 3.0.0',
      isValid: true,
      convert: vi.fn(),
    };
    return selector(state);
  },
}));

vi.mock('@/constants', () => ({
  DATA_FORMATS: {
    YAML: 'yaml',
    JSON: 'json',
  },
}));

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      'switchToYaml': 'Switch to YAML',
      'switchToJson': 'Switch to JSON',
      'invalidSchemaError': 'Schema is invalid',
    };
    return translations[key] || key;
  },
}));

vi.mock('../SaveSchemaButton/SaveSchemaButton', () => ({
  default: () => <button>Save</button>,
}));

describe('FormatSwitcher', () => {
  it('renders without crashing', () => {
    const { container } = render(
      <MantineProvider>
        <FormatSwitcher />
      </MantineProvider>
    );
    expect(container).toBeDefined();
  });
});
