import { describe, it, expect, vi } from 'vitest';
import {
  getInitialBodyText,
  buildRequestUrl,
  buildRequest,
  getServerUrl,
  buildCurl,
} from './utils';
import type { LocalBodyContent } from './types';

import * as sampler from 'openapi-sampler';

describe('utils.ts', () => {
  
  describe('getInitialBodyText', () => {
    it('should return empty string if inputs are invalid', () => {
      expect(getInitialBodyText(undefined, 'application/json')).toBe('');
      expect(getInitialBodyText({}, null)).toBe('');
      expect(getInitialBodyText({}, 'application/json')).toBe('');
    });

    it('should return single mediaType example if present', () => {
      const bodyContent: Record<string, LocalBodyContent> = {
        'application/json': { example: { username: 'bob' } },
      };
      expect(getInitialBodyText(bodyContent, 'application/json')).toContain('bob');
    });

    it('should fallback to first example value from examples object', () => {
      const bodyContent: Record<string, LocalBodyContent> = {
        'application/json': {
          examples: { first: { value: { username: 'alice' } } },
        },
      };
      expect(getInitialBodyText(bodyContent, 'application/json')).toContain('alice');
    });



    it('should return empty string if schema sampling throws an error', () => {
      vi.spyOn(sampler, 'sample').mockImplementationOnce(() => {
        throw new Error('Sampling failed');
      });

      const bodyContent: Record<string, LocalBodyContent> = {
        'application/json': { schema: { type: 'object' } },
      };
      expect(getInitialBodyText(bodyContent, 'application/json')).toBe('');
    });

    it('should return empty string if no example, examples, or schema exists', () => {
      const bodyContent: Record<string, LocalBodyContent> = {
        'application/json': {},
      };
      expect(getInitialBodyText(bodyContent, 'application/json')).toBe('');
    });

    it('should return cleanDataObject directly if it is already a string', () => {
      const bodyContent: Record<string, LocalBodyContent> = {
        'text/plain': { example: 'just-raw-string' },
      };
      expect(getInitialBodyText(bodyContent, 'text/plain')).toBe('just-raw-string');
    });

    it('should correctly format XML data if content-type includes xml', () => {
      const bodyContent: Record<string, LocalBodyContent> = {
        'application/xml': {
          example: { id: '123' },
          schema: { xml: { name: 'UserRequest' } },
        },
      };
      const result = getInitialBodyText(bodyContent, 'application/xml');
      expect(result).toContain('<UserRequest>');
      expect(result).toContain('<id>123</id>');
    });

    it('should fallback to root tag name in XML if schema xml name is absent', () => {
      const bodyContent: Record<string, LocalBodyContent> = {
        'application/xml': {
          example: { id: '123' },
          schema: {},
        },
      };
      const result = getInitialBodyText(bodyContent, 'application/xml');
      expect(result).toContain('<root>');
    });
  });

  describe('buildRequestUrl', () => {
    it('should interpolate path params and build valid URL', () => {
      const path = '/users/{id}/posts/{postId}';
      const pathParams = { id: ' 123 ', postId: '456' };
      const queryParams = {};
      const serverUrl = 'https://api.test.com/';

      const result = buildRequestUrl(path, pathParams, queryParams, serverUrl);
      
      expect(result).toBe('https://api.test.com/users/123/posts/456');
    });

    it('should append query parameters and support comma-separated arrays', () => {
      const path = '/search';
      const pathParams = {};
      const queryParams = { q: 'react', tags: 'frontend, openapi, ', empty: '   ' };
      const serverUrl = 'https://api.test.com';

      const result = buildRequestUrl(path, pathParams, queryParams, serverUrl);
      const url = new URL(result);
      
      expect(url.searchParams.get('q')).toBe('react');
      expect(url.searchParams.getAll('tags')).toEqual(['frontend', 'openapi']);
      expect(url.searchParams.has('empty')).toBe(false);
    });
  });

  describe('buildRequest', () => {
    it('should clean headers with empty values and format proxy request structure', () => {
      const params = {
        url: 'https://example.com',
        method: 'post',
        headers: {
          Authorization: 'Bearer token',
          'X-Empty': '   ',
        },
        body: '  {"data": 1}  ',
      };

      const result = buildRequest(params);
      expect(result.method).toBe('POST');
      expect(result.headers).toEqual({ Authorization: 'Bearer token' });
      expect(result.body).toBe('{"data": 1}');
    });

    it('should set body to undefined if it is empty after trimming', () => {
      const params = {
        url: 'https://example.com',
        method: 'GET',
        headers: {},
        body: '    ',
      };
      const result = buildRequest(params);
      expect(result.body).toBeUndefined();
    });
  });

  describe('getServerUrl', () => {
    it('should return empty string for invalid schemas', () => {
      expect(getServerUrl(null)).toBe('');
      expect(getServerUrl('not-an-object')).toBe('');
      expect(getServerUrl({})).toBe('');
    });

    it('should return the first server url from schema definition', () => {
      const schema = {
        servers: [
          { url: 'https://server1.com' },
          { url: 'https://server2.com' },
        ],
      };
      expect(getServerUrl(schema)).toBe('https://server1.com');
    });
  });

  describe('buildCurl', () => {
    it('should append data payload flag for non-GET/HEAD methods when body is present', () => {
      const params = {
        url: 'https://example.com',
        method: 'POST',
        headers: {},
        body: '{"foo":"bar"}',
      };

      const result = buildCurl(params);
      expect(result).toContain('-d \'{"foo":"bar"}\'');
    });

    it('should skip data payload flag for GET methods even if body is provided', () => {
      const params = {
        url: 'https://example.com',
        method: 'GET',
        headers: {},
        body: '{"foo":"bar"}',
      };

      const result = buildCurl(params);
      expect(result).not.toContain('-d');
    });
  });
});
