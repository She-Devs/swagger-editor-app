import { fireEvent, render, screen } from '@testing-library/react';
import { TeamCard } from './TeamCard';
import { MantineProvider } from '@mantine/core';

const renderComponent = (props = {}) => {
  render(
    <MantineProvider>
      <TeamCard
        name="Alice Smith"
        role="Frontend Developer"
        github="alice"
        {...props}
      />
    </MantineProvider>
  );
};

describe('TeamCard', () => {
  it('should render name and role', () => {
    renderComponent();

    expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    expect(screen.getByText('Frontend Developer')).toBeInTheDocument();
  });

  it('should render github link with correct url', () => {
    renderComponent({
      name: 'Alice',
      role: 'Developer',
      github: 'alice',
    });

    const link = screen.getByRole('link', {
      name: 'Open Alice\'s GitHub profile',
    });

    expect(link).toHaveAttribute(
      'href',
      'https://github.com/alice'
    );

    expect(link).toHaveAttribute(
      'target',
      '_blank'
    );

    expect(link).toHaveAttribute(
      'rel',
      'noopener noreferrer'
    );
  });

  it('should render avatar with github image', () => {
    renderComponent();

    const avatar = screen.getByRole('img');

    expect(avatar).toHaveAttribute(
      'src',
      'https://github.com/alice.png'
    );
  });

  it('should render first letter when avatar image is unavailable', () => {
    renderComponent();

    const avatar = screen.getByRole('img');

    fireEvent.error(avatar);

    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it('should render question mark when name is empty', () => {
    renderComponent({
      name: '',
      role: 'Developer',
      github: 'alice',
    });

    const avatar = screen.getByRole('img');

    fireEvent.error(avatar);

    expect(screen.getByText('?')).toBeInTheDocument();
  });
});
