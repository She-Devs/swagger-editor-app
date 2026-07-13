import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useEditorStore } from './useEditorStore';
import { DATA_FORMATS } from '@/constants';
import { OpenAPIV3 } from 'openapi-types';

interface ParseResult {
  format: typeof DATA_FORMATS[keyof typeof DATA_FORMATS];
  data: unknown;
}

interface MockValidationResult {
  isValid: boolean;
  errors: string[];
  data: OpenAPIV3.Document | null;
  format: typeof DATA_FORMATS[keyof typeof DATA_FORMATS] | null;
}

vi.mock('@/utils/parseAndDetectFormat', () => ({
  default: vi.fn(),
}));

vi.mock('@/utils/validateSchema', () => ({
  default: vi.fn(),
}));

vi.mock('@/utils/convertSchema', () => ({
  convertSchema: vi.fn(),
}));

vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(),
}));

import parseAndDetectFormat from '@/utils/parseAndDetectFormat';
import validateSchema from '@/utils/validateSchema';
import { convertSchema } from '@/utils/convertSchema';
import { createClient } from '@/lib/supabase/client';

function createMockOpenAPIV3Document(overrides: Partial<OpenAPIV3.Document> = {}): OpenAPIV3.Document {
  return {
    openapi: '3.0.0',
    info: {
      title: 'Test API',
      version: '1.0.0',
      description: 'Test description',
      ...(overrides.info || {}),
    },
    paths: {},
    ...overrides,
  };
}

