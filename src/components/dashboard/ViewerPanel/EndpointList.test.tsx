import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { NextIntlClientProvider } from 'next-intl';
import { EndpointList } from './EndpointList';
import { OpenAPI } from 'openapi-types';

const messages = {
  Viewer: {
    noEndpoints: 'No endpoints found',
    endpointsTitle: 'Endpoints ({count})',
    path: 'Path',
    methodCount: '{count, plural, one {# method} other {# methods}}',
  },
};

function renderWithMantine(ui: React.ReactElement) {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <MantineProvider>{ui}</MantineProvider>
    </NextIntlClientProvider>
  );
}

describe('EndpointList', () => {
  it('renders "No endpoints found" when schema is null', () => {
    renderWithMantine(<EndpointList schema={null} />);
    expect(screen.getByText('No endpoints found')).toBeTruthy();
  });

  it('renders "No endpoints found" when schema has no paths', () => {
    const schema: OpenAPI.Document = {
      openapi: '3.0.0',
      info: { title: 'T', version: '1' },
      paths: {},
    };
    renderWithMantine(<EndpointList schema={schema} />);
    expect(screen.getByText('No endpoints found')).toBeTruthy();
  });

  it('renders endpoint count in title', () => {
    const schema: OpenAPI.Document = {
      openapi: '3.0.0',
      info: { title: 'T', version: '1' },
      paths: {
        '/users': { get: { responses: {} }, post: { responses: {} } },
      },
    };
    renderWithMantine(<EndpointList schema={schema} />);
    expect(screen.getByText(/Endpoints \(2\)/)).toBeTruthy();
  });

  it('renders paths sorted alphabetically', () => {
    const schema: OpenAPI.Document = {
      openapi: '3.0.0',
      info: { title: 'T', version: '1' },
      paths: {
        '/z': { get: { responses: {} } },
        '/a': { get: { responses: {} } },
      },
    };
    renderWithMantine(<EndpointList schema={schema} />);
    const pathCodes = screen.getAllByText(/^\//);
    expect(pathCodes[0].textContent).toBe('/a');
  });

  it('shows plural "methods" badge when multiple methods on path', () => {
    const schema: OpenAPI.Document = {
      openapi: '3.0.0',
      info: { title: 'T', version: '1' },
      paths: { '/test': { get: { responses: {} }, post: { responses: {} } } },
    };
    renderWithMantine(<EndpointList schema={schema} />);
    expect(screen.getByText('2 methods')).toBeTruthy();
  });

  it('shows singular "method" badge when one method', () => {
    const schema: OpenAPI.Document = {
      openapi: '3.0.0',
      info: { title: 'T', version: '1' },
      paths: { '/test': { get: { responses: {} } } },
    };
    renderWithMantine(<EndpointList schema={schema} />);
    expect(screen.getByText('1 method')).toBeTruthy();
  });

  it('returns null (skips) for paths with no recognized HTTP methods', () => {
    const schema = {
      openapi: '3.0.0',
      info: { title: 'T', version: '1' },
      paths: { '/empty': { $ref: '#/components/schemas/Foo' } },
    } as unknown as OpenAPI.Document;
    renderWithMantine(<EndpointList schema={schema} />);
    expect(screen.getByText(/Endpoints \(0\)/)).toBeTruthy();
  });

  it('renders method badges for each endpoint', () => {
    const schema: OpenAPI.Document = {
      openapi: '3.0.0',
      info: { title: 'T', version: '1' },
      paths: { '/test': { get: { responses: {} }, post: { responses: {} } } },
    };
    renderWithMantine(<EndpointList schema={schema} />);
    expect(screen.getAllByText(/^get$/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/^post$/i).length).toBeGreaterThan(0);
  });
});
