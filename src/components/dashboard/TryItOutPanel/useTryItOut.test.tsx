import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTryItOut } from './useTryItOut';
import type { OAOperation } from '../ViewerPanel/types';

vi.mock('@/store/useEditorStore', () => ({
  useEditorStore: (selector: (state: { validatedData: unknown }) => unknown) =>
    selector({ validatedData: { servers: [{ url: 'https://example.com' }] } }),
}));

vi.mock('./utils', () => ({
  getServerUrl: () => 'https://example.com',
  getInitialBodyText: () => '{}',
  buildRequestUrl: (path: string) => `https://example.com${path}`,
  buildRequest: ({ url, method, headers, body }: { url: string; method: string; headers: Record<string, string>; body: string }) => ({ 
    url, 
    method, 
    headers, 
    body 
  }),
  buildCurl: () => 'curl -X GET https://example.com',
}));

const fetchMock = vi.fn();
global.fetch = fetchMock;

const mockOperation: OAOperation = {
  parameters: [
    { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
    { name: 'apiKey', in: 'header', required: false, schema: { type: 'string' } },
  ],
  requestBody: {
    content: { 'application/json': {} },
  },
  responses: {},
};

describe('useTryItOut', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with correctly grouped parameters and default values', () => {
    const { result } = renderHook(() =>
      useTryItOut({ method: 'GET', path: '/users/{id}', operation: mockOperation })
    );

    expect(result.current.grouped.path).toHaveLength(1);
    expect(result.current.grouped.header).toHaveLength(1);
    expect(result.current.grouped.query).toHaveLength(0);
    expect(result.current.body).toBe('{}');
    expect(result.current.loading).toBe(false);
  });

  it('should fail validation and set errors if required fields are missing', async () => {
    const { result } = renderHook(() =>
      useTryItOut({ method: 'GET', path: '/users/{id}', operation: mockOperation })
    );

    await act(async () => {
      await result.current.handleExecute();
    });

    expect(result.current.validationErrors['path_id']).toBe('This field is required');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('should clear validation error when field is updated with value', () => {
    const { result } = renderHook(() =>
      useTryItOut({ method: 'GET', path: '/users/{id}', operation: mockOperation })
    );

    act(() => {
      result.current.handleExecute();
    });
    expect(result.current.validationErrors['path_id']).toBeTruthy();

    act(() => {
      result.current.updateValue('path', 'id', '123');
    });

    expect(result.current.values['path_id']).toBe('123');
    expect(result.current.validationErrors['path_id']).toBeUndefined();
  });

  it('should execute successfully and fetch proxy API when valid', async () => {
    fetchMock.mockResolvedValueOnce({
      json: async () => ({ status: 'success', data: { id: '123' } }),
    });

    const { result } = renderHook(() =>
      useTryItOut({ method: 'GET', path: '/users/{id}', operation: mockOperation })
    );

    act(() => {
      result.current.updateValue('path', 'id', '123');
    });

    await act(async () => {
      await result.current.handleExecute();
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.requestUrl).toBe('https://example.com/users/{id}');
    expect(result.current.response).toEqual({ status: 'success', data: { id: '123' } });
    expect(fetchMock).toHaveBeenCalledWith('/api/proxy', expect.any(Object));
  });

  it('should handle custom error message when URL generation fails', async () => {
    const utils = await import('./utils');
    vi.spyOn(utils, 'buildRequestUrl').mockImplementationOnce(() => {
      throw new Error('Invalid URL');
    });

    const { result } = renderHook(() =>
      useTryItOut({ method: 'GET', path: '/users/{id}', operation: mockOperation })
    );

    act(() => {
      result.current.updateValue('path', 'id', '123');
    });

    await act(async () => {
      await result.current.handleExecute();
    });

    expect(result.current.errorOutput).toContain('Invalid Request URL. Please make sure a valid Base Server URL');
  });

  it('should handle generic network errors in handleExecute', async () => {
    fetchMock.mockRejectedValueOnce(new Error('Network Error'));

    const { result } = renderHook(() =>
      useTryItOut({ method: 'GET', path: '/users/{id}', operation: mockOperation })
    );

    act(() => {
      result.current.updateValue('path', 'id', '123');
    });

    await act(async () => {
      await result.current.handleExecute();
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.errorOutput).toBe('Network Error');
  });

  it('should handle non-Error exceptions in handleExecute', async () => {
    fetchMock.mockRejectedValueOnce('Unexpected crash');

    const { result } = renderHook(() =>
      useTryItOut({ method: 'GET', path: '/users/{id}', operation: mockOperation })
    );

    act(() => {
      result.current.updateValue('path', 'id', '123');
    });

    await act(async () => {
      await result.current.handleExecute();
    });

    expect(result.current.errorOutput).toBe('Request failed');
  });

  it('should generate curl command when handleGenerateCurl is called', () => {
    const { result } = renderHook(() =>
      useTryItOut({ method: 'GET', path: '/users/{id}', operation: mockOperation })
    );

    act(() => {
      result.current.updateValue('path', 'id', '123');
    });

    act(() => {
      result.current.handleGenerateCurl();
    });

    expect(result.current.curl).toBe('curl -X GET https://example.com');
  });

  it('should handle errors during cURL generation', async () => {
    const utils = await import('./utils');
    vi.spyOn(utils, 'buildCurl').mockImplementationOnce(() => {
      throw new Error('cURL generation failed');
    });

    const { result } = renderHook(() =>
      useTryItOut({ method: 'GET', path: '/users/{id}', operation: mockOperation })
    );

    act(() => {
      result.current.updateValue('path', 'id', '123');
    });

    act(() => {
      result.current.handleGenerateCurl();
    });

    expect(result.current.errorOutput).toBe('cURL generation failed');
  });

  it('should clear request and reset state when clearRequest is called', () => {
    const { result } = renderHook(() =>
      useTryItOut({ method: 'GET', path: '/users/{id}', operation: mockOperation })
    );

    act(() => {
      result.current.updateValue('path', 'id', '123');
    });

    act(() => {
      result.current.clearRequest();
    });

    expect(result.current.values).toEqual({});
    expect(result.current.validationErrors).toEqual({});
    expect(result.current.response).toBeNull();
  });
});
