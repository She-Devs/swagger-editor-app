import { Button, Text, Transition } from '@mantine/core';
import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/store/authStore';
import { useEditorStore } from '@/store/useEditorStore';
import { useState } from 'react';

export default function SaveSchemaButton() {
  const t = useTranslations('SaveSchemaButton');
  const user = useAuthStore((state) => state.user);
  const schema = useEditorStore((state) => state.schema);
  const isValid = useEditorStore((state) => state.isValid);
  const isSaving = useEditorStore((state) => state.isSaving);
  const saveSchema = useEditorStore((state) => state.saveSchema);
  const isSchemaEmpty = !schema || schema.trim().length === 0;
  const isDisabled = !isValid || isSaving || isSchemaEmpty;

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSave = async () => {
    setError(null);
    setSuccess(false);

    try {
      await saveSchema();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);
    } catch (error) {
      const message = error instanceof Error ? error.message : t('errorMessage');
      setError(message);
      setTimeout(() => setError(null), 5000);
    }
  };
  
  if (!user) {
    return null;
  }

  return (
    <>
      <Button 
        onClick={handleSave}
        disabled={isDisabled}
        loading={isSaving}
      >
        {t('title')}
      </Button>

      <Transition mounted={!!success} transition="fade" duration={300}>
        {(styles) => (
          <Text size="sm" c="green" style={styles}>
            ✅ {t('successMessage')}
          </Text>
        )}
      </Transition>
        
      <Transition mounted={!!error} transition="fade" duration={300}>
        {(styles) => (
          <Text size="sm" c="red" style={styles}>
            ❌ {error}
          </Text>
        )}
      </Transition>
    </>
    
  );
}
