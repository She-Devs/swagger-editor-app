import { DATA_FORMATS } from '@/constants';
import SwaggerParser from '@apidevtools/swagger-parser';
import type { OpenAPI } from 'openapi-types';
import parseAndDetectFormat from './parseAndDetectFormat';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  data: unknown;
  format: typeof DATA_FORMATS[keyof typeof DATA_FORMATS] | null;
}

export default async function validateSchema(text: string): Promise<ValidationResult> {
  const parseResult = parseAndDetectFormat(text);

  if (!parseResult) {
    return {
      isValid: false,
      errors: ['Не удалось распарсить схему'],
      data: null,
      format: null,
    };
  }

  const { format, data } = parseResult;

  if (!data || typeof data !== 'object') {
    return {
      isValid: false,
      errors: ['Схема должна быть объектом'],
      data: null,
      format,
    };
  }

  try {
    const validated = await SwaggerParser.validate(data as unknown as OpenAPI.Document);
    return {
      isValid: true,
      errors: [],
      data: validated,
      format,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Ошибка валидации OpenAPI схемы';
    return {
      isValid: false,
      errors: [message],
      data: null,
      format,
    };
  }
}
