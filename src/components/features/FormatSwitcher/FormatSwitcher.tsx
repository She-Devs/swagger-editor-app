'use client';

import { useEditorStore } from '@/store/useEditorStore';
import { DATA_FORMATS } from '@/constants';
import { Box, Button, Group } from '@mantine/core';
import { useTranslations } from 'next-intl';
import {  useState } from 'react';
import classes from './FormatSwitcher.module.css';
import SaveSchemaButton from '../SaveSchemaButton/SaveSchemaButton';

export function FormatSwitcher() {
  const format = useEditorStore((state) => state.format);
  const convert = useEditorStore((state) => state.convert);
  const schema = useEditorStore((state) => state.schema);
  const isValid = useEditorStore((state) => state.isValid);
  const t = useTranslations('FormatSwitcher');
  const [showError, setShowError] = useState(false);
  const isSchemaEmpty = !schema || schema.trim().length === 0;
  const isYAML = format === DATA_FORMATS.YAML;

  const handleConvert = () => {
    if (!isValid) {
      setShowError(true);
      return;
    }
    convert();
    setShowError(false);
  };

  return (
    <Group className={classes.wrapper}>
      {showError && !isValid && !isSchemaEmpty && (
        <Box>
          <span>⚠️</span> {t('invalidSchemaError')}
        </Box>
      )}
     
      <Button    
        className={classes.switcher}
        onClick={handleConvert}
        disabled={isSchemaEmpty}
      >
        {isYAML ? t('switchToJson') : t('switchToYaml')}
      </Button>   
      <SaveSchemaButton />

    </Group>
  );
}
