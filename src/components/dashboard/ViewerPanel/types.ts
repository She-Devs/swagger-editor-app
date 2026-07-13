export type OAParameter = {
  name: string;
  in: string;
  required?: boolean;
  description?: string;
  schema?: Record<string, unknown>;
};

export type OAResponse = {
  description?: string;
  content?: Record<string, { 
    schema?: Record<string, unknown>;
    examples?: Record<string, { value?: unknown }>;
  }>;
};

export type OAOperation = {
  summary?: string;
  description?: string;
  operationId?: string;
  parameters?: OAParameter[];
  requestBody?: {
    description?: string;
    required?: boolean;
    content?: Record<string, {
      schema?: Record<string, unknown>;
      examples?: Record<string, { value?: unknown }>;
    }>;
  };
  responses?: Record<string, OAResponse>;
};
