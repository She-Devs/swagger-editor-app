import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { NextIntlClientProvider } from 'next-intl';
import { ParametersTable } from './ParametersTable';
import type { OAParameter } from './types';

const messages = {
  Viewer: {
    none: 'None',
    name: 'Name',
    requiredColumn: 'Required',
    type: 'Type',
    description: 'Description',
    required: 'required',
    yes: 'yes',
    no: 'no',
  },
};

function renderWithMantine(ui: React.ReactElement) {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <MantineProvider>{ui}</MantineProvider>
    </NextIntlClientProvider>
  );
}

const params: OAParameter[] = [
  { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'User ID' },
  { name: 'limit', in: 'query', schema: { type: 'integer' }, description: 'Max results' },
  { name: 'noType', in: 'query' },
];

describe('ParametersTable', () => {
  it('renders None when no parameters match filterIn', () => {
    renderWithMantine(<ParametersTable parameters={params} filterIn="header" />);
    expect(screen.getByText('None')).toBeTruthy();
  });

  it('renders row with required badge for required param', () => {
    renderWithMantine(<ParametersTable parameters={params} filterIn="path" />);
    expect(screen.getByText('id')).toBeTruthy();
    expect(screen.getByText('yes')).toBeTruthy();
    expect(screen.getByText('string')).toBeTruthy();
    expect(screen.getByText('User ID')).toBeTruthy();
  });

  it('renders "no" for non-required param', () => {
    renderWithMantine(<ParametersTable parameters={params} filterIn="query" />);
    expect(screen.getByText('limit')).toBeTruthy();
    expect(screen.getAllByText('no').length).toBeGreaterThan(0);
    expect(screen.getByText('integer')).toBeTruthy();
    expect(screen.getByText('Max results')).toBeTruthy();
  });

  it('renders — for type when schema has no type', () => {
    renderWithMantine(<ParametersTable parameters={params} filterIn="query" />);
    expect(screen.getAllByText('—').length).toBeGreaterThan(0);
  });

  it('renders — for description when description is absent', () => {
    renderWithMantine(<ParametersTable parameters={params} filterIn="query" />);
    expect(screen.getAllByText('—').length).toBeGreaterThan(0);
  });
});
