import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { Header } from './Header';

vi.mock('./Header.module.css', () => ({
  default: {
    header: 'header',
    scrolled: 'scrolled',
    container: 'container',
    logo: 'logo',
    link: 'link',
    loginBtn: 'loginBtn',
    signupBtn: 'signupBtn',
  },
}));

vi.mock('@/store/authStore', () => ({
  useAuthStore: () => ({
    user: null,
    isLoading: false,
  }),
}));

vi.mock('@/i18n/navigation', () => ({
  Link: ({ children }: { children: React.ReactNode }) => <a>{children}</a>,
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/',
}));

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      'main': 'Main',
      'about': 'About',
      'sign-in': 'Sign In',
      'sign-up': 'Sign Up',
      'history': 'History',
      'sign-out': 'Sign Out',
    };
    return translations[key] || key;
  },
}));

vi.mock('@/components/ui/ThemeToggle/ThemeToggle', () => ({
  ThemeToggle: () => <button>Theme</button>,
}));

vi.mock('@/components/ui/LanguageToggle/LanguageToggle', () => ({
  LanguageToggle: () => <button>Lang</button>,
}));

vi.mock('@/constants', () => ({
  LOGO: 'Logo',
  THEME_ICONS: { light: '☀️', dark: '🌙' },
}));

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: { signOut: () => Promise.resolve({ error: null }) },
  }),
}));

describe('Header', () => {
  it('renders without crashing', () => {
    const { container } = render(
      <MantineProvider>
        <Header />
      </MantineProvider>
    );
    expect(container).toBeDefined();
  });
});
