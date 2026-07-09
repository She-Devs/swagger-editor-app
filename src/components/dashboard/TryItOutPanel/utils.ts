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
