'use client';

import { Avatar, Button, Card, Stack, Text } from '@mantine/core';
import { IconBrandGithub } from '@tabler/icons-react';
import classes from './TeamCard.module.css';

type Props = {
  name: string;
  role: string;
  github: string;
};

const GITHUB_BASE_URL = 'https://github.com';

const getGithubAvatarUrl = (username: string) =>
  `${GITHUB_BASE_URL}/${username}.png`;

const getGithubProfileUrl = (username: string) =>
  `${GITHUB_BASE_URL}/${username}`;

export function TeamCard({ name, role, github }: Props) {
  const firstLetter = name.trim()[0]?.toUpperCase() ?? '?';

  return (
    <Card
      radius="xl"
      p="xl"
      shadow="md"
      withBorder
      className={classes.card}
    >
      <Stack
        align="center"
        gap="md"
        className={classes.content}
      >
        <Avatar
          src={getGithubAvatarUrl(github)}
          size={120}
          radius="50%"
          className={classes.avatar}
        >
          {firstLetter}
        </Avatar>

        <Stack gap={4} align="center">
          <Text
            fw={800}
            size="lg"
            ta="center"
            className={classes.name}
          >
            {name}
          </Text>

          <Text
            size="sm"
            ta="center"
            className={classes.role}
          >
            {role}
          </Text>
        </Stack>
      </Stack>

      <Button
        component="a"
        href={getGithubProfileUrl(github)}
        target="_blank"
        rel="noopener noreferrer"
        leftSection={<IconBrandGithub size={18} />}
        radius="xl"
        fullWidth
        mt="xl"
        aria-label={`Open ${name}'s GitHub profile`}
      >
        GitHub
      </Button>
    </Card>
  );
}
