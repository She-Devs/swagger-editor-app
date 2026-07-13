import { Button } from '@mantine/core';
import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/store/authStore';
import { useEditorStore } from '@/store/useEditorStore';
import { showNotification } from '@/utils/showNotification';

export default function SaveSchemaButton() {
  const t = useTranslations('SaveSchemaButton');
  const user = useAuthStore((state) => state.user);
  const schema = useEditorStore((state) => state.schema);
  const isValid = useEditorStore((state) => state.isValid);
  const isSaving = useEditorStore((state) => state.isSaving);
  const saveSchema = useEditorStore((state) => state.saveSchema);
  const isSchemaEmpty = !schema || schema.trim().length === 0;
  const isDisabled = !isValid || isSaving || isSchemaEmpty;

  const handleSave = async () => {

    try {
      await saveSchema();
      showNotification(t('successMessage'), 'green');
    } catch {
      showNotification(t('errorMessage'), 'red');
    }
  };
  
  if (!user) {
    return null;
  }

  return (
    <Button 
      onClick={handleSave}
      disabled={isDisabled}
      loading={isSaving}
    >
      {t('title')}
    </Button>
  );
}
