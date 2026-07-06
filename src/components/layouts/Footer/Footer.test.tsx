import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { Footer } from './Footer';

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: () => ({ matches: false, addEventListener: () => {}, removeEventListener: () => {} }),
});

vi.mock('@/i18n/navigation', () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock('@/constants', () => ({
  LOGO: 'Swagger Editor',
  RS_SCHOOL: 'RS School',
  FOOTER_YEAR: '2026',
  RS_SCHOOL_LINK: 'https://rs.school/',
}));

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      'main': 'Main',
      'about': 'About',
    };
    return translations[key] || key;
  },
}));

describe('Footer', () => {
  it('renders without crashing', () => {
    const { container } = render(
      <MantineProvider>
        <Footer />
      </MantineProvider>
    );
    expect(container).toBeDefined();
  });

  it('renders logo', () => {
    render(
      <MantineProvider>
        <Footer />
      </MantineProvider>
    );
    expect(screen.getByText('Swagger Editor')).toBeInTheDocument();
  });

  it('renders navigation links', () => {
    render(
      <MantineProvider>
        <Footer />
      </MantineProvider>
    );
    expect(screen.getByText('Main')).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();
    expect(screen.getByText('RS School')).toBeInTheDocument();
  });

  it('renders year', () => {
    render(
      <MantineProvider>
        <Footer />
      </MantineProvider>
    );
    expect(screen.getByText('2026')).toBeInTheDocument();
  });
});
