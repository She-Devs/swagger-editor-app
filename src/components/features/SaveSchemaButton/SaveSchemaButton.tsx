import { Button } from '@mantine/core';
import { useTranslations } from 'next-intl';

export default function SaveSchemaButton() {
  const t = useTranslations('SaveSchemaButton');
  return(
    <Button>
      {t('title')}
    </Button>  
  );
}
