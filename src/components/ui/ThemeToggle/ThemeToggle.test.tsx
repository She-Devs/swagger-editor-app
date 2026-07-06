import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { ThemeToggle } from './ThemeToggle';

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: () => ({ matches: false, addEventListener: () => {}, removeEventListener: () => {} }),
});

vi.mock('@/components/layouts/Header/Header.module.css', () => ({
  default: {
    iconBtn: 'iconBtn',
  },
}));

const mockToggleColorScheme = vi.fn();

vi.mock('@mantine/core', async () => {
  const actual = await vi.importActual('@mantine/core');
  return {
    ...actual,
    useMantineColorScheme: () => ({
      toggleColorScheme: mockToggleColorScheme,
      colorScheme: 'light',
    }),
  };
});

vi.mock('@/constants', () => ({
  THEME_ICONS: {
    light: '☀️',
    dark: '🌙',
  },
}));

describe('ThemeToggle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(
      <MantineProvider>
        <ThemeToggle />
      </MantineProvider>
    );
    expect(container).toBeDefined();
  });

  it('renders a button', () => {
    render(
      <MantineProvider>
        <ThemeToggle />
      </MantineProvider>
    );
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('calls toggleColorScheme when clicked', () => {
    render(
      <MantineProvider>
        <ThemeToggle />
      </MantineProvider>
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(mockToggleColorScheme).toHaveBeenCalled();
  });
});
