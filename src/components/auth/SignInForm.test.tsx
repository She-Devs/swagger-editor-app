import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SignInForm } from './SignInForm';

vi.mock('next-intl', () => ({
  useTranslations: (ns: string) => (key: string) => `${ns}.${key}`,
}));

const mockPush = vi.fn();
vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  Link: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

const mockSignInWithPassword = vi.fn();
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      signInWithPassword: mockSignInWithPassword,
    },
  }),
}));

vi.mock('@mantine/core', () => ({
  Paper: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Title: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
  Text: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
  Stack: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Alert: ({ children }: { children: React.ReactNode }) => <div role="alert">{children}</div>,
  TextInput: ({
    label,
    error,
    disabled,
    ...rest
  }: {
    label: string;
    error?: string | false;
    disabled?: boolean;
    name?: string;
    onChange?: React.ChangeEventHandler<HTMLInputElement>;
    onBlur?: React.FocusEventHandler<HTMLInputElement>;
  }) => (
    <div>
      <label htmlFor={rest.name}>{label}</label>
      <input id={rest.name} aria-label={label} disabled={disabled} {...rest} />
      {error && <span role="status">{error}</span>}
    </div>
  ),
  PasswordInput: ({
    label,
    error,
    disabled,
    ...rest
  }: {
    label: string;
    error?: string | false;
    disabled?: boolean;
    name?: string;
    onChange?: React.ChangeEventHandler<HTMLInputElement>;
    onBlur?: React.FocusEventHandler<HTMLInputElement>;
  }) => (
    <div>
      <label htmlFor={rest.name}>{label}</label>
      <input id={rest.name} type="password" aria-label={label} disabled={disabled} {...rest} />
      {error && <span role="status">{error}</span>}
    </div>
  ),
  Button: ({
    children,
    loading,
    onClick,
    type,
    ...rest
  }: {
    children: React.ReactNode;
    loading?: boolean;
    onClick?: () => void;
    type?: 'button' | 'submit' | 'reset';
  }) => (
    <button type={type} onClick={onClick} disabled={loading} {...rest}>
      {loading ? 'Loading…' : children}
    </button>
  ),
  Anchor: ({ children, href }: { children: React.ReactNode; href?: string }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock('@tabler/icons-react', () => ({
  IconAlertCircle: () => null,
}));

describe('SignInForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders email and password fields', () => {
    render(<SignInForm />);
    expect(screen.getByRole('textbox', { name: /email/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('renders Sign In submit button', () => {
    render(<SignInForm />);
    expect(screen.getByRole('button', { name: /Auth\.signIn\.submit/i })).toBeInTheDocument();
  });

  it('renders link to sign-up page', () => {
    render(<SignInForm />);
    const link = screen.getByRole('link', { name: /Auth\.signIn\.signUpLink/i });
    expect(link).toHaveAttribute('href', '/sign-up');
  });

  it('shows validation errors on empty submit', async () => {
    render(<SignInForm />);
    fireEvent.submit(screen.getByRole('button', { name: /submit/i }).closest('form')!);

    await waitFor(() => {
      const statuses = screen.getAllByRole('status');
      const messages = statuses.map((el) => el.textContent);
      expect(messages.some((m) => m?.includes('emailRequired'))).toBe(true);
    });
  });

  it('shows emailInvalid error on bad email', async () => {
    const user = userEvent.setup();
    render(<SignInForm />);

    await user.type(screen.getByRole('textbox', { name: /email/i }), 'notanemail');
    fireEvent.submit(screen.getByRole('button', { name: /submit/i }).closest('form')!);

    await waitFor(() => {
      const statuses = screen.getAllByRole('status');
      expect(statuses.some((el) => el.textContent?.includes('emailInvalid'))).toBe(true);
    });
  });

  it('calls supabase signInWithPassword on valid submit', async () => {
    mockSignInWithPassword.mockResolvedValue({ error: null });
    const user = userEvent.setup();
    render(<SignInForm />);

    await user.type(screen.getByRole('textbox', { name: /email/i }), 'user@example.com');
    await user.type(screen.getByLabelText(/password/i), 'anypassword');
    fireEvent.submit(screen.getByRole('button', { name: /submit/i }).closest('form')!);

    await waitFor(() => {
      expect(mockSignInWithPassword).toHaveBeenCalledWith({
        email: 'user@example.com',
        password: 'anypassword',
      });
    });
  });

  it('redirects to / on successful sign in', async () => {
    mockSignInWithPassword.mockResolvedValue({ error: null });
    const user = userEvent.setup();
    render(<SignInForm />);

    await user.type(screen.getByRole('textbox', { name: /email/i }), 'user@example.com');
    await user.type(screen.getByLabelText(/password/i), 'anypassword');
    fireEvent.submit(screen.getByRole('button', { name: /submit/i }).closest('form')!);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });

  it('shows invalidCredentials error on wrong credentials', async () => {
    mockSignInWithPassword.mockResolvedValue({
      error: { message: 'Invalid login credentials' },
    });
    const user = userEvent.setup();
    render(<SignInForm />);

    await user.type(screen.getByRole('textbox', { name: /email/i }), 'user@example.com');
    await user.type(screen.getByLabelText(/password/i), 'wrongpassword');
    fireEvent.submit(screen.getByRole('button', { name: /submit/i }).closest('form')!);

    await waitFor(() => {
      expect(screen.getByRole('alert').textContent).toContain('invalidCredentials');
    });
  });

  it('shows authFailed error on generic supabase error', async () => {
    mockSignInWithPassword.mockResolvedValue({
      error: { message: 'Some other error' },
    });
    const user = userEvent.setup();
    render(<SignInForm />);

    await user.type(screen.getByRole('textbox', { name: /email/i }), 'user@example.com');
    await user.type(screen.getByLabelText(/password/i), 'anypassword');
    fireEvent.submit(screen.getByRole('button', { name: /submit/i }).closest('form')!);

    await waitFor(() => {
      expect(screen.getByRole('alert').textContent).toContain('authFailed');
    });
  });

  it('shows authFailed error when supabase throws', async () => {
    mockSignInWithPassword.mockRejectedValue(new Error('network error'));
    const user = userEvent.setup();
    render(<SignInForm />);

    await user.type(screen.getByRole('textbox', { name: /email/i }), 'user@example.com');
    await user.type(screen.getByLabelText(/password/i), 'anypassword');
    fireEvent.submit(screen.getByRole('button', { name: /submit/i }).closest('form')!);

    await waitFor(() => {
      expect(screen.getByRole('alert').textContent).toContain('authFailed');
    });
  });
});
