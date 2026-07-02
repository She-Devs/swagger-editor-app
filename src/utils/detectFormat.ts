import yaml from 'js-yaml';

export default function detectFormat (text: string): 'json' | 'yaml' | null {
  if (text.length === 0 ) return null;

  try {
    JSON.parse(text); 
    return 'json';
  } catch {
  
  }

  try {
    yaml.load(text); 
    return 'yaml';
  } catch {
    
  }

  return null;
}
