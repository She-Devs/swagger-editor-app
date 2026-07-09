import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import SaveSchemaButton from './SaveSchemaButton';
interface AuthState {
  user: { id: string; email: string } | null;
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

const mockSaveSchema = vi.fn();

let mockAuthState: AuthState = {
  user: { id: 'user-1', email: 'test@test.com' },
};

let mockEditorState: EditorState = {
  schema: 'openapi: 3.0.0',
  isValid: true,
  isSaving: false,
  saveSchema: mockSaveSchema,
};

vi.mock('@/store/authStore', () => ({
  useAuthStore: (selector: (state: AuthState) => unknown) => {
    return selector(mockAuthState);
  },
}));

vi.mock('@/store/useEditorStore', () => ({
  useEditorStore: (selector: (state: EditorState) => unknown) => {
    return selector(mockEditorState);
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

function renderButton() {
  return render(
    <MantineProvider>
      <SaveSchemaButton />
    </MantineProvider>
  );
}

describe('SaveSchemaButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthState = {
      user: { id: 'user-1', email: 'test@test.com' },
    };
    mockEditorState = {
      schema: 'openapi: 3.0.0',
      isValid: true,
      isSaving: false,
      saveSchema: mockSaveSchema,
    };
  });

  it('renders save button when user is authenticated', () => {
    renderButton();
    const button = screen.getByRole('button', { name: 'Save' });
    expect(button).toBeInTheDocument();
  });

  it('button is disabled when schema is empty', () => {
    mockEditorState.schema = '';
    mockEditorState.isValid = false;
    
    renderButton();
    const button = screen.getByRole('button', { name: 'Save' });
    expect(button).toBeDisabled();
  });

  it('button is disabled when schema is invalid', () => {
    mockEditorState.isValid = false;
    
    renderButton();
    const button = screen.getByRole('button', { name: 'Save' });
    expect(button).toBeDisabled();
  });

  it('button is disabled when saving', () => {
    mockEditorState.isSaving = true;
    
    renderButton();
    const button = screen.getByRole('button', { name: 'Save' });
    expect(button).toBeDisabled();
  });

  it('calls saveSchema when clicked', () => {
    renderButton();
    const button = screen.getByRole('button', { name: 'Save' });
    fireEvent.click(button);
    expect(mockSaveSchema).toHaveBeenCalledTimes(1);
  });

  it('renders nothing when there is no authenticated user', () => {
    mockAuthState.user = null;
  
    const button = screen.queryByRole('button', { name: 'Save' });
    expect(button).not.toBeInTheDocument();
  });
});
