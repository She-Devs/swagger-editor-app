import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DATA_FORMATS } from '@/constants';
import { OpenAPI } from 'openapi-types';
import { DataFormat } from '@/utils/parseAndDetectFormat';
import parseAndDetectFormat from '@/utils/parseAndDetectFormat';
import validateSchema from '@/utils/validateSchema';
import { convertSchema } from '@/utils/convertSchema';
import { createClient } from '@/lib/supabase/client';

export interface EditorStore {
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
        const { schema } = get();
        
        if (!schema || schema.trim().length === 0) {
          return;
        }
      
        set({ isSaving: true });
        
        try {
          const validation = await validateSchema(schema);
          const format = validation.format || get().format;
      
          set({
            errors: validation.errors,
            isValid: validation.isValid,
            validatedData: validation.data,
            format,
          });
      
          if (!validation.isValid) {  
            return;
          }
      
          const supabase = createClient();
          const { data: { user } } = await supabase.auth.getUser();
      
          if (!user) {
            return;
          }
      
          const { error } = await supabase
            .from('schemas')
            .upsert({
              user_id: user.id,
              content: schema,
              format: format,
              updated_at: new Date().toISOString(),
            }, {
              onConflict: 'user_id',
            });
      
          if (error) {
            return;
          }
      
        } catch (error) {         
          throw error;
        } finally {
          set({ isSaving: false });
        }
      },

      loadSchema: async () => {
        set({ isLoading: true });
        
        try {
          const supabase = createClient(); 
          const { data: { user } } = await supabase.auth.getUser();
          
          if (!user) {
            set({ isLoading: false });
            return;
          }
      
          const requestedUserId = user.id;

          const { data, error } = await supabase
            .from('schemas')
            .select('content, format')
            .eq('user_id', requestedUserId)
            .single();
      
          if (error && error.code !== 'PGRST116') {
            throw error;
          }
      
          if (!data) {
            get().reset();
            return;
          }

          const { data: { user: currentUser } } = await supabase.auth.getUser();
          if (currentUser?.id !== requestedUserId) {
            return;
          }

          set({
            schema: data.content,
            format: data.format || DATA_FORMATS.YAML,
          });
          await get().validate();
        } catch (error) {
          throw error;
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
