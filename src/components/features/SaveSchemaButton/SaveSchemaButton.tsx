import { Button } from '@mantine/core';
import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/store/authStore';
import { useEditorStore } from '@/store/useEditorStore';

export default function SaveSchemaButton() {
  const t = useTranslations('SaveSchemaButton');
  const user = useAuthStore((state) => state.user);
  const schema = useEditorStore((state) => state.schema);
  const isValid = useEditorStore((state) => state.isValid);
  const isSaving = useEditorStore((state) => state.isSaving);
  const saveSchema = useEditorStore((state) => state.saveSchema);
  const isSchemaEmpty = !schema || schema.trim().length === 0;
  const isDisabled = !isValid || isSaving || isSchemaEmpty;

  if (!user) {
    return null;
  }

  return (
    <Button 
      onClick={saveSchema}
      disabled={isDisabled}
      loading={isSaving}
    >
      {t('title')}
    </Button>
  );
}
