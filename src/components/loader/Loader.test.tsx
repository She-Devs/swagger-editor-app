import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MantineProvider } from '@mantine/core';
import { LoaderComponent } from './Loader';

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: () => ({
    matches: false,
    addEventListener: () => {},
    removeEventListener: () => {},
  }),
});

describe('LoaderComponent', () => {
  it('should render when visible', () => {
    const { container } = render(
      <MantineProvider>
        <LoaderComponent visible={true} />
      </MantineProvider>
    );

    const loader = container.querySelector('.mantine-Loader-root');
    expect(loader).not.toBeNull();
  });

  it('should not render when hidden', () => {
    const { container } = render(
      <MantineProvider>
        <LoaderComponent visible={false} />
      </MantineProvider>
    );

    const overlay = container.querySelector('.mantine-Center-root');
    expect(overlay).toBeNull();
  });
});
