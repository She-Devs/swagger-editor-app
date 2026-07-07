import { Badge, Code, Table, Text } from '@mantine/core';
import type { OAParameter } from './types';

export function ParametersTable({ parameters, filterIn }: { parameters: OAParameter[]; filterIn: string }) {
  const filtered = parameters.filter((p) => p.in === filterIn);
  if (filtered.length === 0) return <Text size="xs" c="dimmed">None</Text>;
  return (
    <Table fz="xs" withTableBorder withColumnBorders>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Name</Table.Th>
          <Table.Th>Required</Table.Th>
          <Table.Th>Type</Table.Th>
          <Table.Th>Description</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {filtered.map((p) => (
          <Table.Tr key={p.name}>
            <Table.Td><Code fz="xs">{p.name}</Code></Table.Td>
            <Table.Td>{p.required ? <Badge size="xs" color="red">yes</Badge> : <Text size="xs" c="dimmed">no</Text>}</Table.Td>
            <Table.Td><Text size="xs">{(p.schema as { type?: string } | undefined)?.type ?? '—'}</Text></Table.Td>
            <Table.Td><Text size="xs" c="dimmed">{p.description ?? '—'}</Text></Table.Td>
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  );
}
