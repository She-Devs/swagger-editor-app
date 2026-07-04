'use client';

import { useEditorStore } from '@/store/useEditorStore';
import { Text, Stack } from '@mantine/core';
import classes from './ValidationErrors.module.css';
import { useTranslations } from 'next-intl';

export function ValidationErrors() {
  const t = useTranslations('Validation');

  const schema = useEditorStore((state) => state.schema);
  const errors = useEditorStore((state) => state.errors);

  const isSchemaEmpty = !schema || schema.trim().length === 0;

  if (isSchemaEmpty) {
    return (      
      <Text size="sm" c="dimmed">
        {t('emptyState')}
      </Text>  
    );
  }

  if (errors.length > 0) {
    return (
      <Stack gap={2} className={classes.errorsList}>
        <Text className={classes.errorHeader }>
          {t('errorHeader')}
        </Text>  
        {errors.map((error, index) => (
          <div key={index} className={classes.errorItem}>
            <Text size="xs" c="red" className={classes.errorText}>
              {error}
            </Text>
          </div>
        ))}
      </Stack>
    );
  }

  return null;
}

