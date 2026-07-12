import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

vi.mock('next-intl/server', () => ({
  setRequestLocale: vi.fn(),
}));

vi.mock('@mantine/core', () => ({
  Container: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/components/auth/SignInForm', () => ({
  SignInForm: () => <div data-testid="sign-in-form">SignInForm</div>,
}));

async function renderPage(locale: string) {
  const { default: SignInPage } = await import('./page');
  const jsx = await SignInPage({ params: Promise.resolve({ locale }) });
  render(jsx as React.ReactElement);
}

describe('SignInPage', () => {
  it('renders SignInForm', async () => {
    await renderPage('en');
    expect(screen.getByTestId('sign-in-form')).toBeInTheDocument();
  });

  it('calls setRequestLocale with correct locale', async () => {
    const { setRequestLocale } = await import('next-intl/server');
    await renderPage('ru');
    expect(setRequestLocale).toHaveBeenCalledWith('ru');
  });
});
