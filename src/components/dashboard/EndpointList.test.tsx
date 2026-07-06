import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { EndpointList } from './EndpointList';
import { OpenAPI } from 'openapi-types';

function renderWithMantine(ui: React.ReactElement) {
  return render(<MantineProvider>{ui}</MantineProvider>);
}

const minimalSchema: OpenAPI.Document = {
  openapi: '3.0.0',
  info: { title: 'Test', version: '1.0.0' },
  paths: {
    '/users': {
      get: {
        summary: 'Get users',
        description: 'Returns a list of users',
        parameters: [
          { name: 'limit', in: 'query', description: 'Max results', schema: { type: 'integer' } },
          { name: 'Authorization', in: 'header', required: true, schema: { type: 'string' } },
          { name: 'session', in: 'cookie', schema: { type: 'string' } },
        ],
        responses: {
          '200': { description: 'Success' },
          '301': { description: 'Redirect' },
          '404': { description: 'Not found' },
        },
      },
      post: {
        summary: 'Create user',
        requestBody: {
          required: true,
          description: 'User payload',
          content: {
            'application/json': {
              schema: { type: 'object', properties: { name: { type: 'string' } } },
            },
          },
        },
        responses: {},
      },
    },
    '/users/{id}': {
      get: {
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': {
            description: 'OK',
            content: {
              'application/json': {
                schema: { type: 'object' },
              },
            },
          },
        },
      },
      put: { responses: {} },
      delete: { responses: {} },
      patch: { responses: {} },
      options: { responses: {} },
      head: { responses: {} },
      trace: { responses: {} },
    },
  },
};

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
    renderWithMantine(<EndpointList schema={minimalSchema} />);
    expect(screen.getByText(/Endpoints \(\d+\)/)).toBeTruthy();
  });

  it('renders paths sorted alphabetically', () => {
    renderWithMantine(<EndpointList schema={minimalSchema} />);
    const codes = screen.getAllByText(/^\/users/);
    expect(codes.length).toBeGreaterThan(0);
  });

  it('renders method badges for each endpoint', () => {
    renderWithMantine(<EndpointList schema={minimalSchema} />);
    expect(screen.getAllByText(/^get$/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/^post$/i).length).toBeGreaterThan(0);
  });

  it('shows plural "methods" badge when multiple methods on path', () => {
    renderWithMantine(<EndpointList schema={minimalSchema} />);
    expect(screen.getByText(/2 methods/)).toBeTruthy();
  });

  it('shows singular "method" badge when one method on path is counted via display', () => {
    const schema: OpenAPI.Document = {
      openapi: '3.0.0',
      info: { title: 'T', version: '1' },
      paths: {
        '/single': { get: { responses: {} } },
      },
    };
    renderWithMantine(<EndpointList schema={schema} />);
    expect(screen.getByText('1 method')).toBeTruthy();
  });

  it('returns null for paths that have no recognized HTTP methods', () => {
    const schema = {
      openapi: '3.0.0',
      info: { title: 'T', version: '1' },
      paths: {
        '/empty': { $ref: '#/components/schemas/Foo' },
      },
    } as unknown as OpenAPI.Document;
    renderWithMantine(<EndpointList schema={schema} />);
    expect(screen.getByText(/Endpoints \(0\)/)).toBeTruthy();
  });

  it('shows summary and chevron-right when collapsed', () => {
    renderWithMantine(<EndpointList schema={minimalSchema} />);
    expect(screen.getByText('Get users')).toBeTruthy();
  });

  it('expands endpoint on click and shows description + parameter sections', () => {
    renderWithMantine(<EndpointList schema={minimalSchema} />);
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[0]);
    expect(screen.getByText('Returns a list of users')).toBeTruthy();
    expect(screen.getByText('query')).toBeTruthy();
    expect(screen.getByText('header')).toBeTruthy();
    expect(screen.getByText('cookie')).toBeTruthy();
  });

  it('collapses endpoint on second click', () => {
    renderWithMantine(<EndpointList schema={minimalSchema} />);
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[0]);
    expect(screen.getByText('Returns a list of users')).toBeTruthy();
    fireEvent.click(buttons[0]);
    expect(screen.queryByText('Returns a list of users')).toBeNull();
  });

  it('shows "None" for parameter types with no entries when expanded', () => {
    renderWithMantine(<EndpointList schema={minimalSchema} />);
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[0]);
    const pathAccordion = screen.getByText('path');
    fireEvent.click(pathAccordion.closest('button')!);
    expect(screen.getByText('None')).toBeTruthy();
  });

  it('shows parameter rows with required badge', () => {
    renderWithMantine(<EndpointList schema={minimalSchema} />);
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[0]);
    const headerBtn = screen.getByText('header').closest('button')!;
    fireEvent.click(headerBtn);
    expect(screen.getByText('Authorization')).toBeTruthy();
    expect(screen.getByText('yes')).toBeTruthy();
  });

  it('shows parameter rows with "no" for non-required params', () => {
    renderWithMantine(<EndpointList schema={minimalSchema} />);
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[0]);
    const queryBtn = screen.getByText('query').closest('button')!;
    fireEvent.click(queryBtn);
    expect(screen.getByText('limit')).toBeTruthy();
    expect(screen.getAllByText('no').length).toBeGreaterThan(0);
  });

  it('shows parameter type and description in table', () => {
    renderWithMantine(<EndpointList schema={minimalSchema} />);
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[0]);
    const queryBtn = screen.getByText('query').closest('button')!;
    fireEvent.click(queryBtn);
    expect(screen.getByText('integer')).toBeTruthy();
    expect(screen.getByText('Max results')).toBeTruthy();
  });

  it('shows — for parameter type when schema has no type', () => {
    const schema: OpenAPI.Document = {
      openapi: '3.0.0',
      info: { title: 'T', version: '1' },
      paths: {
        '/test': {
          get: {
            parameters: [{ name: 'foo', in: 'query' }],
            responses: {},
          },
        },
      },
    };
    renderWithMantine(<EndpointList schema={schema} />);
    fireEvent.click(screen.getAllByRole('button')[0]);
    const queryBtn = screen.getByText('query').closest('button')!;
    fireEvent.click(queryBtn);
    expect(screen.getAllByText('—').length).toBeGreaterThan(0);
  });

  it('expands POST and shows request body section', () => {
    renderWithMantine(<EndpointList schema={minimalSchema} />);
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[1]);
    const rbBtn = screen.getByText('Request Body').closest('button')!;
    fireEvent.click(rbBtn);
    expect(screen.getByText('User payload')).toBeTruthy();
    expect(screen.getByText('application/json')).toBeTruthy();
  });

  it('shows required badge on request body when required', () => {
    renderWithMantine(<EndpointList schema={minimalSchema} />);
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[1]);
    expect(screen.getByText('required')).toBeTruthy();
  });

  it('shows request body without required badge when not required', () => {
    const schema: OpenAPI.Document = {
      openapi: '3.0.0',
      info: { title: 'T', version: '1' },
      paths: {
        '/test': {
          post: {
            requestBody: {
              content: { 'application/json': {} },
            },
            responses: {},
          },
        },
      },
    };
    renderWithMantine(<EndpointList schema={schema} />);
    fireEvent.click(screen.getAllByRole('button')[0]);
    const rbBtn = screen.getByText('Request Body').closest('button')!;
    fireEvent.click(rbBtn);
    expect(screen.queryByText('required')).toBeNull();
  });

  it('shows responses with status codes and color variants', () => {
    renderWithMantine(<EndpointList schema={minimalSchema} />);
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[0]);
    const respBtn = screen.getByText('Responses').closest('button')!;
    fireEvent.click(respBtn);
    expect(screen.getByText('200')).toBeTruthy();
    expect(screen.getByText('301')).toBeTruthy();
    expect(screen.getByText('404')).toBeTruthy();
    expect(screen.getByText('Success')).toBeTruthy();
    expect(screen.getByText('Redirect')).toBeTruthy();
    expect(screen.getByText('Not found')).toBeTruthy();
  });

  it('shows response content type and schema preview', () => {
    renderWithMantine(<EndpointList schema={minimalSchema} />);
    const buttons = screen.getAllByRole('button');
    const allGetBtns = buttons.filter((_, i) => i >= 2);
    fireEvent.click(allGetBtns[0]);
    const respBtn = screen.getByText('Responses').closest('button')!;
    fireEvent.click(respBtn);
    expect(screen.getByText('application/json')).toBeTruthy();
  });

  it('renders SchemaPreview with — when schema is undefined', () => {
    const schema: OpenAPI.Document = {
      openapi: '3.0.0',
      info: { title: 'T', version: '1' },
      paths: {
        '/test': {
          get: {
            responses: {
              '200': {
                description: 'OK',
                content: { 'application/json': {} },
              },
            },
          },
        },
      },
    };
    renderWithMantine(<EndpointList schema={schema} />);
    fireEvent.click(screen.getAllByRole('button')[0]);
    const respBtn = screen.getByText('Responses').closest('button')!;
    fireEvent.click(respBtn);
    expect(screen.getByText('—')).toBeTruthy();
  });

  it('handles endpoint with no description (no description text rendered)', () => {
    const schema: OpenAPI.Document = {
      openapi: '3.0.0',
      info: { title: 'T', version: '1' },
      paths: {
        '/test': { get: { responses: {} } },
      },
    };
    renderWithMantine(<EndpointList schema={schema} />);
    fireEvent.click(screen.getAllByRole('button')[0]);
    expect(screen.queryByText('Returns a list of users')).toBeNull();
  });

  it('uses fallback gray color for unknown HTTP method', () => {
    const schema: OpenAPI.Document = {
      openapi: '3.0.0',
      info: { title: 'T', version: '1' },
      paths: {
        '/test': { options: { responses: {} } },
      },
    };
    renderWithMantine(<EndpointList schema={schema} />);
    expect(screen.getByText(/options/i)).toBeTruthy();
  });
});
