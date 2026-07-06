import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import SaveSchemaButton from './SaveSchemaButton';

interface AuthState {
  user: { id: string } | null;
}

interface EditorState {
  schema: string;
  isValid: boolean;
  isSaving: boolean;
  saveSchema: () => void;
}

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: () => ({ matches: false, addEventListener: () => {}, removeEventListener: () => {} }),
});

vi.mock('@/store/authStore', () => ({
  useAuthStore: (selector: (state: AuthState) => unknown) => {
    const state: AuthState = { user: { id: 'user-1' } };
    return selector(state);
  },
}));

vi.mock('@/store/useEditorStore', () => ({
  useEditorStore: (selector: (state: EditorState) => unknown) => {
    const state: EditorState = {
      schema: 'openapi: 3.0.0',
      isValid: true,
      isSaving: false,
      saveSchema: vi.fn(),
    };
    return selector(state);
  },
}));

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      'title': 'Save',
    };
    return translations[key] || key;
  },
}));

describe('SaveSchemaButton', () => {
  it('renders', () => {
    const { container } = render(
      <MantineProvider>
        <SaveSchemaButton />
      </MantineProvider>
    );
    expect(container).toBeDefined();
  });
});
