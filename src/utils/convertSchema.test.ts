import { describe, it, expect, vi, beforeEach } from 'vitest';
import { convertSchema } from './convertSchema';

interface ParseResult {
  format: 'json' | 'yaml';
  data: unknown;
}

vi.mock('./parseAndDetectFormat', () => ({
  default: vi.fn(),
}));

import parseAndDetectFormat from './parseAndDetectFormat';

describe('convertSchema', () => {
  const mockYamlData = {
    openapi: '3.0.0',
    info: { title: 'Test API', version: '1.0.0' },
    paths: { '/users': { get: { summary: 'Get users' } } },
  };

  const mockJsonData = {
    openapi: '3.0.0',
    info: { title: 'Test API', version: '1.0.0' },
    paths: { '/users': { get: { summary: 'Get users' } } },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns null for empty text', () => {
    const result = convertSchema('', 'json');
    expect(result).toBeNull();
  });

  it('returns null for text with only whitespace', () => {
    const result = convertSchema('   ', 'json');
    expect(result).toBeNull();
  });

  it('returns null when parseAndDetectFormat returns null', () => {
    vi.mocked(parseAndDetectFormat).mockReturnValue(null);

    const result = convertSchema('invalid text', 'json');
    expect(result).toBeNull();
  });

  it('returns original text if current format equals target format', () => {
    const mockParseResult: ParseResult = {
      format: 'json',
      data: mockJsonData,
    };

    vi.mocked(parseAndDetectFormat).mockReturnValue(mockParseResult);

    const text = '{"test": true}';
    const result = convertSchema(text, 'json');
    expect(result).toBe(text);
  });

  it('converts YAML to JSON successfully', () => {
    const mockParseResult: ParseResult = {
      format: 'yaml',
      data: mockYamlData,
    };

    vi.mocked(parseAndDetectFormat).mockReturnValue(mockParseResult);

    const yamlText = 'openapi: 3.0.0\ninfo:\n  title: Test API';
    const result = convertSchema(yamlText, 'json');

    expect(result).not.toBeNull();
    expect(result).toContain('"openapi": "3.0.0"');
    expect(result).toContain('"title": "Test API"');
  });

  it('converts JSON to YAML successfully', () => {
    const mockParseResult: ParseResult = {
      format: 'json',
      data: mockJsonData,
    };

    vi.mocked(parseAndDetectFormat).mockReturnValue(mockParseResult);

    const jsonText = JSON.stringify(mockJsonData);
    const result = convertSchema(jsonText, 'yaml');

    expect(result).not.toBeNull();
    expect(result).toContain('openapi: 3.0.0');
    expect(result).toContain('title: Test API');
  });

  it('returns null if parsed data is not an object', () => {
    const mockParseResult: ParseResult = {
      format: 'json',
      data: 'string not object',
    };

    vi.mocked(parseAndDetectFormat).mockReturnValue(mockParseResult as unknown as ParseResult);

    const result = convertSchema('"string"', 'yaml');
    expect(result).toBeNull();
  });

  it('returns null if parsed data is null', () => {
    const mockParseResult: ParseResult = {
      format: 'yaml',
      data: null,
    };

    vi.mocked(parseAndDetectFormat).mockReturnValue(mockParseResult);

    const result = convertSchema('null', 'json');
    expect(result).toBeNull();
  });

  it('converts JSON with nested objects correctly', () => {
    const nestedData = {
      openapi: '3.0.0',
      info: {
        title: 'Nested API',
        version: '2.0.0',
        contact: {
          name: 'John Doe',
          email: 'john@example.com',
        },
      },
      paths: {
        '/users': {
          get: {
            summary: 'Get all users',
            parameters: [
              { name: 'limit', in: 'query', schema: { type: 'integer' } },
            ],
          },
        },
      },
    };

    const mockParseResult: ParseResult = {
      format: 'json',
      data: nestedData,
    };

    vi.mocked(parseAndDetectFormat).mockReturnValue(mockParseResult);

    const jsonText = JSON.stringify(nestedData);
    const result = convertSchema(jsonText, 'yaml');

    expect(result).not.toBeNull();
    expect(result).toContain('openapi: 3.0.0');
    expect(result).toContain('title: Nested API');
    expect(result).toContain('name: John Doe');
    expect(result).toContain('limit');
    expect(result).toContain('type: integer');
  });

  it('preserves indentation in YAML output', () => {
    const mockParseResult: ParseResult = {
      format: 'json',
      data: { key: 'value', nested: { inner: 'test' } },
    };

    vi.mocked(parseAndDetectFormat).mockReturnValue(mockParseResult);

    const jsonText = JSON.stringify({ key: 'value', nested: { inner: 'test' } });
    const result = convertSchema(jsonText, 'yaml');

    expect(result).toContain('key: value');
    expect(result).toContain('nested:');
    expect(result).toContain('  inner: test');
    expect(result).toContain('\n');
  });

  it('handles empty object conversion', () => {
    const mockParseResult: ParseResult = {
      format: 'json',
      data: {},
    };

    vi.mocked(parseAndDetectFormat).mockReturnValue(mockParseResult);

    const result = convertSchema('{}', 'yaml');

    expect(result).not.toBeNull();
    expect(result).toContain('{}');
  });

  describe('convertSchema edge cases (error handling)', () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });
  
    it('returns null when converted text is empty', () => {
      const mockParseResult: ParseResult = {
        format: 'yaml',
        data: { key: 'value' },
      };
  
      vi.mocked(parseAndDetectFormat).mockReturnValue(mockParseResult);
      vi.spyOn(JSON, 'stringify').mockReturnValue('   ');
  
      const result = convertSchema('key: value', 'json');
  
      expect(result).toBeNull();
    });
  
    it('returns null when conversion throws an error', () => {
      const mockParseResult: ParseResult = {
        format: 'yaml',
        data: { key: 'value' },
      };
  
      vi.mocked(parseAndDetectFormat).mockReturnValue(mockParseResult);
      vi.spyOn(JSON, 'stringify').mockImplementation(() => {
        throw new Error('Serialization failed');
      });
  
      const result = convertSchema('key: value', 'json');
  
      expect(result).toBeNull();
    });
  });
});
