import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { EmptyStateActions } from './EmptyStateActions';
 
vi.mock('@/i18n/navigation', () => ({
  Link: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));
 
function renderWithMantine(ui: React.ReactElement) {
  return render(<MantineProvider>{ui}</MantineProvider>);
}
 
describe('EmptyStateActions', () => {
  it('renders the provided label', () => {
    renderWithMantine(<EmptyStateActions label="Go to Editor" />);
    expect(screen.getByText('Go to Editor')).toBeTruthy();
  });
 
  it('renders a link pointing to the editor route', () => {
    renderWithMantine(<EmptyStateActions label="Go to Editor" />);
    const link = screen.getByRole('link', { name: 'Go to Editor' });
    expect(link).toHaveAttribute('href', '/');
  });
 
  it('renders a different label when provided', () => {
    renderWithMantine(<EmptyStateActions label="Перейти в редактор" />);
    expect(screen.getByText('Перейти в редактор')).toBeTruthy();
    expect(screen.queryByText('Go to Editor')).toBeNull();
  });
});
