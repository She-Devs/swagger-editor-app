'use client';

import { useEditorStore } from '@/store/useEditorStore';
import { DATA_FORMATS } from '@/constants';
import {  Button, Group } from '@mantine/core';
import { useTranslations } from 'next-intl';
import classes from './FormatSwitcher.module.css';
import SaveSchemaButton from '../SaveSchemaButton/SaveSchemaButton';
import { notifications } from '@mantine/notifications';

export function FormatSwitcher() {
  const format = useEditorStore((state) => state.format);
  const convert = useEditorStore((state) => state.convert);
  const schema = useEditorStore((state) => state.schema);
  const isValid = useEditorStore((state) => state.isValid);
  const t = useTranslations('FormatSwitcher');
  const isSchemaEmpty = !schema || schema.trim().length === 0;
  const isYAML = format === DATA_FORMATS.YAML;

  const handleConvert = () => {
    if (!isValid) {
      notifications.show({
        message: t('invalidSchemaError'),
        color: 'red',
        autoClose: 3000,
        style: { minHeight: '60px'},
      });
      return;
    }
    convert();
  };

  return (
    <Group className={classes.wrapper}>
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
