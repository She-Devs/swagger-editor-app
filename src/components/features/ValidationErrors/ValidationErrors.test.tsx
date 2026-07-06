import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { ValidationErrors } from './ValidationErrors';

interface EditorState {
  schema: string;
  errors: string[];
}

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: () => ({ matches: false, addEventListener: () => {}, removeEventListener: () => {} }),
});

let mockState: EditorState = {
  schema: 'openapi: 3.0.0',
  errors: [],
};

vi.mock('@/store/useEditorStore', () => ({
  useEditorStore: (selector: (state: EditorState) => unknown) => selector(mockState),
}));

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      'emptyState': 'No API definition provided',
      'errorHeader': 'Error',
    };
    return translations[key] || key;
  },
}));

describe('ValidationErrors', () => {
  beforeEach(() => {
    mockState = { schema: 'openapi: 3.0.0', errors: [] };
  });

  it('renders nothing when schema is valid', () => {
    render(
      <MantineProvider>
        <ValidationErrors />
      </MantineProvider>
    );

    expect(screen.queryByText('Error')).not.toBeInTheDocument();
    expect(screen.queryByText('No API definition provided')).not.toBeInTheDocument();
    expect(screen.queryByText('Missing')).not.toBeInTheDocument();
  });

  it('renders errors when there are validation errors', () => {
    mockState = {
      schema: 'invalid',
      errors: ['Missing field: info', 'Missing field: paths'],
    };

    render(
      <MantineProvider>
        <ValidationErrors />
      </MantineProvider>
    );
    
    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByText('Missing field: info')).toBeInTheDocument();
    expect(screen.getByText('Missing field: paths')).toBeInTheDocument();
  });

  it('renders empty state when schema is empty', () => {
    mockState = {
      schema: '',
      errors: [],
    };

    render(
      <MantineProvider>
        <ValidationErrors />
      </MantineProvider>
    );
    
    expect(screen.getByText('No API definition provided')).toBeInTheDocument();
  });
});
