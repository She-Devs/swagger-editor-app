'use client';

import { Accordion, Badge, Table, Text } from '@mantine/core';
import { METHOD_COLORS } from '@/constants';

interface HistoryRecord {
  id: string;
  duration_ms: number;
  status_code: number;
  created_at: string;
  method:string;
  request_size: number;
  response_size: number;
  error_details: string;
  url: string;
};

export type HistoryListProps = {
  history: HistoryRecord[]
};

export function HistoryList({ history }: HistoryListProps) {
  return (
    <div className="history-list">
      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Method</Table.Th>
            <Table.Th>URL</Table.Th>
            <Table.Th>Status</Table.Th>
            <Table.Th>Timestamp</Table.Th>
            <Table.Th>Details</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {history.map((record) => {
            const statusColor = record.status_code < 300 ? 'teal' : record.status_code < 400 ? 'yellow' : 'red';
            return (
              <Table.Tr key={record.id}>
                <Table.Td>
                  <Badge color={METHOD_COLORS[record.method.toLowerCase()] ?? 'gray'} size="sm" radius="sm">
                    {record.method}
                  </Badge>
                </Table.Td>
                <Table.Td>{record.url}</Table.Td>
                <Table.Td>
                  <Badge color={statusColor}>{record.status_code}</Badge>
                </Table.Td>
                <Table.Td>{record.created_at}</Table.Td>
                <Table.Td>
                  <Accordion variant="separated">
                    <Accordion.Item value={record.id}>
                      <Accordion.Control>Details</Accordion.Control>
                      <Accordion.Panel>
                        <Text size="xs">Duration: {record.duration_ms}ms</Text>
                        <Text size="xs">Request size: {record.request_size} bytes</Text>
                        <Text size="xs">Response size: {record.response_size} bytes</Text>
                        {record.error_details && <Text size="xs" c="red">Error: {record.error_details}</Text>}
                      </Accordion.Panel>
                    </Accordion.Item>
                  </Accordion>
                </Table.Td>
              </Table.Tr>
            );
          })}
        </Table.Tbody>
      </Table>
    </div>
  );
}
