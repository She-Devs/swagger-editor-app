import { describe, it, expect, vi } from 'vitest';
import parseAndDetectFormat from './parseAndDetectFormat';
import { DATA_FORMATS } from '@/constants';

vi.mock('js-yaml', async (importOriginal) => {
  const actual = await importOriginal<typeof import('js-yaml')>();
  return {
    ...actual,
    load: vi.fn(),
  };
});

import * as yaml from 'js-yaml';

describe('parseAndDetectFormat', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns null for empty string', () => {
    const result = parseAndDetectFormat('');
    expect(result).toBeNull();
  });

  it('returns null for string with only whitespace', () => {
    const result = parseAndDetectFormat('   ');
    expect(result).toBeNull();
  });

  it('detects JSON format with valid JSON', () => {
    const jsonText = '{"openapi": "3.0.0", "info": {"title": "Test"}}';
    const result = parseAndDetectFormat(jsonText);

    expect(result).not.toBeNull();
    expect(result?.format).toBe(DATA_FORMATS.JSON);
    expect(result?.data).toEqual({
      openapi: '3.0.0',
      info: { title: 'Test' },
    });
  });

  it('detects JSON format with valid JSON array', () => {
    const jsonText = '[{"name": "test"}, {"name": "test2"}]';
    const result = parseAndDetectFormat(jsonText);

    expect(result).not.toBeNull();
    expect(result?.format).toBe(DATA_FORMATS.JSON);
    expect(result?.data).toEqual([{ name: 'test' }, { name: 'test2' }]);
  });

  it('detects YAML format with valid YAML', () => {
    const yamlText = 'openapi: 3.0.0\ninfo:\n  title: Test API\n  version: 1.0.0';
    const mockYamlData = {
      openapi: '3.0.0',
      info: { title: 'Test API', version: '1.0.0' },
    };

    vi.mocked(yaml.load).mockReturnValue(mockYamlData);

    const result = parseAndDetectFormat(yamlText);

    expect(result).not.toBeNull();
    expect(result?.format).toBe(DATA_FORMATS.YAML);
    expect(result?.data).toEqual(mockYamlData);
    expect(yaml.load).toHaveBeenCalledWith(yamlText);
  });

  it('detects YAML format when JSON parsing fails', () => {
    const yamlText = 'openapi: 3.0.0';
    const mockYamlData = { openapi: '3.0.0' };

    vi.mocked(yaml.load).mockReturnValue(mockYamlData);

    const result = parseAndDetectFormat(yamlText);

    expect(result).not.toBeNull();
    expect(result?.format).toBe(DATA_FORMATS.YAML);
    expect(result?.data).toEqual(mockYamlData);
  });

  it('returns null when both JSON and YAML parsing fail', () => {
    const invalidText = 'this is not valid json or yaml!!!';

    vi.mocked(yaml.load).mockImplementation(() => {
      throw new Error('Invalid YAML');
    });

    const result = parseAndDetectFormat(invalidText);

    expect(result).toBeNull();
  });

  it('handles YAML with complex nested objects', () => {
    const yamlText = `
      openapi: 3.0.0
      info:
        title: Complex API
        version: 2.0.0
        contact:
          name: John Doe
          email: john@example.com
      paths:
        /users:
          get:
            summary: Get users
            responses:
              '200':
                description: Success
    `;

    const mockYamlData = {
      openapi: '3.0.0',
      info: {
        title: 'Complex API',
        version: '2.0.0',
        contact: {
          name: 'John Doe',
          email: 'john@example.com',
        },
      },
      paths: {
        '/users': {
          get: {
            summary: 'Get users',
            responses: {
              '200': {
                description: 'Success',
              },
            },
          },
        },
      },
    };

    vi.mocked(yaml.load).mockReturnValue(mockYamlData);

    const result = parseAndDetectFormat(yamlText);

    expect(result).not.toBeNull();
    expect(result?.format).toBe(DATA_FORMATS.YAML);
    expect(result?.data).toEqual(mockYamlData);
  });

  it('parses JSON with nested objects correctly', () => {
    const jsonText = JSON.stringify({
      openapi: '3.0.0',
      info: {
        title: 'Nested API',
        version: '2.0.0',
        contact: {
          name: 'Jane Doe',
          email: 'jane@example.com',
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
    });

    const result = parseAndDetectFormat(jsonText);

    expect(result).not.toBeNull();
    expect(result?.format).toBe(DATA_FORMATS.JSON);
    expect(result?.data).toBeDefined();
    expect((result?.data as { openapi: string }).openapi).toBe('3.0.0');
    expect((result?.data as { info: { title: string } }).info.title).toBe('Nested API');
  });

  it('handles YAML with arrays', () => {
    const yamlText = `
      users:
        - name: Alice
          age: 30
        - name: Bob
          age: 25
    `;

    const mockYamlData = {
      users: [
        { name: 'Alice', age: 30 },
        { name: 'Bob', age: 25 },
      ],
    };

    vi.mocked(yaml.load).mockReturnValue(mockYamlData);

    const result = parseAndDetectFormat(yamlText);

    expect(result).not.toBeNull();
    expect(result?.format).toBe(DATA_FORMATS.YAML);
    expect(result?.data).toEqual(mockYamlData);
  });

  it('handles YAML with null values', () => {
    const yamlText = 'key: null\nname: test';
    const mockYamlData = { key: null, name: 'test' };

    vi.mocked(yaml.load).mockReturnValue(mockYamlData);

    const result = parseAndDetectFormat(yamlText);

    expect(result).not.toBeNull();
    expect(result?.format).toBe(DATA_FORMATS.YAML);
    expect(result?.data).toEqual(mockYamlData);
  });

  it('handles YAML with boolean values', () => {
    const yamlText = 'enabled: true\nactive: false';
    const mockYamlData = { enabled: true, active: false };

    vi.mocked(yaml.load).mockReturnValue(mockYamlData);

    const result = parseAndDetectFormat(yamlText);

    expect(result).not.toBeNull();
    expect(result?.format).toBe(DATA_FORMATS.YAML);
    expect(result?.data).toEqual(mockYamlData);
  });
});
