'use client';

import { Paper, Stack } from '@mantine/core';
import type { OAOperation } from '../ViewerPanel/types';

import { RequestBodyEditor } from './RequestBodyEditor';
import { ResponseViewer } from './ResponseViewer';
import { ExecuteActions } from './ExecuteActions';
import { CurlViewer } from './CurlViewer';
import { ParameterSection } from './ParameterSection';
import { useTryItOut } from './useTryItOut';

interface TryItOutPanelProps {
  method: string;
  path: string;
  operation: OAOperation;
}

export function TryItOutPanel({ method, path, operation }: TryItOutPanelProps) {
  const {
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
  } = useTryItOut({ method, path, operation });

  const sectionsConfig = [
    { title: 'Path Parameters', params: grouped.path },
    { title: 'Query Parameters', params: grouped.query },
    { title: 'Headers', params: grouped.header },
    { title: 'Cookies', params: grouped.cookie },
  ];

  return (
    <Stack gap="lg">
      <Paper withBorder p="md">
        <Stack gap="md">
          {sectionsConfig.map(({ title, params }) => (
            <ParameterSection
              key={title}
              title={title}
              params={params}
              validationErrors={validationErrors}
              values={values}
              onValueChange={updateValue}
            />
          ))}
        
          {operation.requestBody && (
            <RequestBodyEditor
              body={body}
              onBodyChange={setBody}
            />
          )}
        
          <ExecuteActions
            onExecute={handleExecute}
            onGenerateCurl={handleGenerateCurl}
            onClear={clearRequest}
            loading={loading}
          />
        </Stack>
      </Paper>
      <CurlViewer curl={curl} />
      <ResponseViewer response={response} error={errorOutput} requestUrl={requestUrl} />
    </Stack>
  );
}
