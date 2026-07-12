'use client';
 
import { Fragment, useState } from 'react';
import { Badge, Box, Group, Paper, ScrollArea, Table, Text, UnstyledButton } from '@mantine/core';
import { IconChevronDown } from '@tabler/icons-react';
import { METHOD_COLORS } from '@/constants';
import classes from './HistoryList.module.css';
 
interface HistoryRecord {
  id: string;
  duration_ms: number;
  status_code: number | null;
  created_at: string;
  method: string;
  request_size: number;
  response_size: number;
  error_details: string | null;
  url: string;
}
 
export type HistoryTranslations = {
  method: string;
  url: string;
  status: string;
  timestamp: string;
  details: string;
  duration: string;
  requestSize: string;
  responseSize: string;
  error: string;
};
 
export type HistoryListProps = {
  history: HistoryRecord[];
  t: HistoryTranslations;
};
 
export function HistoryList({ history, t }: HistoryListProps) {
  const [openId, setOpenId] = useState<string | null>(null);
 
  return (
    <Paper withBorder radius="md" style={{ overflow: 'hidden' }}>
      <ScrollArea>
        <Table verticalSpacing="sm" horizontalSpacing="md">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>{t.method}</Table.Th>
              <Table.Th>{t.url}</Table.Th>
              <Table.Th>{t.status}</Table.Th>
              <Table.Th>{t.timestamp}</Table.Th>
              <Table.Th style={{ width: 40 }} />
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {history.map((record) => {
              const statusColor =
                !record.status_code ? 'gray'
                  : record.status_code < 300 ? 'teal'
                    : record.status_code < 400 ? 'yellow'
                      : 'red';
              const isOpen = openId === record.id;
 
              return (
                <Fragment key={record.id}>
                  <Table.Tr
                    style={{ cursor: 'pointer' }}
                    onClick={() => setOpenId(isOpen ? null : record.id)}
                  >
                    <Table.Td>
                      <Badge
                        color={METHOD_COLORS[record.method.toLowerCase()] ?? 'gray'}
                        size="sm"
                        radius="sm"
                      >
                        {record.method}
                      </Badge>
                    </Table.Td>
                    <Table.Td className={classes.urlCell}>
                      <Text size="xs" title={record.url}>{record.url}</Text>
                    </Table.Td>
                    <Table.Td>
                      {record.status_code ? (
                        <Badge color={statusColor}>{record.status_code}</Badge>
                      ) : (
                        <Badge color="gray">—</Badge>
                      )}
                    </Table.Td>
                    <Table.Td>
                      <Text size="xs" c="dimmed">
                        {new Date(record.created_at).toLocaleString()}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <UnstyledButton
                        className={classes.detailsBtn}
                        aria-label={t.details}
                        aria-expanded={isOpen}
                      >
                        <Text size="xs" c="dimmed">{t.details}</Text>
                        <IconChevronDown
                          size={14}
                          className={`${classes.chevron} ${isOpen ? classes.chevronOpen : classes.chevronClosed}`}
                        />
                      </UnstyledButton>
                    </Table.Td>
                  </Table.Tr>
 
                  <Table.Tr>
                    <Table.Td
                      colSpan={5}
                      className={`${classes.detailsCell} ${!isOpen ? classes.detailsCellClosed : ''}`}
                    >
                      <Box className={classes.detailsRow} data-open={isOpen}>
                        <Box className={classes.detailsInner}>
                          <Box py="xs" px="md" className={classes.detailsContent}>
                            <Group gap="xl" wrap="wrap">
                              <Text size="xs"><b>{t.duration}:</b> {record.duration_ms}ms</Text>
                              <Text size="xs"><b>{t.requestSize}:</b> {record.request_size}B</Text>
                              <Text size="xs"><b>{t.responseSize}:</b> {record.response_size}B</Text>
                              {record.error_details && (
                                <Text size="xs" c="red"><b>{t.error}:</b> {record.error_details}</Text>
                              )}
                            </Group>
                          </Box>
                        </Box>
                      </Box>
                    </Table.Td>
                  </Table.Tr>
                </Fragment>
              );
            })}
          </Table.Tbody>
        </Table>
      </ScrollArea>
    </Paper>
  );
}
