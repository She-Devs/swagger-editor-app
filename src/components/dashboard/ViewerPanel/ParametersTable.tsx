import { Badge, Code, Table, Text } from '@mantine/core';
import { useTranslations } from 'next-intl';
import type { OAParameter } from './types';

export function ParametersTable({ parameters, filterIn }: { parameters: OAParameter[]; filterIn: string }) {
  const t = useTranslations('Viewer');
  const filtered = parameters.filter((p) => p.in === filterIn);
  if (filtered.length === 0) return <Text size="xs" c="dimmed">{t('none')}</Text>;
  return (
    <Table fz="xs" withTableBorder withColumnBorders>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>{t('name')}</Table.Th>
          <Table.Th>{t('requiredColumn')}</Table.Th>
          <Table.Th>{t('type')}</Table.Th>
          <Table.Th>{t('description')}</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {filtered.map((p) => (
          <Table.Tr key={p.name}>
            <Table.Td><Code fz="xs">{p.name}</Code></Table.Td>
            <Table.Td>{p.required ? <Badge size="xs" color="red">{t('yes')}</Badge> : <Text size="xs" c="dimmed">{t('no')}</Text>}</Table.Td>
            <Table.Td><Text size="xs">{(p.schema as { type?: string } | undefined)?.type ?? '—'}</Text></Table.Td>
            <Table.Td><Text size="xs" c="dimmed">{p.description ?? '—'}</Text></Table.Td>
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  );
}
