import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { HistoryList, type HistoryTranslations } from './HistoryList';

function renderWithMantine(ui: React.ReactElement) {
  return render(<MantineProvider>{ui}</MantineProvider>);
}

const t: HistoryTranslations = {
  method: 'Method',
  url: 'URL',
  status: 'Status',
  timestamp: 'Timestamp',
  details: 'Details',
  duration: 'Duration',
  requestSize: 'Request size',
  responseSize: 'Response size',
  error: 'Error',
};

const baseRecord = {
  id: '1',
  duration_ms: 120,
  status_code: 200,
  created_at: '2026-07-12T11:57:57.000Z',
  method: 'get',
  request_size: 100,
  response_size: 200,
  error_details: null,
  url: 'https://api.example.com/users',
};

describe('HistoryList', () => {
  it('renders table headers', () => {
    renderWithMantine(<HistoryList history={[]} t={t} />);
    expect(screen.getByText('Method')).toBeTruthy();
    expect(screen.getByText('URL')).toBeTruthy();
    expect(screen.getByText('Status')).toBeTruthy();
    expect(screen.getByText('Timestamp')).toBeTruthy();
  });

  it('renders no rows for empty history', () => {
    renderWithMantine(<HistoryList history={[]} t={t} />);
    expect(screen.queryByLabelText('Details')).toBeNull();
  });

  it('renders teal badge for status_code < 300', () => {
    renderWithMantine(<HistoryList history={[{ ...baseRecord, status_code: 200 }]} t={t} />);
    expect(screen.getByText('200')).toBeTruthy();
  });

  it('renders yellow badge for status_code between 300 and 400', () => {
    renderWithMantine(<HistoryList history={[{ ...baseRecord, status_code: 301 }]} t={t} />);
    expect(screen.getByText('301')).toBeTruthy();
  });

  it('renders red badge for status_code >= 400', () => {
    renderWithMantine(<HistoryList history={[{ ...baseRecord, status_code: 404 }]} t={t} />);
    expect(screen.getByText('404')).toBeTruthy();
  });

  it('renders a dash badge when status_code is null', () => {
    renderWithMantine(<HistoryList history={[{ ...baseRecord, status_code: null }]} t={t} />);
    expect(screen.getByText('—')).toBeTruthy();
  });

  it('falls back to gray badge color for a method not in METHOD_COLORS', () => {
    renderWithMantine(<HistoryList history={[{ ...baseRecord, method: 'CONNECT' }]} t={t} />);
    expect(screen.getByText('CONNECT')).toBeTruthy();
  });

  it('shows error_details after opening the row', () => {
    renderWithMantine(
      <HistoryList
        history={[{ ...baseRecord, error_details: 'Something went wrong' }]}
        t={t}
      />
    );
    fireEvent.click(screen.getByText(baseRecord.url));
    expect(screen.getByText(/Something went wrong/)).toBeTruthy();
  });

  it('does not show error text when error_details is null', () => {
    renderWithMantine(<HistoryList history={[baseRecord]} t={t} />);
    fireEvent.click(screen.getByText(baseRecord.url));
    expect(screen.queryByText(/Error:/)).toBeNull();
  });

  it('toggles a row open and closed on click', () => {
    renderWithMantine(<HistoryList history={[baseRecord]} t={t} />);

    const detailsButton = screen.getByLabelText('Details');
    expect(detailsButton).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(screen.getByText(baseRecord.url));
    expect(screen.getByLabelText('Details')).toHaveAttribute('aria-expanded', 'true');

    fireEvent.click(screen.getByText(baseRecord.url));
    expect(screen.getByLabelText('Details')).toHaveAttribute('aria-expanded', 'false');
  });

  it('keeps only one row open at a time', () => {
    const second = { ...baseRecord, id: '2', url: 'https://api.example.com/products' };
    renderWithMantine(<HistoryList history={[baseRecord, second]} t={t} />);

    fireEvent.click(screen.getByText(baseRecord.url));
    let buttons = screen.getAllByLabelText('Details');
    expect(buttons[0]).toHaveAttribute('aria-expanded', 'true');
    expect(buttons[1]).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(screen.getByText(second.url));
    buttons = screen.getAllByLabelText('Details');
    expect(buttons[0]).toHaveAttribute('aria-expanded', 'false');
    expect(buttons[1]).toHaveAttribute('aria-expanded', 'true');
  });
});
