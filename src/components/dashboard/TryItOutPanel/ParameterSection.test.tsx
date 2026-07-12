import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MantineProvider } from '@mantine/core';
import { ParameterSection } from './ParameterSection';
import type { OAParameter } from '../ViewerPanel/types';

const renderWithMantine = (ui: React.ReactElement) => {
  return render(<MantineProvider>{ui}</MantineProvider>);
};

describe('ParameterSection Component', () => {
  const mockParams: OAParameter[] = [
    {
      name: 'userId',
      in: 'path',
      required: true,
      description: 'ID пользователя',
      schema: { type: 'string' },
    },
    {
      name: 'limit',
      in: 'query',
      required: false,
      description: 'Лимит выборки',
      schema: { type: 'integer' },
    },
  ];

  const defaultProps = {
    title: 'Параметры запроса',
    params: mockParams,
    validationErrors: {},
    values: {
      path_userId: '123',
    },
    onValueChange: vi.fn(),
  };

  it('should render nothing when params array is empty', () => {
    renderWithMantine(<ParameterSection {...defaultProps} params={[]} />);
    
    expect(screen.queryByText('Параметры запроса')).not.toBeInTheDocument();
  });

  it('should render fields with correct labels, descriptions, and values', () => {
    renderWithMantine(<ParameterSection {...defaultProps} />);

    expect(screen.getByText('Параметры запроса')).toBeInTheDocument();
    expect(screen.getByLabelText('userId *')).toBeInTheDocument();
    expect(screen.getByText('ID пользователя')).toBeInTheDocument();
    expect(screen.getByDisplayValue('123')).toBeInTheDocument();

    expect(screen.getByLabelText('limit')).toBeInTheDocument();
    expect(screen.getByText('Лимит выборки')).toBeInTheDocument();
  });

  it('should display validation errors when provided', () => {
    const propsWithErrors = {
      ...defaultProps,
      validationErrors: {
        path_userId: 'ID пользователя обязателен',
      },
    };

    renderWithMantine(<ParameterSection {...propsWithErrors} />);

    expect(screen.getByText('ID пользователя обязателен')).toBeInTheDocument();
  });

  it('should call onValueChange with correct arguments when user types', () => {
    const mockOnValueChange = vi.fn();
    renderWithMantine(<ParameterSection {...defaultProps} onValueChange={mockOnValueChange} />);

    const limitInput = screen.getByLabelText('limit');
    fireEvent.change(limitInput, { target: { value: '50' } });

    expect(mockOnValueChange).toHaveBeenCalledTimes(1);
    expect(mockOnValueChange).toHaveBeenCalledWith('query', 'limit', '50');
  });
});
