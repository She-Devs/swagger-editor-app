import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MantineProvider } from '@mantine/core';
import { CurlViewer } from './CurlViewer';

const renderWithMantine = (ui: React.ReactElement) => {
  return render(<MantineProvider>{ui}</MantineProvider>);
};

vi.mock('@mantine/code-highlight', () => ({
  CodeHighlight: ({ code }: { code: string }) => <pre data-testid="mock-code">{code}</pre>,
}));

describe('CurlViewer Component', () => {
  it('should render nothing when curl prop is missing or empty', () => {
    renderWithMantine(<CurlViewer curl={null} />);
    
    expect(screen.queryByText('cURL')).not.toBeInTheDocument();
    expect(screen.queryByTestId('mock-code')).not.toBeInTheDocument();

    renderWithMantine(<CurlViewer curl="" />);
    expect(screen.queryByText('cURL')).not.toBeInTheDocument();
  });

  it('should render the cURL code block and header when curl prop is provided', () => {
    const testCurl = 'curl -X POST \'https://example.com\'';
    
    renderWithMantine(<CurlViewer curl={testCurl} />);

    expect(screen.getByText('cURL')).toBeInTheDocument();
    
    const codeBlock = screen.getByTestId('mock-code');
    expect(codeBlock).toBeInTheDocument();
    expect(codeBlock).toHaveTextContent(testCurl);
  });
});
