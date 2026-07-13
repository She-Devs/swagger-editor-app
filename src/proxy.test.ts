import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockIntlMiddleware = vi.fn();
vi.mock('next-intl/middleware', () => ({
  default: vi.fn(() => mockIntlMiddleware),
}));

vi.mock('./i18n/routing', () => ({
  routing: { locales: ['en', 'ru'], defaultLocale: 'en' },
}));

function makeCookieStore(initial: Record<string, string> = {}) {
  const store: Record<string, string> = { ...initial };
  return {
    getAll: vi.fn(() =>
      Object.entries(store).map(([name, value]) => ({ name, value }))
    ),
    set: vi.fn((nameOrObj: string | { name: string; value: string }, value?: string) => {
      if (typeof nameOrObj === 'object') {
        store[nameOrObj.name] = nameOrObj.value;
      } else if (value !== undefined) {
        store[nameOrObj] = value;
      }
    }),
  };
}

function makeResponse(status = 200) {
  const cookies = makeCookieStore();
  const headers = { set: vi.fn() };
  return { status, cookies, headers };
}

const mockNextResponseNext = vi.fn();
const mockNextResponseRedirect = vi.fn();

vi.mock('next/server', () => ({
  NextResponse: {
    next: mockNextResponseNext,
    redirect: mockNextResponseRedirect,
  },
}));

type CookieCallbacks = {
  getAll: () => { name: string; value: string }[];
  setAll: (cookies: { name: string; value: string; options?: Record<string, unknown> }[], headers: Record<string, string>) => void;
};
let capturedCookieCallbacks: CookieCallbacks | null = null;
const mockGetClaims = vi.fn();

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn((_url, _key, opts) => {
    capturedCookieCallbacks = opts.cookies;
    return { auth: { getClaims: mockGetClaims } };
  }),
}));

function makeRequest(pathname: string) {
  const requestCookies = makeCookieStore();
  const urlObj = {
    pathname,
    clone() {
      return this;
    },
  };
  return {
    nextUrl: urlObj,
    cookies: requestCookies,
  } as unknown as import('next/server').NextRequest;
}

