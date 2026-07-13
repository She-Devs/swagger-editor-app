'use client';

import { useMemo, useState } from 'react';
import type { OAOperation } from '../ViewerPanel/types';
import type { LocalBodyContent, ResponseState } from './types';
import { useEditorStore } from '@/store/useEditorStore';
import { createClient } from '@/lib/supabase/client';
import {
  buildCurl,
  buildRequest,
  buildRequestUrl,
  type ProxyRequest,
  getInitialBodyText,
  getServerUrl,
} from './utils';

interface UseTryItOutParams {
  method: string;
  path: string;
  operation: OAOperation;
}

function getByteSize(value: string | undefined): number {
  return new TextEncoder().encode(value ?? '').length;
}

function getStatusCode(response: ResponseState | null): number | null {
  return typeof response?.status === 'number' ? response.status : null;
}

export function useTryItOut({ method, path, operation }: UseTryItOutParams) {
  const validatedData = useEditorStore((state) => state.validatedData);
  const serverUrl = getServerUrl(validatedData);

  const parameters = useMemo(() => operation.parameters ?? [], [operation.parameters]);

  const grouped = useMemo(() => ({
    path: parameters.filter((p) => p.in === 'path'),
    query: parameters.filter((p) => p.in === 'query'),
    header: parameters.filter((p) => p.in === 'header'),
    cookie: parameters.filter((p) => p.in === 'cookie'),
  }), [parameters]);

  const bodyContent = (operation.requestBody?.content as Record<string, LocalBodyContent>) ?? {};
  const [values, setValues] = useState<Record<string, string>>({});
  const [body, setBody] = useState(() => 
    getInitialBodyText(bodyContent, 'application/json')
  );
  
  const [response, setResponse] = useState<ResponseState | null>(null);
  const [errorOutput, setErrorOutput] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [requestUrl, setRequestUrl] = useState<string | null>(null);
  const [curl, setCurl] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const getParamValue = (inType: string, name: string) => values[`${inType}_${name}`] ?? '';

  async function saveRequestHistory(
    request: ProxyRequest,
    response: ResponseState | null,
    durationMs: number,
    errorDetails: string | null = null
  ) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return;
    }

    const requestPayload = JSON.stringify({
      headers: request.headers,
      body: request.body ?? '',
    });

    const { error } = await supabase
      .from('requests_history')
      .insert({
        user_id: user.id,
        url: request.url,
        method: request.method,
        status_code: getStatusCode(response),
        duration_ms: durationMs,
        request_size: getByteSize(requestPayload),
        response_size: getByteSize(response?.body),
        error_details: errorDetails,
      });

    if (error) {
      throw error;
    }
  }

  function updateValue(inType: string, name: string, value: string) {
    const key = `${inType}_${name}`;
    setValues((prev) => ({ ...prev, [key]: value }));
    if (value.trim() && validationErrors[key]) {
      setValidationErrors((prev) => {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      });
    }
  }

  const getPreparedRequestData = () => {
    const pathParams = Object.fromEntries(grouped.path.map((p) => [p.name, getParamValue('path', p.name)]));
    const queryParams = Object.fromEntries(grouped.query.map((p) => [p.name, getParamValue('query', p.name)]));
    const headerParams = Object.fromEntries(grouped.header.map((p) => [p.name, getParamValue('header', p.name)]));

    const url = buildRequestUrl(path, pathParams, queryParams, serverUrl);

    const headers = {
      ...headerParams,
      'Content-Type': 'application/json',
    };

    return {
      url,
      request: buildRequest({ url, method, headers, body }),
    };
  };

  const validateFields = (): boolean => {
    const errors: Record<string, string> = {};
    parameters.forEach((param) => {
      const val = getParamValue(param.in, param.name);
      if (param.required && !val.trim()) {
        errors[`${param.in}_${param.name}`] = 'This field is required';
      }
    });
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  async function handleExecute() {
    if (!validateFields()) return;

    let preparedRequest: ProxyRequest | null = null;
    let startedAt = Date.now();
    let historySaved = false;

    try {
      setLoading(true);
      setResponse(null);
      setErrorOutput(null);

      const { url, request } = getPreparedRequestData();
      preparedRequest = request;
      startedAt = Date.now();
      setRequestUrl(url);

      const result = await fetch('/api/proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      const data = await result.json();
      const durationMs = Date.now() - startedAt;

      if (data.error) {
        await saveRequestHistory(request, null, durationMs, data.error);
        historySaved = true;
        throw new Error(data.error);
      }
      
      setResponse(data);
      await saveRequestHistory(request, data, durationMs);
      historySaved = true;
    } catch (error: unknown) {
      const durationMs = Date.now() - startedAt;
      let errorMessage = 'Request failed';

      if (error instanceof Error) {
        const msg = error.message;
        if (msg.includes('Failed to construct \'URL\'') || msg.includes('Invalid URL')) {
          errorMessage = 'Invalid Request URL. Please make sure a valid Base Server URL is defined in your OpenAPI specification.';
        } else {
          errorMessage = msg;
        }
      }

      if (preparedRequest && !historySaved) {
        try {
          await saveRequestHistory(preparedRequest, null, durationMs, errorMessage);
        } catch {
          // History persistence should not mask the original request error.
        }
      }

      setErrorOutput(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  function handleGenerateCurl() {
    if (!validateFields()) return;

    try {
      setErrorOutput(null);
      const { request } = getPreparedRequestData();
      const curlCommand = buildCurl(request);
      setCurl(curlCommand);
    } catch (error) {
      setErrorOutput(error instanceof Error ? error.message : 'Failed to generate cURL');
    }
  }

  function clearRequest() {
    setValues({});
    setValidationErrors({});
    setResponse(null);
    setErrorOutput(null);
    setRequestUrl(null);
    setCurl(null);
    setBody(getInitialBodyText(bodyContent, 'application/json'));
  }

  return {
    grouped,
    values,
    body,
    response,
    errorOutput,
    loading,
    requestUrl,
    curl,
    validationErrors,
    updateValue,
    handleExecute,
    handleGenerateCurl,
    clearRequest,
    setBody,
  };
}
