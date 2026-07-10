import type { OAParameter } from '../ViewerPanel/types';

export interface ResponseState {
  status: number;
  headers: Record<string, string>;
  body: string;
  requestUrl: string;
}

export interface GroupedParameters {
  path: OAParameter[];
  query: OAParameter[];
  header: OAParameter[];
  cookie: OAParameter[];
}

export interface LocalBodyContent {
  schema?: Record<string, unknown>;
  example?: unknown;
  examples?: Record<string, { value?: unknown }>;
}

export interface TryItOutPanelProps {
  method: string;
  path: string;
  operation: {
    summary?: string;
    description?: string;
    operationId?: string;
    parameters?: OAParameter[];
    requestBody?: {
      description?: string;
      required?: boolean;
      content?: Record<string, LocalBodyContent>;
    };
    responses?: Record<string, unknown>;
  };
  servers?: {
    url: string;
    description?: string;
  }[];
}
