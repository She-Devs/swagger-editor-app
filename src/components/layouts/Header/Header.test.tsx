import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Header } from './Header';
import { useAuthStore } from '@/store/authStore';
import { act } from 'react';

// ── Mock next-intl ──────────────────────────────────────────────────────────
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

// ── Mock navigation ─────────────────────────────────────────────────────────
const mockRouterPush = vi.fn();
vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({ push: mockRouterPush }),
  Link: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// ── Mock supabase client ────────────────────────────────────────────────────
const mockSignOut = vi.fn();
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: { signOut: mockSignOut },
  }),
}));

// ── Mock Mantine ────────────────────────────────────────────────────────────
vi.mock('@mantine/core', async () => {
  return {
    Box: ({ children, component: C = 'div', ...rest }: { children: React.ReactNode; component?: string; className?: string }) => (
      <C {...rest}>{children}</C>
    ),
    Container: ({ children, ...rest }: { children: React.ReactNode }) => <div {...rest}>{children}</div>,
    Group: ({ children, ...rest }: { children: React.ReactNode }) => <div {...rest}>{children}</div>,
    Button: ({
      children,
      onClick,
      component: C,
      href,
      ...rest
    }: {
      children: React.ReactNode;
      onClick?: () => void;
      component?: unknown;
      href?: string;
    }) => {
      if (href) return <a href={href} onClick={onClick} {...rest}>{children}</a>;
      return <button onClick={onClick} {...rest}>{children}</button>;
    },
  };
});

vi.mock('@/components/ui/ThemeToggle', () => ({ ThemeToggle: () => null }));
vi.mock('@/components/ui/LanguageToggle', () => ({ LanguageToggle: () => null }));
vi.mock('@/constants', () => ({ LOGO: 'LOGO' }));

// ── Tests ───────────────────────────────────────────────────────────────────
describe('Header', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSignOut.mockResolvedValue({});
    act(() => {
      useAuthStore.setState({ user: null, isLoading: false });
    });
  });

  it('shows Sign In and Sign Up buttons for unauthenticated users', () => {
    render(<Header />);
    expect(screen.getByText('sign-in')).toBeInTheDocument();
    expect(screen.getByText('sign-up')).toBeInTheDocument();
  });

  it('Sign In button links to /sign-in', () => {
    render(<Header />);
    expect(screen.getByText('sign-in').closest('a')).toHaveAttribute('href', '/sign-in');
  });

  it('Sign Up button links to /sign-up', () => {
    render(<Header />);
    expect(screen.getByText('sign-up').closest('a')).toHaveAttribute('href', '/sign-up');
  });

  it('shows History and Sign Out buttons for authenticated users', () => {
    act(() => {
      useAuthStore.setState({ user: { id: '1', email: 'u@u.com' } as never, isLoading: false });
    });
    render(<Header />);
    expect(screen.getByText('history')).toBeInTheDocument();
    expect(screen.getByText('sign-out')).toBeInTheDocument();
  });

  it('History button links to /history', () => {
    act(() => {
      useAuthStore.setState({ user: { id: '1', email: 'u@u.com' } as never, isLoading: false });
    });
    render(<Header />);
    expect(screen.getByText('history').closest('a')).toHaveAttribute('href', '/history');
  });

  it('calls signOut and redirects to / when Sign Out is clicked', async () => {
    act(() => {
      useAuthStore.setState({ user: { id: '1', email: 'u@u.com' } as never, isLoading: false });
    });
    render(<Header />);
    fireEvent.click(screen.getByText('sign-out'));

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalled();
      expect(mockRouterPush).toHaveBeenCalledWith('/');
    });
  });

  it('renders navigation links to main and about', () => {
    render(<Header />);
    expect(screen.getByText('main').closest('a')).toHaveAttribute('href', '/');
    expect(screen.getByText('about').closest('a')).toHaveAttribute('href', '/about');
  });

  it('does not show auth buttons while loading', () => {
    act(() => {
      useAuthStore.setState({ user: null, isLoading: true });
    });
    render(<Header />);
    expect(screen.queryByText('sign-in')).not.toBeInTheDocument();
    expect(screen.queryByText('sign-up')).not.toBeInTheDocument();
    expect(screen.queryByText('history')).not.toBeInTheDocument();
  });
});

