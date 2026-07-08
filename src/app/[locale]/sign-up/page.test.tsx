import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

vi.mock('next-intl/server', () => ({
  setRequestLocale: vi.fn(),
}));

vi.mock('@mantine/core', () => ({
  Container: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/components/auth/SignUpForm', () => ({
  SignUpForm: () => <div data-testid="sign-up-form">SignUpForm</div>,
}));

async function renderPage(locale: string) {
  const { default: SignUpPage } = await import('./page');
  const jsx = await SignUpPage({ params: Promise.resolve({ locale }) });
  render(jsx as React.ReactElement);
}

describe('SignUpPage', () => {
  it('renders SignUpForm', async () => {
    await renderPage('en');
    expect(screen.getByTestId('sign-up-form')).toBeInTheDocument();
  });

  it('calls setRequestLocale with correct locale', async () => {
    const { setRequestLocale } = await import('next-intl/server');
    await renderPage('ru');
    expect(setRequestLocale).toHaveBeenCalledWith('ru');
  });
});
