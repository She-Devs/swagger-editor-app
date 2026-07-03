'use client';

import CodeMirror from '@uiw/react-codemirror';
import { yaml } from '@codemirror/lang-yaml';
import { json } from '@codemirror/lang-json';

interface EditorProps {
  value: string;              
  onChange: (value: string) => void;  
  format: 'json' | 'yaml';    
  errors?: string[];          
}

export default function Editor({ value, onChange, format }: EditorProps)  {

  return (
    <CodeMirror
      value={value}
      height="100vh"
      theme="dark"
      extensions={[format === 'yaml' ? yaml() : json()]}
      onChange={onChange}
    />
  );
}
