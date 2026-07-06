'use client';

import { Card, Avatar, Text, Group, Button, Stack } from '@mantine/core';

type Props = {
  name: string;
  role: string;
  github: string;
  avatar?: string;
};

export function TeamCard({ name, role, github, avatar }: Props) {
  const trimmedName = name.trim();
  const firstLetter = trimmedName ? trimmedName[0].toUpperCase() : '?';

  return (
    <Card
      radius="lg"
      p="lg"
      shadow="sm"
      withBorder
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Group align="flex-start">
        <Avatar
          src={avatar}
          radius="xl"
          size="lg"
          color="gray"
        >
          {firstLetter}
        </Avatar>

        <Stack gap={0} style={{ flex: 1 }}>
          <Text fw={600} lineClamp={1}>
            {name}
          </Text>

          <Text size="sm" c="dimmed" lineClamp={2}>
            {role}
          </Text>
        </Stack>
      </Group>

      <Button
        component="a"
        href={github}
        target="_blank"
        rel="noopener noreferrer"
        variant="light"
        color="gray"
        fullWidth
        mt="auto"
        aria-label={`Open ${name} GitHub profile`}
      >
        GitHub
      </Button>
    </Card>
  );
}
