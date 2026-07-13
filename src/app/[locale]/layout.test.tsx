import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('@/components/layouts/Header/Header', () => ({
  Header: () => <header data-testid="header" />,
}));

vi.mock('@/components/layouts/Footer/Footer', () => ({
  Footer: () => <footer data-testid="footer" />,
}));

vi.mock('@/components/providers/AuthProvider', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="auth-provider">{children}</div>
  ),
}));

vi.mock('../theme', () => ({
  theme: {},
}));

vi.mock('next-intl', () => ({
  NextIntlClientProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="intl-provider">{children}</div>
  ),
}));

vi.mock('next-intl/server', () => ({
  getMessages: vi.fn(async () => ({})),
}));

import RootLayout from './layout';

describe('RootLayout', () => {
  it('renders providers, Header, children and Footer', async () => {
    const jsx = await RootLayout({
      children: <div data-testid="page-content">Hello</div>,
      params: Promise.resolve({ locale: 'en' }),
    });

    render(jsx);

    expect(screen.getByTestId('intl-provider')).toBeTruthy();
    expect(screen.getByTestId('auth-provider')).toBeTruthy();
    expect(screen.getByTestId('header')).toBeTruthy();
    expect(screen.getByTestId('footer')).toBeTruthy();
    expect(screen.getByTestId('page-content')).toBeTruthy();
  });

  it('renders Header before children and Footer after children', async () => {
    const jsx = await RootLayout({
      children: <div data-testid="page-content">Hello</div>,
      params: Promise.resolve({ locale: 'ru' }),
    });

    render(jsx);

    const header = screen.getByTestId('header');
    const content = screen.getByTestId('page-content');
    const footer = screen.getByTestId('footer');

    expect(
      header.compareDocumentPosition(content) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
    expect(
      content.compareDocumentPosition(footer) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
  });
});
