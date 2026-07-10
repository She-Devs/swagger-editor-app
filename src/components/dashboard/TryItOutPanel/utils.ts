import { sample } from 'openapi-sampler';
import { create } from 'xmlbuilder2';
import type { LocalBodyContent } from './types';

export function getInitialBodyText(
  bodyContent: Record<string, LocalBodyContent> | undefined,
  type: string | null
): string {
  if (!type || !bodyContent || !bodyContent[type]) {
    return '';
  }

  const mediaType = bodyContent[type];

  const firstExample = Object.values(
    mediaType.examples ?? {}
  )[0] as { value?: unknown } | undefined;

  let cleanDataObject =
    mediaType.example ?? firstExample?.value;

  if (!cleanDataObject && mediaType.schema) {
    try {
      const schema = mediaType.schema as Record<string, unknown>;

      cleanDataObject = sample(schema);
    } catch {
      return '';
    }
  }

  if (cleanDataObject === null || cleanDataObject === undefined) {
    return '';
  }

  if (typeof cleanDataObject === 'string') {
    return cleanDataObject;
  }

  if (type.toLowerCase().includes('xml')) {
    const xmlSchema =
      (mediaType.schema?.xml as Record<string, unknown>) || {};

    const rootTag =
      (xmlSchema.name as string) || 'root';

    return create({
      [rootTag]: cleanDataObject,
    }).end({
      format: 'xml',
      prettyPrint: true,
    });
  }

  return JSON.stringify(cleanDataObject, null, 2);
}

export function buildRequestUrl(
  path: string,
  pathParams: Record<string, string>,
  queryParams: Record<string, string>,
  serverUrl: string
): string {
  const baseUrl = serverUrl.endsWith('/') ? serverUrl.slice(0, -1) : serverUrl;
  let interpolatedPath = path;

  for (const [key, value] of Object.entries(pathParams)) {
    interpolatedPath = interpolatedPath.replace(`{${key}}`, encodeURIComponent(value.trim()));
  }

  const fullUrl = new URL(baseUrl + interpolatedPath);
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(queryParams)) {
    if (value.trim()) {
      value.split(',').forEach((item) => {
        const trimmedItem = item.trim();
        if (trimmedItem) {
          searchParams.append(key, trimmedItem);
        }
      });
    }
  }

  fullUrl.search = searchParams.toString();
  return fullUrl.toString();
}


export interface ProxyRequest {
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: string;
}


interface BuildRequestParams {
  url: string;
  method: string;
  headers: Record<string, string>;
  body: string;
}


export function buildRequest({
  url,
  method,
  headers,
  body,
}: BuildRequestParams): ProxyRequest {
  const cleanHeaders = Object.fromEntries(
    Object.entries(headers).filter(
      ([, value]) => value.trim() !== ''
    )
  );

  return {
    url,
    method: method.toUpperCase(),
    headers: cleanHeaders,
    body: body.trim() || undefined,
  };
}

export function getServerUrl(schema: unknown): string {
  if (!schema || typeof schema !== 'object') {
    return '';
  }

  const data = schema as {
    servers?: {
      url: string;
    }[];
  };
  return data.servers?.[0]?.url ?? '';
}


interface BuildCurlParams {
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: string;
}

export function buildCurl({
  url,
  method,
  headers,
  body,
}: BuildCurlParams): string {
  const lines = [
    `curl -X ${method.toUpperCase()} '${url}'`,
  ];

  Object.entries(headers).forEach(([key, value]) => {
    if (!value.trim()) return;

    lines.push(`  -H '${key}: ${value}'`);
  });

  if (
    body &&
    body.trim() &&
    method !== 'GET' &&
    method !== 'HEAD'
  ) {
    lines.push(`  -d '${body}'`);
  }

  return lines.join(' \\\n');
}
