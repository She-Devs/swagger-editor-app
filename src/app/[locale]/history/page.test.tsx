import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
 
const mockGetClaims = vi.fn();
const mockLimit = vi.fn();
const mockOrder = vi.fn(() => ({ limit: mockLimit }));
const mockSelect = vi.fn(() => ({ order: mockOrder }));
const mockFrom = vi.fn(() => ({ select: mockSelect }));
 
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: { getClaims: mockGetClaims },
    from: mockFrom,
  })),
}));
 
const mockRedirect = vi.fn((path: string) => {
  throw new Error(`REDIRECT:${path}`);
});
 
vi.mock('next/navigation', () => ({
  redirect: (path: string) => mockRedirect(path),
}));
 
vi.mock('@/i18n/navigation', () => ({
  Link: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));
 
const translations: Record<string, string> = {
  title: 'Request History & Analytics',
  empty: 'You haven\'t executed any requests yet',
  emptyHint: 'Use the editor and viewer to make API requests.',
  goToEditor: 'Go to Editor',
  method: 'Method',
  url: 'URL / Endpoint',
  status: 'Status',
  timestamp: 'Timestamp',
  details: 'Details',
  duration: 'Duration',
  requestSize: 'Request size',
  responseSize: 'Response size',
  error: 'Error',
};
 
vi.mock('next-intl/server', () => ({
  getTranslations: vi.fn(async () => (key: string) => translations[key] ?? key),
}));
 
vi.mock('@/components/HistoryList/HistoryList', () => ({
  HistoryList: ({ history }: { history: unknown[] }) => (
    <div data-testid="history-list" data-count={history.length} />
  ),
}));
 
import HistoryPage from './page';
 
function renderWithMantine(ui: React.ReactElement) {
  return render(<MantineProvider>{ui}</MantineProvider>);
}
 
describe('HistoryPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRedirect.mockImplementation((path: string) => {
      throw new Error(`REDIRECT:${path}`);
    });
  });
 
  it('redirects when there is no authenticated user', async () => {
    mockGetClaims.mockResolvedValue({ data: null });
 
    await expect(
      HistoryPage({ params: Promise.resolve({ locale: 'en' }) })
    ).rejects.toThrow('REDIRECT:/en');
 
    expect(mockRedirect).toHaveBeenCalledWith('/en');
  });
 
  it('throws when supabase returns an error', async () => {
    mockGetClaims.mockResolvedValue({ data: { claims: { sub: '123' } } });
    mockLimit.mockResolvedValue({ data: null, error: { message: 'DB error' } });
 
    await expect(
      HistoryPage({ params: Promise.resolve({ locale: 'en' }) })
    ).rejects.toThrow('DB error');
  });
 
  it('renders empty state when history is empty', async () => {
    mockGetClaims.mockResolvedValue({ data: { claims: { sub: '123' } } });
    mockLimit.mockResolvedValue({ data: [], error: null });
 
    const jsx = await HistoryPage({ params: Promise.resolve({ locale: 'en' }) });
    renderWithMantine(jsx);
 
    expect(screen.getByText('You haven\'t executed any requests yet')).toBeTruthy();
    expect(screen.getByText('Go to Editor')).toBeTruthy();
    expect(screen.queryByTestId('history-list')).toBeNull();
  });
 
  it('renders HistoryList when history has records', async () => {
    mockGetClaims.mockResolvedValue({ data: { claims: { sub: '123' } } });
    mockLimit.mockResolvedValue({
      data: [{ id: '1' }, { id: '2' }],
      error: null,
    });
 
    const jsx = await HistoryPage({ params: Promise.resolve({ locale: 'en' }) });
    renderWithMantine(jsx);
 
    const list = screen.getByTestId('history-list');
    expect(list).toHaveAttribute('data-count', '2');
    expect(screen.queryByText('You haven\'t executed any requests yet')).toBeNull();
  });
});
