import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DATA_FORMATS } from '@/constants';
import { OpenAPI } from 'openapi-types';
import { DataFormat } from '@/utils/parseAndDetectFormat';
import parseAndDetectFormat from '@/utils/parseAndDetectFormat';
import validateSchema from '@/utils/validateSchema';
import { convertSchema } from '@/utils/convertSchema';

interface EditorStore {
  schema: string;
  format: DataFormat;
  errors: string[];
  isValid: boolean;
  validatedData: OpenAPI.Document | null;
  isLoading: boolean;
  isSaving: boolean;
  
  setSchema: (text: string) => void;
  setFormat: (format: DataFormat) => void;
  validate: () => Promise<void>;
  convert: () => void;
  saveSchema: () => Promise<void>;
  loadSchema: () => Promise<void>;
  reset: () => void;
}

export const useEditorStore = create<EditorStore>()(
  persist(
    (set, get) => ({
      schema: '',
      format: DATA_FORMATS.YAML,
      errors: [],
      isValid: false,
      validatedData: null,
      isLoading: false,
      isSaving: false,

      setSchema: (text: string) => {
        set({ schema: text });
        
        const parseResult = parseAndDetectFormat(text);
        if (parseResult) {
          set({ format: parseResult.format });
        }
      },

      setFormat: (format: DataFormat) => {
        set({ format });
      },

      validate: async () => {
        const { schema } = get();
        
        if (!schema || schema.trim().length === 0) {
          set({
            errors: [],
            isValid: false,
            validatedData: null,
          });
          return;
        }

        set({ isLoading: true });
        
        try {
          const result = await validateSchema(schema);
          set({
            errors: result.errors,
            isValid: result.isValid,
            validatedData: result.data,
            format: result.format || get().format,
          });
        } finally {
          set({ isLoading: false });
        }
      },

      convert: () => {
        const { schema, format } = get();
        const targetFormat = format === DATA_FORMATS.JSON 
          ? DATA_FORMATS.YAML 
          : DATA_FORMATS.JSON;
        
        const converted = convertSchema(schema, targetFormat);
        
        if (converted) {
          set({
            schema: converted,
            format: targetFormat,
          });
        
        }
      },

      saveSchema: async () => {
        const {isValid } = get();
        
        if (!isValid) {
          return;
        }

        set({ isSaving: true });
        
        try {
          // TODO: Feature 3 - Saving schema (для auth users)
          
          await new Promise(resolve => setTimeout(resolve, 500));
        } finally {
          set({ isSaving: false });
        }
      },

      loadSchema: async () => {
        set({ isLoading: true });
        
        try {
          // TODO: Feature 3 - Restore schema after login
           
          // Временные данные для теста
          const data = {
            schema: 'openapi: 3.0.0\ninfo:\n  title: Test API\n  version: 1.0.0\npaths:\n  /users:\n    get:\n      summary: Get users\n      responses:\n        "200":\n          description: Success',
            format: DATA_FORMATS.YAML,
          };
          
          set({
            schema: data.schema,
            format: data.format,
          });
          
          await get().validate();
        } finally {
          set({ isLoading: false });
        }
      },

      reset: () => {
        set({
          schema: '',
          format: DATA_FORMATS.YAML,
          errors: [],
          isValid: false,
          validatedData: null,
        });
      },
    }),
    {
      name: 'editor-storage',
      partialize: (state) => ({
        schema: state.schema,
        format: state.format,
      }),
    }
  )
);
