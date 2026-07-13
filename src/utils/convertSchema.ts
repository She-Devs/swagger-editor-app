import * as yaml from 'js-yaml';
import parseAndDetectFormat from './parseAndDetectFormat';

export function convertSchema(text: string, targetFormat: 'json' | 'yaml'): string | null {
  if (!text || text.trim().length === 0) {
    return null;
  }

  const parseResult = parseAndDetectFormat(text);
  if (!parseResult) {
    return null;
  }

  const { format: currentFormat, data } = parseResult;

  if (currentFormat === targetFormat) {
    return text;
  }

  if (!data || typeof data !== 'object') {
    return null;
  }
  try {
    let convertedText: string;
    
    if (targetFormat === 'json') {
      convertedText = JSON.stringify(data, null, 2);
    } else {
      convertedText = yaml.dump(data, {
        indent: 2,      
        lineWidth: -1,    
        noRefs: true,     
      });

    }

    if (!convertedText || convertedText.trim().length === 0) {
      return null;
    }

    return convertedText;
    
  } catch {
    return null;
  }
}
