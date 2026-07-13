import { describe, it, expect, vi, beforeEach } from 'vitest';
import validateSchema from './validateSchema';
import { DATA_FORMATS } from '@/constants';
import { OpenAPIV3 } from 'openapi-types';

interface ParseResult {
  format: typeof DATA_FORMATS[keyof typeof DATA_FORMATS];
  data: unknown;
}

vi.mock('./parseAndDetectFormat', () => ({
  default: vi.fn(),
}));

vi.mock('@apidevtools/swagger-parser', () => ({
  default: {
    validate: vi.fn(),
  },
}));

import parseAndDetectFormat from './parseAndDetectFormat';
import SwaggerParser from '@apidevtools/swagger-parser';

describe('validateSchema', () => {
  const validYaml = `
    openapi: 3.0.0
    info:
      title: Test API
      version: 1.0.0
    paths:
      /users:
        get:
          summary: Get users
          responses:
            '200':
              description: Success
  `;

  const validJson = JSON.stringify({
    openapi: '3.0.0',
    info: { title: 'Test API', version: '1.0.0' },
    paths: {
      '/users': {
        get: {
          summary: 'Get users',
          responses: { '200': { description: 'Success' } },
        },
      },
    },
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('validates correct YAML schema', async () => {
    const mockData: OpenAPIV3.Document = {
      openapi: '3.0.0',
      info: { title: 'Test', version: '1.0.0' },
      paths: {},
    };

    const mockParsed: ParseResult = {
      format: DATA_FORMATS.YAML,
      data: mockData,
    };

    vi.mocked(parseAndDetectFormat).mockReturnValue(mockParsed);
    vi.mocked(SwaggerParser.validate).mockResolvedValue(mockData);

    const result = await validateSchema(validYaml);

    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.data).toEqual(mockData);
    expect(result.format).toBe(DATA_FORMATS.YAML);
  });

  it('validates correct JSON schema', async () => {
    const mockData: OpenAPIV3.Document = {
      openapi: '3.0.0',
      info: { title: 'Test', version: '1.0.0' },
      paths: {},
    };

    const mockParsed: ParseResult = {
      format: DATA_FORMATS.JSON,
      data: mockData,
    };

    vi.mocked(parseAndDetectFormat).mockReturnValue(mockParsed);
    vi.mocked(SwaggerParser.validate).mockResolvedValue(mockData);

    const result = await validateSchema(validJson);

    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.format).toBe(DATA_FORMATS.JSON);
  });

  it('returns error when parse fails', async () => {
    vi.mocked(parseAndDetectFormat).mockReturnValue(null);

    const result = await validateSchema('invalid text');

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Failed to parse schema. Check JSON or YAML syntax.');
    expect(result.data).toBeNull();
    expect(result.format).toBeNull();
  });

  it('returns error when parsed data is not an object', async () => {
    const mockParsed: ParseResult = {
      format: DATA_FORMATS.YAML,
      data: 'string instead of object',
    };

    vi.mocked(parseAndDetectFormat).mockReturnValue(mockParsed as unknown as ParseResult);

    const result = await validateSchema('some text');

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Schema must be an object');
    expect(result.data).toBeNull();
    expect(result.format).toBe(DATA_FORMATS.YAML);
  });

  it('returns error when SwaggerParser validation fails', async () => {
    const mockData = { invalid: 'schema' };
    const mockParsed: ParseResult = {
      format: DATA_FORMATS.YAML,
      data: mockData,
    };
    const mockError = new Error('Missing required property: info');

    vi.mocked(parseAndDetectFormat).mockReturnValue(mockParsed);
    vi.mocked(SwaggerParser.validate).mockRejectedValue(mockError);

    const result = await validateSchema('invalid schema');

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Missing required property: info');
    expect(result.data).toBeNull();
    expect(result.format).toBe(DATA_FORMATS.YAML);
  });

  it('handles non-Error errors gracefully', async () => {
    const mockData = { invalid: 'schema' };
    const mockParsed: ParseResult = {
      format: DATA_FORMATS.YAML,
      data: mockData,
    };

    vi.mocked(parseAndDetectFormat).mockReturnValue(mockParsed);
    vi.mocked(SwaggerParser.validate).mockRejectedValue('String error');

    const result = await validateSchema('invalid schema');

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('OpenAPI schema validation error');
    expect(result.data).toBeNull();
  });

  it('handles empty text input', async () => {
    vi.mocked(parseAndDetectFormat).mockReturnValue(null);

    const result = await validateSchema('');

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Failed to parse schema. Check JSON or YAML syntax.');
    expect(result.data).toBeNull();
  });

  it('preserves format when validation fails', async () => {
    const mockData = { invalid: 'schema' };
    const mockParsed: ParseResult = {
      format: DATA_FORMATS.JSON,
      data: mockData,
    };

    vi.mocked(parseAndDetectFormat).mockReturnValue(mockParsed);
    vi.mocked(SwaggerParser.validate).mockRejectedValue(new Error('Validation error'));

    const result = await validateSchema('invalid json');

    expect(result.format).toBe(DATA_FORMATS.JSON);
  });
});
