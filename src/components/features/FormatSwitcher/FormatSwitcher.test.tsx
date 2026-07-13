import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { FormatSwitcher } from './FormatSwitcher';
import { notifications } from '@mantine/notifications';

interface EditorState {
  format: string;
  schema: string;
  isValid: boolean;
  convert: () => void;
}

const mockState: EditorState = {
  format: 'yaml',
  schema: 'openapi: 3.0.0',
  isValid: true,
  convert: vi.fn(),
};

vi.mock('@/store/useEditorStore', () => ({
  useEditorStore: (selector: (state: EditorState) => unknown) => selector(mockState),
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
      switchToYaml: 'Switch to YAML',
      switchToJson: 'Switch to JSON',
      invalidSchemaError: 'Schema is invalid',
    };
    return translations[key] || key;
  },
}));

vi.mock('../SaveSchemaButton/SaveSchemaButton', () => ({
  default: () => <button>Save</button>,
}));

vi.mock('@mantine/notifications', () => ({
  notifications: {
    show: vi.fn(),
  },
}));

const renderComponent = () =>
  render(
    <MantineProvider>
      <FormatSwitcher />
    </MantineProvider>
  );

describe('FormatSwitcher', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockState.format = 'yaml';
    mockState.schema = 'openapi: 3.0.0';
    mockState.isValid = true;
  });

  it('renders "switch to json" when format is yaml', () => {
    renderComponent();
    expect(screen.getByRole('button', { name: 'Switch to JSON' })).toBeInTheDocument();
  });

  it('renders "switch to yaml" when format is json', () => {
    mockState.format = 'json';
    renderComponent();
    expect(screen.getByRole('button', { name: 'Switch to YAML' })).toBeInTheDocument();
  });

  it('disables button when schema is empty', () => {
    mockState.schema = '   ';
    renderComponent();
    expect(screen.getByRole('button', { name: 'Switch to JSON' })).toBeDisabled();
  });

  it('calls convert when schema is valid', () => {
    renderComponent();
    fireEvent.click(screen.getByRole('button', { name: 'Switch to JSON' }));

    expect(mockState.convert).toHaveBeenCalledTimes(1);
    expect(notifications.show).not.toHaveBeenCalled();
  });

  it('shows notification and does not call convert when schema is invalid', () => {
    mockState.isValid = false;
    renderComponent();
    fireEvent.click(screen.getByRole('button', { name: 'Switch to JSON' }));

    expect(notifications.show).toHaveBeenCalledWith({
      message: 'Schema is invalid',
      color: 'red',
      autoClose: 3000,
      style: { minHeight: '60px' },
    });
    expect(mockState.convert).not.toHaveBeenCalled();
  });
});
