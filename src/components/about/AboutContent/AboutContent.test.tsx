import { render, screen } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { NextIntlClientProvider } from 'next-intl';
import AboutContent from './AboutContent';

const messages = {
  AboutPage: {
    hero: {
      title: 'Swagger Editor',
      subtitle: 'A modern workspace for designing and testing REST APIs',
      description:
        'Create and edit OpenAPI specifications, explore generated documentation, and test API endpoints directly from your browser.',
      github: 'View on GitHub',
    },
    school: {
      title: 'Rolling Scopes School',
      description: 'This project was created as part of the',
    },
    sections: {
      technologies: 'Technologies Used',
      team: 'Meet the Team',
      thanks: 'Special Thanks',
    },
    thanks: {
      description:
        'Huge thanks to our mentors for their guidance, support, and valuable feedback throughout the journey.',
    },
  },
};

const renderComponent = () => {
  render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <MantineProvider>
        <AboutContent />
      </MantineProvider>
    </NextIntlClientProvider>
  );
};

describe('AboutContent', () => {
  it('should render hero section', () => {
    renderComponent();

    expect(screen.getByText('Swagger Editor')).toBeInTheDocument();
    expect(
      screen.getByText('A modern workspace for designing and testing REST APIs')
    ).toBeInTheDocument();
  });

  it('should render github button', () => {
    renderComponent();

    const githubLink = screen.getByRole('link', {
      name: 'View on GitHub',
    });

    expect(githubLink).toBeInTheDocument();
  });

  it('should render all sections titles', () => {
    renderComponent();

    expect(screen.getByText('Rolling Scopes School')).toBeInTheDocument();
    expect(screen.getByText('Technologies Used')).toBeInTheDocument();
    expect(screen.getByText('Meet the Team')).toBeInTheDocument();
    expect(screen.getByText('Special Thanks')).toBeInTheDocument();
  });
});
