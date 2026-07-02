"use client"

import Editor from '@/components/features/Editor';
import { useState } from 'react';

export default function Home() {
  const [schema, setSchema] = useState(''); // текст схемы
const [format, setFormat] = useState<'json' | 'yaml'>('yaml');

  return <Editor 
  value={schema}
  onChange={setSchema}
  format={format}
  errors={[]}
/>
}
