import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockCreateServerClient = vi.fn();

vi.mock('@supabase/ssr', () => ({
  createServerClient: mockCreateServerClient,
}));

const mockCookieStore = {
  getAll: vi.fn(() => [{ name: 'sb', value: 'token' }]),
  set: vi.fn(),
};

vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => mockCookieStore),
}));

describe('supabase server client', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('throws when env vars are missing', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', '');
    const { createClient } = await import('./server');
    await expect(createClient()).rejects.toThrow(
      'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'
    );
    vi.unstubAllEnvs();
  });

  it('calls createServerClient with url, key and cookie helpers', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', 'test-key');
    const fakeClient = { auth: {} };
    mockCreateServerClient.mockReturnValue(fakeClient);

    const { createClient } = await import('./server');
    const result = await createClient();

    expect(mockCreateServerClient).toHaveBeenCalledWith(
      'https://test.supabase.co',
      'test-key',
      expect.objectContaining({ cookies: expect.any(Object) })
    );
    expect(result).toBe(fakeClient);
    vi.unstubAllEnvs();
  });

  it('getAll returns cookies from cookieStore', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', 'test-key');
    mockCreateServerClient.mockImplementation((_url, _key, opts) => {
      opts.cookies.getAll();
      return {};
    });

    const { createClient } = await import('./server');
    await createClient();
    expect(mockCookieStore.getAll).toHaveBeenCalled();
    vi.unstubAllEnvs();
  });

  it('setAll sets cookies on cookieStore and silently ignores errors', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', 'test-key');
    mockCreateServerClient.mockImplementation((_url, _key, opts) => {
      opts.cookies.setAll([{ name: 'tok', value: 'val', options: {} }]);
      return {};
    });

    const { createClient } = await import('./server');
    await createClient();
    expect(mockCookieStore.set).toHaveBeenCalledWith('tok', 'val', {});
    vi.unstubAllEnvs();
  });

  it('setAll silently ignores errors thrown by cookieStore.set', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', 'test-key');
    mockCookieStore.set.mockImplementation(() => {
      throw new Error('read only');
    });
    mockCreateServerClient.mockImplementation((_url, _key, opts) => {
      // should not throw
      opts.cookies.setAll([{ name: 'tok', value: 'val', options: {} }]);
      return {};
    });

    const { createClient } = await import('./server');
    await expect(createClient()).resolves.toBeDefined();
    vi.unstubAllEnvs();
  });
});