describe('useEditorStore', () => {
  beforeEach(() => {
    vi.resetAllMocks();

    useEditorStore.setState({
      schema: '',
      format: DATA_FORMATS.YAML,
      errors: [],
      isValid: false,
      validatedData: null,
      isLoading: false,
      isSaving: false,
    });
  });

  describe('initial state', () => {
    it('should have correct initial values', () => {
      const state = useEditorStore.getState();
      expect(state.schema).toBe('');
      expect(state.format).toBe(DATA_FORMATS.YAML);
      expect(state.errors).toEqual([]);
      expect(state.isValid).toBe(false);
      expect(state.validatedData).toBeNull();
      expect(state.isLoading).toBe(false);
      expect(state.isSaving).toBe(false);
    });
  });

  describe('setSchema', () => {
    it('should update schema and detect format', () => {
      const { setSchema } = useEditorStore.getState();
      const mockParseResult: ParseResult = {
        format: DATA_FORMATS.JSON,
        data: { test: true },
      };

      vi.mocked(parseAndDetectFormat).mockReturnValue(mockParseResult);

      setSchema('{"test": true}');

      const state = useEditorStore.getState();
      expect(state.schema).toBe('{"test": true}');
      expect(state.format).toBe(DATA_FORMATS.JSON);
    });

    it('should update schema but keep format when parse fails', () => {
      const { setSchema } = useEditorStore.getState();
      vi.mocked(parseAndDetectFormat).mockReturnValue(null);

      setSchema('invalid text');

      const state = useEditorStore.getState();
      expect(state.schema).toBe('invalid text');
      expect(state.format).toBe(DATA_FORMATS.YAML);
    });
  });

  describe('setFormat', () => {
    it('should update format', () => {
      const { setFormat } = useEditorStore.getState();
      setFormat(DATA_FORMATS.JSON);

      const state = useEditorStore.getState();
      expect(state.format).toBe(DATA_FORMATS.JSON);
    });
  });

  describe('validate', () => {
    it('should clear errors when schema is empty', async () => {
      const { validate } = useEditorStore.getState();

      await validate();

      const state = useEditorStore.getState();
      expect(state.errors).toEqual([]);
      expect(state.isValid).toBe(false);
      expect(state.validatedData).toBeNull();
    });

    it('should validate schema and update state', async () => {
      const { setSchema, validate } = useEditorStore.getState();
      const mockData = createMockOpenAPIV3Document();
      const mockResult: MockValidationResult = {
        isValid: true,
        errors: [],
        data: mockData,
        format: DATA_FORMATS.YAML,
      };

      vi.mocked(validateSchema).mockResolvedValue(mockResult);

      setSchema('openapi: 3.0.0');
      await validate();

      const state = useEditorStore.getState();
      expect(state.isValid).toBe(true);
      expect(state.errors).toEqual([]);
      expect(state.validatedData).toEqual(mockData);
    });

    it('should set isLoading during validation', async () => {
      const { setSchema, validate } = useEditorStore.getState();
      const mockData = createMockOpenAPIV3Document();

      vi.mocked(validateSchema).mockImplementation(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        const result: MockValidationResult = {
          isValid: true,
          errors: [],
          data: mockData,
          format: DATA_FORMATS.YAML,
        };
        return result;
      });

      setSchema('openapi: 3.0.0');

      const validatePromise = validate();
      expect(useEditorStore.getState().isLoading).toBe(true);

      await validatePromise;
      expect(useEditorStore.getState().isLoading).toBe(false);
    });
  });

  describe('convert', () => {
    it('should convert JSON to YAML when current format is JSON', () => {
      const { setSchema, setFormat, convert } = useEditorStore.getState();
      vi.mocked(convertSchema).mockReturnValue('converted: yaml');

      setSchema('{"test": true}');
      setFormat(DATA_FORMATS.JSON);
      convert();

      const state = useEditorStore.getState();
      expect(state.schema).toBe('converted: yaml');
      expect(state.format).toBe(DATA_FORMATS.YAML);
      expect(convertSchema).toHaveBeenCalledWith('{"test": true}', 'yaml');
    });

    it('should convert YAML to JSON when current format is YAML', () => {
      const { setSchema, setFormat, convert } = useEditorStore.getState();
      vi.mocked(convertSchema).mockReturnValue('{"converted": "json"}');

      setSchema('test: yaml');
      setFormat(DATA_FORMATS.YAML);
      convert();

      const state = useEditorStore.getState();
      expect(state.schema).toBe('{"converted": "json"}');
      expect(state.format).toBe(DATA_FORMATS.JSON);
      expect(convertSchema).toHaveBeenCalledWith('test: yaml', 'json');
    });

    it('should not update state when conversion returns null', () => {
      const { setSchema, setFormat, convert } = useEditorStore.getState();
      vi.mocked(convertSchema).mockReturnValue(null);

      setSchema('test: yaml');
      setFormat(DATA_FORMATS.YAML);

      const previousState = useEditorStore.getState();
      convert();

      const state = useEditorStore.getState();
      expect(state.schema).toBe(previousState.schema);
      expect(state.format).toBe(previousState.format);
    });
  });

  describe('reset', () => {
    it('should reset to initial state', () => {
      const { setSchema, reset } = useEditorStore.getState();

      setSchema('test');
      reset();

      const state = useEditorStore.getState();
      expect(state.schema).toBe('');
      expect(state.format).toBe(DATA_FORMATS.YAML);
      expect(state.errors).toEqual([]);
      expect(state.isValid).toBe(false);
      expect(state.validatedData).toBeNull();
    });
  });

  describe('saveSchema', () => {
    beforeEach(() => {
      vi.mocked(createClient).mockReset();
    });

    const mockUser = { id: 'user-1', email: 'test@test.com' };
  
    function createMockSupabase(overrides: Partial<{ user: typeof mockUser | null; upsertError: Error | null }> = {}) {
      const user = overrides.user !== undefined ? overrides.user : mockUser;
      const upsertError = overrides.upsertError || null;
  
      return {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user } }),
        },
        from: vi.fn().mockReturnValue({
          upsert: vi.fn().mockResolvedValue({ error: upsertError }),
        }),
      };
    }
  
    beforeEach(() => {
      vi.mocked(createClient).mockReset();
    });
  
    it('should throw error when schema is empty', async () => {
      const { saveSchema } = useEditorStore.getState();
      await expect(saveSchema()).rejects.toThrow('Schema is empty');
    });
  
    it('should validate schema before saving', async () => {
      const { setSchema, saveSchema } = useEditorStore.getState();
      const mockData = createMockOpenAPIV3Document();
      const mockValidation: MockValidationResult = {
        isValid: true,
        errors: [],
        data: mockData,
        format: DATA_FORMATS.YAML,
      };
  
      vi.mocked(validateSchema).mockResolvedValue(mockValidation);
      vi.mocked(createClient).mockReturnValue(createMockSupabase() as never);
  
      setSchema('openapi: 3.0.0');
      await saveSchema();
  
      expect(validateSchema).toHaveBeenCalledWith('openapi: 3.0.0');
    });
  
    it('should throw error when schema is invalid', async () => {
      const { setSchema, saveSchema } = useEditorStore.getState();
      const mockValidation: MockValidationResult = {
        isValid: false,
        errors: ['Invalid schema'],
        data: null,
        format: DATA_FORMATS.YAML,
      };
  
      vi.mocked(validateSchema).mockResolvedValue(mockValidation);
  
      setSchema('invalid');
      await expect(saveSchema()).rejects.toThrow('Schema is invalid');
    });
  
    it('should throw error when user is not authenticated', async () => {
      const { setSchema, saveSchema } = useEditorStore.getState();
      const mockData = createMockOpenAPIV3Document();
      const mockValidation: MockValidationResult = {
        isValid: true,
        errors: [],
        data: mockData,
        format: DATA_FORMATS.YAML,
      };
  
      vi.mocked(validateSchema).mockResolvedValue(mockValidation);
      vi.mocked(createClient).mockReturnValue(createMockSupabase({ user: null }) as never);
  
      setSchema('openapi: 3.0.0');
      await expect(saveSchema()).rejects.toThrow('User is not authenticated');
    });
  
    it('should set isSaving during save operation', async () => {
      const { setSchema, saveSchema } = useEditorStore.getState();
      const mockData = createMockOpenAPIV3Document();
      const mockValidation: MockValidationResult = {
        isValid: true,
        errors: [],
        data: mockData,
        format: DATA_FORMATS.YAML,
      };
  
      vi.mocked(validateSchema).mockResolvedValue(mockValidation);
  
      let isSavingCheck = false;
      const mockSupabaseWithDelay = {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: mockUser } }),
        },
        from: vi.fn().mockReturnValue({
          upsert: vi.fn().mockImplementation(async () => {
            isSavingCheck = true;
            await new Promise((resolve) => setTimeout(resolve, 10));
            return { error: null };
          }),
        }),
      };
      vi.mocked(createClient).mockReturnValue(mockSupabaseWithDelay as never);
  
      setSchema('openapi: 3.0.0');
  
      const savePromise = saveSchema();
      expect(useEditorStore.getState().isSaving).toBe(true);
  
      await savePromise;
      expect(useEditorStore.getState().isSaving).toBe(false);
      expect(isSavingCheck).toBe(true);
    });
  });

  describe('loadSchema', () => {
    const mockUser = { id: 'user-1', email: 'test@test.com' };

    beforeEach(() => {
      vi.mocked(validateSchema).mockReset();
      vi.mocked(createClient).mockReset();
    });

    it('should not load when user is not authenticated', async () => {
      const { loadSchema } = useEditorStore.getState();

      const mockSupabaseWithoutUser = {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
        },
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      };
      vi.mocked(createClient).mockReturnValue(mockSupabaseWithoutUser as never);

      await loadSchema();
      expect(useEditorStore.getState().isLoading).toBe(false);
    });

    it('should load schema and validate it', async () => {
      const { loadSchema } = useEditorStore.getState();
      const mockData = {
        content: 'openapi: 3.0.0\ninfo:\n  title: Test',
        format: DATA_FORMATS.YAML,
      };

      const mockValidatedData = createMockOpenAPIV3Document();
      vi.mocked(validateSchema).mockResolvedValue({
        isValid: true,
        errors: [],
        data: mockValidatedData,
        format: DATA_FORMATS.YAML,
      });

      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: mockUser } }),
        },
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          maybeSingle: vi.fn().mockResolvedValue({
            data: mockData,
            error: null,
          }),
        }),
      };
      vi.mocked(createClient).mockReturnValue(mockSupabase as never);

      const validateSpy = vi.spyOn(useEditorStore.getState(), 'validate');

      await loadSchema();

      const state = useEditorStore.getState();
      expect(state.schema).toBe(mockData.content);
      expect(state.format).toBe(DATA_FORMATS.YAML);
      expect(validateSpy).toHaveBeenCalled();
    });

    it('should reset when no saved schema found', async () => {
      const { loadSchema, setSchema } = useEditorStore.getState();

      setSchema('existing schema');

      vi.mocked(validateSchema).mockResolvedValue({
        isValid: true,
        errors: [],
        data: createMockOpenAPIV3Document(),
        format: DATA_FORMATS.YAML,
      });

      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: mockUser } }),
        },
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          maybeSingle: vi.fn().mockResolvedValue({
            data: null,
            error: null,
          }),
        }),
      };
      vi.mocked(createClient).mockReturnValue(mockSupabase as never);

      const resetSpy = vi.spyOn(useEditorStore.getState(), 'reset');

      await loadSchema();

      expect(resetSpy).toHaveBeenCalled();
    });

    it('should set isLoading during load', async () => {
      const { loadSchema } = useEditorStore.getState();

      vi.mocked(validateSchema).mockResolvedValue({
        isValid: true,
        errors: [],
        data: createMockOpenAPIV3Document(),
        format: DATA_FORMATS.YAML,
      });

      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: mockUser } }),
        },
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          maybeSingle: vi.fn().mockImplementation(async () => {
            await new Promise((resolve) => setTimeout(resolve, 10));
            return { data: null, error: null };
          }),
        }),
      };
      vi.mocked(createClient).mockReturnValue(mockSupabase as never);

      const loadPromise = loadSchema();
      expect(useEditorStore.getState().isLoading).toBe(true);

      await loadPromise;
      expect(useEditorStore.getState().isLoading).toBe(false);
    });
  });
});
