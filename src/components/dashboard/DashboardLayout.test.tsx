import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MantineProvider } from '@mantine/core';
import { DashboardLayout } from './DashboardLayout';
import { NextIntlClientProvider } from 'next-intl';

global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

describe('DashboardLayout', () => {
  it('should render panels correctly', () => {
    const { container } = render(
      <NextIntlClientProvider locale="en" messages={{}}>
        <MantineProvider>
          <DashboardLayout />
        </MantineProvider>
      </NextIntlClientProvider>
    );

    const splitter = container.querySelector('.mantine-Splitter-root');
    expect(splitter).toBeTruthy();

    const scrollAreas = container.querySelectorAll('.mantine-ScrollArea-root');
    expect(scrollAreas.length).toBe(2);
  });
});
