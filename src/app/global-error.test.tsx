import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import GlobalError from './global-error';

describe('GlobalError', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders error message and retry button', () => {
    render(<GlobalError error={new Error('Test error')} reset={vi.fn()} />);

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Try again/i })).toBeInTheDocument();
  });

  it('calls reset when retry button is clicked', () => {
    const reset = vi.fn();
    render(<GlobalError error={new Error('Test error')} reset={reset} />);

    fireEvent.click(screen.getByRole('button', { name: /Try again/i }));

    expect(reset).toHaveBeenCalledTimes(1);
  });
});
