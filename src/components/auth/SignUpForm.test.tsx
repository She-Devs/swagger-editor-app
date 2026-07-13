import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SignUpForm } from './SignUpForm';

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

const mockSignUp = vi.fn();
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      signUp: mockSignUp,
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

const fillForm = async (
  user: ReturnType<typeof userEvent.setup>,
  email = 'user@example.com',
  password = 'Password1!',
  confirm = 'Password1!'
) => {
  await user.type(screen.getByRole('textbox', { name: /email/i }), email);
  const passwordInputs = screen.getAllByLabelText(/password/i);
  await user.type(passwordInputs[0], password);
  await user.type(passwordInputs[1], confirm);
};

describe('SignUpForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders email, password, and confirm password fields', () => {
    render(<SignUpForm />);
    expect(screen.getByRole('textbox', { name: /email/i })).toBeInTheDocument();
    const passwordInputs = screen.getAllByLabelText(/password/i);
    expect(passwordInputs.length).toBeGreaterThanOrEqual(2);
  });

  it('renders Sign Up submit button', () => {
    render(<SignUpForm />);
    expect(screen.getByRole('button', { name: /Auth\.signUp\.submit/i })).toBeInTheDocument();
  });

  it('renders link to sign-in page', () => {
    render(<SignUpForm />);
    const link = screen.getByRole('link', { name: /Auth\.signUp\.signInLink/i });
    expect(link).toHaveAttribute('href', '/sign-in');
  });

  it('shows validation errors on empty submit', async () => {
    render(<SignUpForm />);
    fireEvent.submit(screen.getByRole('button', { name: /submit/i }).closest('form')!);

    await waitFor(() => {
      const statuses = screen.getAllByRole('status');
      const messages = statuses.map((el) => el.textContent);
      expect(messages.some((m) => m?.includes('emailRequired'))).toBe(true);
    });
  });

  it('shows passwordMin error for short password', async () => {
    const user = userEvent.setup();
    render(<SignUpForm />);
    await user.type(screen.getByRole('textbox', { name: /email/i }), 'user@example.com');
    const passwordInputs = screen.getAllByLabelText(/password/i);
    await user.type(passwordInputs[0], 'Ab1!');
    await user.type(passwordInputs[1], 'Ab1!');
    fireEvent.submit(screen.getByRole('button', { name: /submit/i }).closest('form')!);

    await waitFor(() => {
      const statuses = screen.getAllByRole('status');
      expect(statuses.some((el) => el.textContent?.includes('passwordMin'))).toBe(true);
    });
  });

  it('shows passwordsMismatch error when passwords differ', async () => {
    const user = userEvent.setup();
    render(<SignUpForm />);
    await fillForm(user, 'user@example.com', 'Password1!', 'Different1!');
    fireEvent.submit(screen.getByRole('button', { name: /submit/i }).closest('form')!);

    await waitFor(() => {
      const statuses = screen.getAllByRole('status');
      expect(statuses.some((el) => el.textContent?.includes('passwordsMismatch'))).toBe(true);
    });
  });

  it('calls supabase signUp on valid submit', async () => {
    mockSignUp.mockResolvedValue({ error: null });
    const user = userEvent.setup();
    render(<SignUpForm />);
    await fillForm(user);
    fireEvent.submit(screen.getByRole('button', { name: /submit/i }).closest('form')!);

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'user@example.com', password: 'Password1!' })
      );
    });
  });

  it('redirects to / on successful sign up', async () => {
    mockSignUp.mockResolvedValue({ error: null });
    const user = userEvent.setup();
    render(<SignUpForm />);
    await fillForm(user);
    fireEvent.submit(screen.getByRole('button', { name: /submit/i }).closest('form')!);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });

  it('shows userExists error when email already registered', async () => {
    mockSignUp.mockResolvedValue({ error: { message: 'User already registered' } });
    const user = userEvent.setup();
    render(<SignUpForm />);
    await fillForm(user);
    fireEvent.submit(screen.getByRole('button', { name: /submit/i }).closest('form')!);

    await waitFor(() => {
      expect(screen.getByRole('alert').textContent).toContain('userExists');
    });
  });

  it('shows authFailed error on generic supabase error', async () => {
    mockSignUp.mockResolvedValue({ error: { message: 'Some unexpected error' } });
    const user = userEvent.setup();
    render(<SignUpForm />);
    await fillForm(user);
    fireEvent.submit(screen.getByRole('button', { name: /submit/i }).closest('form')!);

    await waitFor(() => {
      expect(screen.getByRole('alert').textContent).toContain('authFailed');
    });
  });

  it('shows authFailed error when supabase throws', async () => {
    mockSignUp.mockRejectedValue(new Error('network error'));
    const user = userEvent.setup();
    render(<SignUpForm />);
    await fillForm(user);
    fireEvent.submit(screen.getByRole('button', { name: /submit/i }).closest('form')!);

    await waitFor(() => {
      expect(screen.getByRole('alert').textContent).toContain('authFailed');
    });
  });
});
