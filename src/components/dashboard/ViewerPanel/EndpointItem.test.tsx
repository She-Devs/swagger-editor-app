import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { NextIntlClientProvider } from 'next-intl';
import { EndpointItem } from './EndpointItem';
import type { OAOperation } from './types';

const messages = {
  Viewer: {
    parameters: 'Parameters',
    requestBody: 'Request Body',
    required: 'required',
    responses: 'Responses',
    none: 'None',
    name: 'Name',
    requiredColumn: 'Required',
    type: 'Type',
    description: 'Description',
    yes: 'yes',
    no: 'no',
  },
};

vi.mock('./SchemaPreview', () => ({
  SchemaPreview: ({ schema }: { schema: unknown }) => (
    <pre data-testid="schema-preview">{JSON.stringify(schema)}</pre>
  ),
}));

function renderWithMantine(ui: React.ReactElement) {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <MantineProvider>{ui}</MantineProvider>
    </NextIntlClientProvider>
  );
}

const fullOperation: OAOperation = {
  summary: 'Get user',
  description: 'Returns a single user',
  parameters: [
    { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
    { name: 'token', in: 'header', required: true, schema: { type: 'string' } },
  ],
  requestBody: {
    required: true,
    description: 'Payload',
    content: { 'application/json': { schema: { type: 'object' } } },
  },
  responses: {
    '200': { description: 'OK' },
  },
};

describe('EndpointItem', () => {
  it('renders method badge and path when collapsed', () => {
    renderWithMantine(<EndpointItem method="get" path="/users/{id}" operation={fullOperation} />);
    expect(screen.getByText('get')).toBeTruthy();
    expect(screen.getByText('/users/{id}')).toBeTruthy();
  });

  it('renders summary when provided', () => {
    renderWithMantine(<EndpointItem method="get" path="/users/{id}" operation={fullOperation} />);
    expect(screen.getByText('Get user')).toBeTruthy();
  });

  it('does not render summary when absent', () => {
    renderWithMantine(<EndpointItem method="get" path="/test" operation={{ responses: {} }} />);
    expect(screen.queryByText('Get user')).toBeNull();
  });

  it('expands on click showing description and accordion', () => {
    renderWithMantine(<EndpointItem method="get" path="/users/{id}" operation={fullOperation} />);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByText('Returns a single user')).toBeTruthy();

    expect(screen.getAllByText('path').length).toBeGreaterThan(0);
    expect(screen.getByText('header')).toBeTruthy();
    expect(screen.getByText('query')).toBeTruthy();
    expect(screen.getByText('cookie')).toBeTruthy();
  });

  it('collapses on second click', () => {
    renderWithMantine(<EndpointItem method="get" path="/users/{id}" operation={fullOperation} />);
    const btn = screen.getByRole('button');
    fireEvent.click(btn);
    expect(screen.getByText('Returns a single user')).toBeTruthy();
    fireEvent.click(btn);
    expect(screen.queryByText('Returns a single user')).toBeNull();
  });

  it('does not show description when absent', () => {
    renderWithMantine(<EndpointItem method="get" path="/test" operation={{ responses: {} }} />);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.queryByText('Returns a single user')).toBeNull();
  });

  it('shows request body with required badge', () => {
    renderWithMantine(<EndpointItem method="post" path="/test" operation={fullOperation} />);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByRole('button', { name: /request body/i })).toBeTruthy();
    expect(screen.getByText('required')).toBeTruthy();
  });

  it('shows request body without required badge when not required', () => {
    const op: OAOperation = {
      requestBody: { content: { 'application/json': {} } },
      responses: {},
    };
    renderWithMantine(<EndpointItem method="post" path="/test" operation={op} />);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByRole('button', { name: /request body/i })).toBeTruthy();
    expect(screen.queryByText('required')).toBeNull();
  });

  it('shows request body description when present', () => {
    renderWithMantine(<EndpointItem method="post" path="/test" operation={fullOperation} />);
    fireEvent.click(screen.getByRole('button'));
    const rbBtn = screen.getByRole('button', { name: /request body/i });
    fireEvent.click(rbBtn);
    expect(screen.getByText('Payload')).toBeTruthy();
  });

  it('shows request body without description when absent', () => {
    const op: OAOperation = {
      requestBody: { content: { 'application/json': {} } },
      responses: {},
    };
    renderWithMantine(<EndpointItem method="post" path="/test" operation={op} />);
    fireEvent.click(screen.getByRole('button'));
    const rbBtn = screen.getByRole('button', { name: /request body/i });
    fireEvent.click(rbBtn);
    expect(screen.queryByText('Payload')).toBeNull();
  });

  it('shows responses section when responses exist', () => {
    renderWithMantine(<EndpointItem method="get" path="/test" operation={fullOperation} />);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByRole('button', { name: /responses/i })).toBeTruthy();
  });

  it('does not show responses section when responses is empty', () => {
    renderWithMantine(<EndpointItem method="get" path="/test" operation={{ responses: {} }} />);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.queryByRole('button', { name: /responses/i })).toBeNull();
  });

  it('uses fallback gray color for method not in METHOD_COLORS', () => {
    renderWithMantine(<EndpointItem method="unknown" path="/test" operation={{ responses: {} }} />);
    expect(screen.getByText('unknown')).toBeTruthy();
  });

  it('shows request body examples when present', () => {
    const op: OAOperation = {
      requestBody: {
        content: {
          'application/json': {
            schema: { type: 'object' },
            examples: {
              SamplePayload: { value: { username: 'alice' } },
            },
          },
        },
      },
      responses: {},
    };
    renderWithMantine(<EndpointItem method="post" path="/test" operation={op} />);
    fireEvent.click(screen.getByRole('button'));
    const rbBtn = screen.getByRole('button', { name: /request body/i });
    fireEvent.click(rbBtn);
    expect(screen.getByText('SamplePayload')).toBeTruthy();

    const previews = screen.getAllByTestId('schema-preview');
    const matchFound = previews.some((p) => p.textContent?.includes('username'));
    expect(matchFound).toBe(true);
  });
});
