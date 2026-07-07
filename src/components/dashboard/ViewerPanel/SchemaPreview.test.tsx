import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { SchemaPreview } from './SchemaPreview';

function renderWithMantine(ui: React.ReactElement) {
  return render(<MantineProvider>{ui}</MantineProvider>);
}

describe('SchemaPreview', () => {
  it('renders — when schema is undefined', () => {
    renderWithMantine(<SchemaPreview schema={undefined} />);
    expect(screen.getByText('—')).toBeTruthy();
  });

  it('renders JSON.stringify output when schema is provided', () => {
    const schema = { type: 'object', properties: { id: { type: 'string' } } };
    renderWithMantine(<SchemaPreview schema={schema} />);
    expect(screen.getByText(/"type": "object"/, { exact: false })).toBeTruthy();
  });
});
