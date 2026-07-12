import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { Header } from './Header';

const mockPush = vi.fn();
const mockSignOut = vi.fn();
const mockUseAuthStore = vi.fn();

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
  useAuthStore: () => mockUseAuthStore(),
}));

vi.mock('@/i18n/navigation', () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
  useRouter: () => ({ push: mockPush }),
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
    auth: { signOut: mockSignOut },
  }),
}));

describe('Header', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuthStore.mockReturnValue({ user: null, isLoading: false });
    mockSignOut.mockResolvedValue({ error: null });
  });

  it('renders without crashing', () => {
    const { container } = render(
      <MantineProvider>
        <Header />
      </MantineProvider>
    );
    expect(container).toBeDefined();
  });

  it('applies scrolled class when window is scrolled past 20px', () => {
    const { container } = render(
      <MantineProvider>
        <Header />
      </MantineProvider>
    );

    const headerElement = container.querySelector('header');
    expect(headerElement?.className).not.toContain('scrolled');

    Object.defineProperty(window, 'scrollY', { value: 50, writable: true });
    fireEvent.scroll(window);

    expect(headerElement?.className).toContain('scrolled');
  });

  it('calls signOut and redirects to main page on Sign Out button click', async () => {
    mockUseAuthStore.mockReturnValue({ user: { id: '123' }, isLoading: false });
    
    render(
      <MantineProvider>
        <Header />
      </MantineProvider>
    );

    const signOutBtn = screen.getByText('Sign Out');
    fireEvent.click(signOutBtn);

    expect(mockSignOut).toHaveBeenCalledTimes(1);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });

  it('does not redirect if signOut returns an error', async () => {
    mockUseAuthStore.mockReturnValue({ user: { id: '123' }, isLoading: false });
    mockSignOut.mockResolvedValueOnce({ error: new Error('Logout failed') });
    
    render(
      <MantineProvider>
        <Header />
      </MantineProvider>
    );

    const signOutBtn = screen.getByText('Sign Out');
    fireEvent.click(signOutBtn);

    expect(mockSignOut).toHaveBeenCalledTimes(1);

    await waitFor(() => {
      expect(mockPush).not.toHaveBeenCalled();
    });
  });
});
