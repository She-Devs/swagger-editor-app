import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MantineProvider } from '@mantine/core';

import { SectionDivider } from './SectionDivider';

describe('SectionDivider', () => {
  it('should render sparkles icon', () => {
    const { container } = render(
      <MantineProvider>
        <SectionDivider />
      </MantineProvider>,
    );

    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('should render two divider lines', () => {
    render(
      <MantineProvider>
        <SectionDivider />
      </MantineProvider>,
    );

    expect(screen.getAllByRole('separator')).toHaveLength(2);
  });
});
