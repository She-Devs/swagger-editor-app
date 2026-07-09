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

export const METHOD_COLORS: Record<string, string> = {
  get: 'teal',
  post: 'blue',
  put: 'orange',
  delete: 'red',
  patch: 'yellow',
  options: 'gray',
  head: 'gray',
  trace: 'gray',
};

export const HTTP_METHODS = ['get', 'post', 'put', 'delete', 'patch', 'options', 'head', 'trace'];
