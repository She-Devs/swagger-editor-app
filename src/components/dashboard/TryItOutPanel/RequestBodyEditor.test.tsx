import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MantineProvider } from '@mantine/core';
import { RequestBodyEditor } from './RequestBodyEditor';

const renderWithMantine = (ui: React.ReactElement) => {
  return render(<MantineProvider>{ui}</MantineProvider>);
};

vi.mock('next-intl', () => ({
  useTranslations: () => {
    const t = (key: string) => {

      if (key === 'contentTypeLabel') return 'Content-Type';
      if (key === 'bodyLabel') return 'Request Body';
      if (key === 'bodyDescription') {
        return 'Provide payload matching spec configuration (application/json)';
      }
      if (key === 'invalidJson') return 'Invalid JSON syntax';
      return key;
    };
    t.has = () => true;
    return t;
  },
}));

vi.mock('@uiw/react-codemirror', () => {
  return {
    default: ({ value, onChange }: { value: string; onChange: (val: string) => void }) => (
      <textarea
        data-testid="mock-codemirror"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    ),
  };
});

vi.mock('@codemirror/lang-json', () => ({
  json: () => [],
}));

describe('RequestBodyEditor Component', () => {
  const defaultProps = {
    body: '{\n  "name": "test"\n}',
    onBodyChange: vi.fn(),
  };

  it('should render correct label, description, and content type', () => {
    renderWithMantine(<RequestBodyEditor {...defaultProps} />);

    expect(screen.getByLabelText('Content-Type')).toBeDisabled();
    expect(screen.getByDisplayValue('application/json')).toBeInTheDocument();
    expect(screen.getByText('Request Body')).toBeInTheDocument();
    expect(
      screen.getByText('Provide payload matching spec configuration (application/json)')
    ).toBeInTheDocument();
  });

  it('should not show validation error for valid JSON or empty body', () => {
    renderWithMantine(<RequestBodyEditor {...defaultProps} />);
    expect(screen.queryByText(/Invalid JSON syntax/i)).not.toBeInTheDocument();

    renderWithMantine(<RequestBodyEditor {...defaultProps} body="" />);
    expect(screen.queryByText(/Invalid JSON syntax/i)).not.toBeInTheDocument();
  });

  it('should show syntax error message when JSON is invalid', () => {
    const invalidJson = '{\n  "name": "test"\n';
    const { container } = renderWithMantine(<RequestBodyEditor {...defaultProps} body={invalidJson} />);

    expect(container.textContent).toContain('Invalid JSON syntax');
  });

  it('should call onBodyChange when text inside editor changes', () => {
    const mockOnBodyChange = vi.fn();
    renderWithMantine(<RequestBodyEditor {...defaultProps} onBodyChange={mockOnBodyChange} />);

    const textarea = screen.getByTestId('mock-codemirror');
    fireEvent.change(textarea, { target: { value: '{"id": 1}' } });

    expect(mockOnBodyChange).toHaveBeenCalledTimes(1);
    expect(mockOnBodyChange).toHaveBeenCalledWith('{"id": 1}');
  });
});
