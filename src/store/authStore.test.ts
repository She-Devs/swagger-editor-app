import { describe, it, expect, beforeEach } from 'vitest';
import { act } from 'react';
import { useAuthStore } from './authStore';

describe('useAuthStore', () => {
  beforeEach(() => {
    act(() => {
      useAuthStore.setState({ user: null, isLoading: true });
    });
  });

  it('has correct initial state', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isLoading).toBe(true);
  });

  it('setUser updates user', () => {
    const mockUser = { id: '123', email: 'test@example.com' } as never;
    act(() => {
      useAuthStore.getState().setUser(mockUser);
    });
    expect(useAuthStore.getState().user).toEqual(mockUser);
  });

  it('setUser can set user to null', () => {
    const mockUser = { id: '123', email: 'test@example.com' } as never;
    act(() => {
      useAuthStore.getState().setUser(mockUser);
      useAuthStore.getState().setUser(null);
    });
    expect(useAuthStore.getState().user).toBeNull();
  });

  it('setLoading updates isLoading', () => {
    act(() => {
      useAuthStore.getState().setLoading(false);
    });
    expect(useAuthStore.getState().isLoading).toBe(false);
  });

  it('setLoading can set loading back to true', () => {
    act(() => {
      useAuthStore.getState().setLoading(false);
      useAuthStore.getState().setLoading(true);
    });
    expect(useAuthStore.getState().isLoading).toBe(true);
  });
});
