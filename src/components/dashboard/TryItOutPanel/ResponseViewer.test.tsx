import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MantineProvider } from '@mantine/core';
import { ResponseViewer } from './ResponseViewer';
import type { ResponseState } from './types';

const renderWithMantine = (ui: React.ReactElement) => {
  return render(<MantineProvider>{ui}</MantineProvider>);
};

vi.mock('next-intl', () => ({
  useTranslations: () => {
    const t = (key: string) => {
      if (key === 'emptyState') {
        return 'Execute a request to see response.';
      }
      return key;
    };
    t.has = () => true;
    return t;
  },
}));

vi.mock('@mantine/code-highlight', () => ({
  CodeHighlight: ({ code, language }: { code: string; language: string }) => (
    <pre data-testid="mock-code" data-lang={language}>
      {code}
    </pre>
  ),
}));

describe('ResponseViewer Component', () => {
  it('should render default message when there is no response or error', () => {
    renderWithMantine(<ResponseViewer response={null} error={null} requestUrl={null} />);

    expect(screen.getByText('Response')).toBeInTheDocument();
    expect(screen.getByText('Execute a request to see response.')).toBeInTheDocument();
  });

  it('should render raw error message when error prop is provided', () => {
    renderWithMantine(<ResponseViewer response={null} error="Failed to fetch data" requestUrl={null} />);

    expect(screen.getByText('Failed to fetch data')).toBeInTheDocument();
    expect(screen.queryByText('Execute a request to see response.')).not.toBeInTheDocument();
  });

  it('should render request URL, status badge, and formatted JSON body on success', () => {
    const mockResponse: ResponseState = {
      status: 200,
      headers: { 'content-type': 'application/json' },
      body: '{"success":true}',
      requestUrl: 'https://example.com',
    };

    renderWithMantine(
      <ResponseViewer response={mockResponse} error={null} requestUrl="https://example.com" />
    );

    expect(screen.getByText('Request URL')).toBeInTheDocument();
    expect(screen.getByText('https://example.com')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('200')).toBeInTheDocument();

    const codeBlocks = screen.getAllByTestId('mock-code');
    const bodyBlock = codeBlocks.find((el) => el.getAttribute('data-lang') === 'json' && el.textContent?.includes('success'));
    
    expect(bodyBlock).toBeInTheDocument();
    expect(bodyBlock?.textContent).toContain('{\n  "success": true\n}');
  });

  it('should filter allowed headers and correctly detect language types', () => {
    const mockResponse: ResponseState = {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Length': '512',
        'X-Unallowed-Header': 'secret-token',
      },
      body: '<h1>Hello World</h1>',
      requestUrl: 'https://example.com',
    };

    renderWithMantine(<ResponseViewer response={mockResponse} error={null} requestUrl={null} />);

    const headersBlock = screen.getAllByTestId('mock-code').find((el) => el.textContent?.includes('content-type'));
    expect(headersBlock).toBeInTheDocument();
    expect(headersBlock?.textContent).toContain('content-type');
    expect(headersBlock?.textContent).toContain('content-length');
    expect(headersBlock?.textContent).not.toContain('x-unallowed-header');

    const bodyBlock = screen.getAllByTestId('mock-code').find((el) => el.getAttribute('data-lang') === 'html');
    expect(bodyBlock).toBeInTheDocument();
    expect(bodyBlock?.textContent).toBe('<h1>Hello World</h1>');
  });

  it('should render raw message for specific Java Long conversion errors', () => {
    const rawJavaError = 'Internal Server Error: couldn\'t convert value `abc` to required type java.lang.Long';
    
    const mockResponse: ResponseState = {
      status: 400,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        message: rawJavaError,
      }),
      requestUrl: 'https://example.com',
    };

    renderWithMantine(<ResponseViewer response={mockResponse} error={null} requestUrl={null} />);

    expect(screen.getByText('Error Message')).toBeInTheDocument();
    expect(screen.getByText(rawJavaError)).toBeInTheDocument();
  });
});