describe('proxy middleware', () => {
  let proxy: (req: import('next/server').NextRequest) => Promise<unknown>;
  let supabaseResponse: ReturnType<typeof makeResponse>;
  let intlResponse: ReturnType<typeof makeResponse>;

  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();
    capturedCookieCallbacks = null;

    supabaseResponse = makeResponse(200);
    intlResponse = makeResponse(200);

    mockNextResponseNext.mockReturnValue(supabaseResponse);
    mockNextResponseRedirect.mockImplementation(() => makeResponse(302));
    mockIntlMiddleware.mockReturnValue(intlResponse);

    const mod = await import('./proxy');
    proxy = mod.default;
  });

  it('returns intl response for unauthenticated non-protected routes', async () => {
    mockGetClaims.mockResolvedValue({ data: { claims: null } });
    const req = makeRequest('/en/about');
    (supabaseResponse.cookies.getAll as ReturnType<typeof vi.fn>).mockReturnValue([]);
    const result = await proxy(req);
    expect(result).toBe(intlResponse);
  });

  it('redirects unauthenticated user from /history to root', async () => {
    mockGetClaims.mockResolvedValue({ data: { claims: null } });
    const redirectResp = makeResponse(302);
    mockNextResponseRedirect.mockReturnValue(redirectResp);
    (supabaseResponse.cookies.getAll as ReturnType<typeof vi.fn>).mockReturnValue([
      { name: 'sb', value: 'tok' },
    ]);

    const req = makeRequest('/en/history');
    const result = await proxy(req);
    
    const redirectArg = mockNextResponseRedirect.mock.calls[0][0];
    expect(redirectArg.pathname).toBe('/en/');
    expect(mockNextResponseRedirect).toHaveBeenCalled();
    expect(result).toBe(redirectResp);
    expect(redirectResp.cookies.set).toHaveBeenCalledWith({ name: 'sb', value: 'tok' });
  });

  it('redirects unauthenticated user from /history using "ru" locale to root', async () => {
    mockGetClaims.mockResolvedValue({ data: { claims: null } });
    const redirectResp = makeResponse(302);
    mockNextResponseRedirect.mockReturnValue(redirectResp);
    (supabaseResponse.cookies.getAll as ReturnType<typeof vi.fn>).mockReturnValue([]);

    const req = makeRequest('/ru/history');
    const result = await proxy(req);
    const redirectArg = mockNextResponseRedirect.mock.calls[0][0];
    expect(redirectArg.pathname).toBe('/ru/');
    expect(result).toBe(redirectResp);
  });

  it('redirects authenticated user from /sign-in to /', async () => {
    mockGetClaims.mockResolvedValue({ data: { claims: { sub: 'user-1' } } });
    const redirectResp = makeResponse(302);
    mockNextResponseRedirect.mockReturnValue(redirectResp);
    (supabaseResponse.cookies.getAll as ReturnType<typeof vi.fn>).mockReturnValue([
      { name: 'session', value: 'xyz' },
    ]);

    const req = makeRequest('/en/sign-in');
    const result = await proxy(req);
    expect(mockNextResponseRedirect).toHaveBeenCalled();
    expect(result).toBe(redirectResp);
    expect(redirectResp.cookies.set).toHaveBeenCalledWith({ name: 'session', value: 'xyz' });
  });

  it('redirects unauthenticated user from /history using "ru" locale', async () => {
    mockGetClaims.mockResolvedValue({ data: { claims: null } });
    const redirectResp = makeResponse(302);
    mockNextResponseRedirect.mockReturnValue(redirectResp);
    (supabaseResponse.cookies.getAll as ReturnType<typeof vi.fn>).mockReturnValue([]);

    const req = makeRequest('/ru/history');
    const result = await proxy(req);
    
    expect(mockNextResponseRedirect).toHaveBeenCalledWith(
      expect.objectContaining({ pathname: '/ru/' })
    );
    expect(result).toBe(redirectResp);
  });

  it('returns supabaseResponse directly when its status is a redirect (3xx)', async () => {
    mockGetClaims.mockResolvedValue({ data: { claims: null } });
    const redirectResp = makeResponse(302);
    mockNextResponseNext.mockReturnValue(redirectResp);
    (redirectResp.cookies.getAll as ReturnType<typeof vi.fn>).mockReturnValue([]);
    mockNextResponseRedirect.mockReturnValue(redirectResp);

    const req = makeRequest('/en/history');
    const result = await proxy(req);
    expect(result).toBe(redirectResp);
  });

  it('copies cookies from supabaseResponse to intlResponse', async () => {
    mockGetClaims.mockResolvedValue({ data: { claims: null } });
    (supabaseResponse.cookies.getAll as ReturnType<typeof vi.fn>).mockReturnValue([
      { name: 'sb-token', value: 'abc123' },
    ]);

    const req = makeRequest('/en/about');
    await proxy(req);
    expect(intlResponse.cookies.set).toHaveBeenCalledWith('sb-token', 'abc123', {});
  });

  it('uses "en" locale as fallback for unknown locale segment and redirects to root', async () => {
    mockGetClaims.mockResolvedValue({ data: { claims: null } });
    (supabaseResponse.cookies.getAll as ReturnType<typeof vi.fn>).mockReturnValue([]);

    const req = makeRequest('/history');
    await proxy(req);
    const redirectArg = mockNextResponseRedirect.mock.calls[0][0];
    expect(redirectArg.pathname).toBe('/en/');
  });

  it('supabase cookie getAll delegates to request.cookies.getAll', async () => {
    mockGetClaims.mockResolvedValue({ data: { claims: null } });
    (supabaseResponse.cookies.getAll as ReturnType<typeof vi.fn>).mockReturnValue([]);

    const req = makeRequest('/en/about');
    (req.cookies.getAll as ReturnType<typeof vi.fn>).mockReturnValue([
      { name: 'x', value: '1' },
    ]);

    await proxy(req);
    expect(capturedCookieCallbacks).not.toBeNull();
    const result = capturedCookieCallbacks!.getAll();
    expect(result).toEqual([{ name: 'x', value: '1' }]);
  });

  it('supabase cookie setAll updates request cookies and response cookies', async () => {
    mockGetClaims.mockResolvedValue({ data: { claims: null } });
    (supabaseResponse.cookies.getAll as ReturnType<typeof vi.fn>).mockReturnValue([]);

    const req = makeRequest('/en/about');
    await proxy(req);

    expect(capturedCookieCallbacks).not.toBeNull();

    const newResp = makeResponse(200);
    mockNextResponseNext.mockReturnValue(newResp);

    capturedCookieCallbacks!.setAll(
      [{ name: 'tok', value: 'val', options: { httpOnly: true } }],
      { 'x-custom': 'header-value' }
    );

    expect(req.cookies.set).toHaveBeenCalledWith('tok', 'val');
    expect(newResp.cookies.set).toHaveBeenCalledWith('tok', 'val', { httpOnly: true });
    expect(newResp.headers.set).toHaveBeenCalledWith('x-custom', 'header-value');
  });
});
