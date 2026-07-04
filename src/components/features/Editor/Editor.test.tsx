import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import Editor from './Editor';

describe('Editor', () => {
  it('renders with initial value', () => {
    const onChange = vi.fn();
    const { container } = render(
      <Editor 
        value="openapi: 3.0.0"
        onChange={onChange}
        format="yaml"
      />
    );
    expect(container).toBeInTheDocument();
  });

  it('renders with JSON format', () => {
    const onChange = vi.fn();
    const { container } = render(
      <Editor 
        value='{"openapi": "3.0.0"}'
        onChange={onChange}
        format="json"
      />
    );
    expect(container).toBeInTheDocument();
  });

  it('renders with YAML format', () => {
    const onChange = vi.fn();
    const { container } = render(
      <Editor 
        value="openapi: 3.0.0"
        onChange={onChange}
        format="yaml"
      />
    );
    expect(container).toBeInTheDocument();
  });
});
