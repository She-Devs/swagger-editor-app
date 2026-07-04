import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { AuthProvider } from './AuthProvider';
import { useAuthStore } from '@/store/authStore';

const mockGetSession = vi.fn();
const mockOnAuthStateChange = vi.fn();
const mockUnsubscribe = vi.fn();

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      getSession: mockGetSession,
      onAuthStateChange: mockOnAuthStateChange,
    },
  }),
}));

describe('AuthProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    act(() => {
      useAuthStore.setState({ user: null, isLoading: true });
    });

    mockOnAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: mockUnsubscribe } },
    });
  });

  it('renders children', async () => {
    mockGetSession.mockResolvedValue({ data: { session: null } });

    render(
      <AuthProvider>
        <span>child content</span>
      </AuthProvider>
    );

    expect(screen.getByText('child content')).toBeInTheDocument();
  });

  it('sets user from session on mount', async () => {
    const mockUser = { id: 'abc', email: 'test@example.com' };
    mockGetSession.mockResolvedValue({ data: { session: { user: mockUser } } });

    render(
      <AuthProvider>
        <span>child</span>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(useAuthStore.getState().user).toEqual(mockUser);
    });
  });

  it('sets user to null when no session', async () => {
    mockGetSession.mockResolvedValue({ data: { session: null } });

    render(
      <AuthProvider>
        <span>child</span>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().isLoading).toBe(false);
    });
  });

  it('updates user when auth state changes', async () => {
    mockGetSession.mockResolvedValue({ data: { session: null } });

    let capturedCallback: (event: string, session: unknown) => void = () => {};
    mockOnAuthStateChange.mockImplementation((cb: typeof capturedCallback) => {
      capturedCallback = cb;
      return { data: { subscription: { unsubscribe: mockUnsubscribe } } };
    });

    render(
      <AuthProvider>
        <span>child</span>
      </AuthProvider>
    );

    const newUser = { id: 'xyz', email: 'new@example.com' };
    act(() => {
      capturedCallback('SIGNED_IN', { user: newUser });
    });

    await waitFor(() => {
      expect(useAuthStore.getState().user).toEqual(newUser);
    });
  });

  it('unsubscribes from auth changes on unmount', async () => {
    mockGetSession.mockResolvedValue({ data: { session: null } });

    const { unmount } = render(
      <AuthProvider>
        <span>child</span>
      </AuthProvider>
    );

    unmount();
    expect(mockUnsubscribe).toHaveBeenCalled();
  });
});
