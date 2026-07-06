import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { ResponsesSection } from './ResponsesSection';
import type { OAResponse } from './types';

function renderWithMantine(ui: React.ReactElement) {
  return render(<MantineProvider>{ui}</MantineProvider>);
}

describe('ResponsesSection', () => {
  it('renders 200 status code', () => {
    const responses: Record<string, OAResponse> = { '200': { description: 'OK' } };
    renderWithMantine(<ResponsesSection responses={responses} />);
    expect(screen.getByText('200')).toBeTruthy();
    expect(screen.getByText('OK')).toBeTruthy();
  });

  it('renders 3xx status code (yellow color branch)', () => {
    const responses: Record<string, OAResponse> = { '301': { description: 'Redirect' } };
    renderWithMantine(<ResponsesSection responses={responses} />);
    expect(screen.getByText('301')).toBeTruthy();
    expect(screen.getByText('Redirect')).toBeTruthy();
  });

  it('renders 4xx status code (red color branch)', () => {
    const responses: Record<string, OAResponse> = { '404': { description: 'Not found' } };
    renderWithMantine(<ResponsesSection responses={responses} />);
    expect(screen.getByText('404')).toBeTruthy();
    expect(screen.getByText('Not found')).toBeTruthy();
  });

  it('renders content types with schema preview', () => {
    const responses: Record<string, OAResponse> = {
      '200': {
        description: 'OK',
        content: {
          'application/json': { schema: { type: 'object' } },
        },
      },
    };
    renderWithMantine(<ResponsesSection responses={responses} />);
    expect(screen.getByText('application/json')).toBeTruthy();
    expect(screen.getByText(/"type": "object"/, { exact: false })).toBeTruthy();
  });

  it('renders — when response content has no schema', () => {
    const responses: Record<string, OAResponse> = {
      '200': {
        description: 'OK',
        content: { 'application/json': {} },
      },
    };
    renderWithMantine(<ResponsesSection responses={responses} />);
    expect(screen.getByText('—')).toBeTruthy();
  });

  it('renders empty description gracefully when absent', () => {
    const responses: Record<string, OAResponse> = { '200': {} };
    renderWithMantine(<ResponsesSection responses={responses} />);
    expect(screen.getByText('200')).toBeTruthy();
  });
});
