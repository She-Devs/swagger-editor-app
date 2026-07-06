import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { LanguageToggle } from './LanguageToggle';

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: () => ({ matches: false, addEventListener: () => {}, removeEventListener: () => {} }),
});

vi.mock('./../layouts/Header/Header.module.css', () => ({
  default: {
    iconBtn: 'iconBtn',
  },
}));

const mockReplace = vi.fn();

vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
  usePathname: () => '/about',
}));

vi.mock('next-intl', () => ({
  useLocale: () => 'en',
}));

vi.mock('@/constants', () => ({
  lANG_EN: 'EN',
  lANG_RU: 'RU',
}));

vi.mock('@/i18n/request', () => ({
  Locale: {
    EN: 'en',
    RU: 'ru',
  },
}));

describe('LanguageToggle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(
      <MantineProvider>
        <LanguageToggle />
      </MantineProvider>
    );
    expect(container).toBeDefined();
  });

  it('calls replace with new locale when clicked', () => {
    render(
      <MantineProvider>
        <LanguageToggle />
      </MantineProvider>
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(mockReplace).toHaveBeenCalled();
  });
});
