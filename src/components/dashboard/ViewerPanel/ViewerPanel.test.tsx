import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { OpenAPI } from 'openapi-types';

type StoreState = { validatedData: OpenAPI.Document | null; isValid: boolean };

const mockStoreState: StoreState = { validatedData: null, isValid: false };

vi.mock('@/store/useEditorStore', () => ({
  useEditorStore: (selector: (state: StoreState) => unknown) => selector(mockStoreState),
}));

vi.mock('../../features/ValidationErrors/ValidationErrors', () => ({
  ValidationErrors: () => <div data-testid="validation-errors" />,
}));

vi.mock('./EndpointList', () => ({
  EndpointList: ({ schema }: { schema: unknown }) => (
    <div data-testid="endpoint-list" data-schema={JSON.stringify(schema)} />
  ),
}));

import { ViewerPanel } from './ViewerPanel';

function renderWithMantine(ui: React.ReactElement) {
  return render(<MantineProvider>{ui}</MantineProvider>);
}

describe('ViewerPanel', () => {
  it('renders ValidationErrors always', () => {
    mockStoreState.validatedData = null;
    mockStoreState.isValid = false;
    renderWithMantine(<ViewerPanel />);
    expect(screen.getByTestId('validation-errors')).toBeTruthy();
  });

  it('does not render EndpointList when isValid is false', () => {
    mockStoreState.validatedData = null;
    mockStoreState.isValid = false;
    renderWithMantine(<ViewerPanel />);
    expect(screen.queryByTestId('endpoint-list')).toBeNull();
  });

  it('renders EndpointList with schema when isValid is true', () => {
    const fakeSchema = {
      openapi: '3.0.0',
      info: { title: 'T', version: '1' },
      paths: {},
    } as OpenAPI.Document;
    mockStoreState.validatedData = fakeSchema;
    mockStoreState.isValid = true;
    renderWithMantine(<ViewerPanel />);
    expect(screen.getByTestId('endpoint-list')).toBeTruthy();
  });
});
