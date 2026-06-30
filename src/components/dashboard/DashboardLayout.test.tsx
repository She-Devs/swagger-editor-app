import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MantineProvider } from '@mantine/core';
import { DashboardLayout } from './DashboardLayout';

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: () => ({
    matches: false,
    addEventListener: () => {},
    removeEventListener: () => {},
  }),
});

global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

describe('DashboardLayout', () => {
  it('should render panels correctly', () => {
    const { container } = render(
      <MantineProvider>
        <DashboardLayout />
      </MantineProvider>
    );

    const splitter = container.querySelector('.mantine-Splitter-root');
    expect(splitter).toBeDefined();

    const scrollAreas = container.querySelectorAll('.mantine-ScrollArea-root');
    expect(scrollAreas.length).toBeGreaterThan(0);
  });
});
