import { DATA_FORMATS } from '@/constants';
import * as yaml from 'js-yaml';

export type DataFormat = typeof DATA_FORMATS[keyof typeof DATA_FORMATS]; 

export default function detectFormat (text: string): DataFormat | null {

  try {
    JSON.parse(text); 
    return DATA_FORMATS.JSON;
  } catch {}

  try {
    yaml.load(text); 
    return DATA_FORMATS.YAML;
  } catch {}

  return null;
}
