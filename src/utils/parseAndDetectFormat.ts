import { DATA_FORMATS } from '@/constants';
import * as yaml from 'js-yaml';

export type DataFormat = typeof DATA_FORMATS[keyof typeof DATA_FORMATS]; 

interface ParseResult {
  format: DataFormat,
  data: unknown, 
}

export default function parseAndDetectFormat (text: string): ParseResult | null {
  if (text.trim().length === 0) return null;

  try {
    const parsedText = JSON.parse(text); 
    return { format: DATA_FORMATS.JSON, data: parsedText };
  } catch {}

  try {
    const parsedText = yaml.load(text); 
    return { format: DATA_FORMATS.YAML, data: parsedText };
  } catch {}

  return null;
}
