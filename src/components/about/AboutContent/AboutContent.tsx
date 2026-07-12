'use client';
import { useTranslations } from 'next-intl';
import { TeamCard } from '@/components/about/TeamCard/TeamCard';
import { SectionDivider } from '@/components/ui/SectionDivider/SectionDivider';
import { MENTORS, TEAM, HIGHLIGHTS_ABOUT, TECH } from '@/constants';
import classes from './AboutContent.module.css';

import {
  Container,
  Stack,
  Title,
  Text,
  Group,
  Badge,
  SimpleGrid,
  Anchor,
  Box,
  ThemeIcon,
  Paper,
  Button,
  Center,
} from '@mantine/core';

import {
  IconBrandGithub,
  IconCode,
  IconExternalLink,
} from '@tabler/icons-react';

const PAGE_PADDING = 80;
const SECTION_WIDTH = 900;
const TEXT_WIDTH = 700;
const BADGE_ICON_SIZE = 18;

export default function AboutContent() {
  const t = useTranslations('AboutPage');

  return (
    <Box>
      <Container size="lg" py={PAGE_PADDING}>
        <Stack gap="xl">

          <Stack align="center" ta="center" gap="md">
            <ThemeIcon
              size={80}
              radius="xl"
              variant="gradient"
              gradient={{ from: 'violet', to: 'grape', deg: 90 }}
            >
              <IconCode size={42} />
            </ThemeIcon>

            <Stack align="center" ta="center" gap="md">
              <Title fw={800} fz="hero">
                {t('hero.title')}
              </Title>

              <Title order={2} fw={700}>
                {t('hero.subtitle')}
              </Title>

              <Text size="lg" maw={TEXT_WIDTH}>
                {t('hero.description')}
              </Text>

              <Button
                component="a"
                href="https://github.com/She-Devs/swagger-editor-app"
                target="_blank"
                rel="noopener noreferrer"
                variant="light"
                size="md"
                radius="xl"
                mt="md"
                leftSection={<IconBrandGithub size={20} />}
                className={classes.techBadge}
              >
                {t('hero.github')}
              </Button>
            </Stack>
          </Stack>

          <SectionDivider />

          <Paper
            radius="xl"
            p={{ base: 'md', md: 50 }}
            withBorder
            maw={SECTION_WIDTH}
            mx="auto"
          >
            <Stack align="center" ta="center" gap="xl">

              <Title order={2} fw={800}>
                {t('school.title')}
              </Title>

              <Text size="lg" maw={TEXT_WIDTH} lh={1.7}>
                {t('school.description')}
              </Text>

              <Center mt="md"> 
                <Anchor
                  href="https://rs.school"
                  target="_blank"
                  rel="noopener noreferrer"
                  fw={900}
                  underline="hover"
                  c="yellow"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                  }}
                >
                  Rolling Scopes School React Course
                  <IconExternalLink size={16} />
                </Anchor>
              </Center>

              <Group justify="center" gap="md">
                {HIGHLIGHTS_ABOUT.map(({ key, icon: Icon }) => (
                  <Badge
                    key={key}
                    size="lg"
                    radius="xl"
                    variant="light"
                    leftSection={<Icon size={BADGE_ICON_SIZE} />}
                  >
                    {t(`highlights.${key}`)}
                  </Badge>
                ))}
              </Group>
            </Stack>
          </Paper>

          <SectionDivider />

          <Stack align="center" gap="xl">
            <Title order={2}>
              {t('sections.technologies')}
            </Title>

            <Group justify="center" gap="sm">
              {TECH.map(({ name, url }) => (
                <Badge
                  key={name}
                  component="a"
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  size="lg"
                  className={classes.techBadge}
                >
                  {name}
                </Badge>
              ))}
            </Group>
          </Stack>

          <SectionDivider />

          <Stack gap="xl">
            <Title order={2} ta="center">
              {t('sections.team')}
            </Title>

            <SimpleGrid
              cols={{ base: 1, sm: 2, md: 3 }}
              spacing="lg"
            >
              {TEAM.map((member) => (
                <TeamCard
                  key={member.github}
                  name={member.name}
                  role={member.role}
                  github={member.github}
                />
              ))}
            </SimpleGrid>
          </Stack>

          <SectionDivider />

          <Stack align="center" gap="md">
            <Title order={2} fw={800}>
              {t('sections.thanks')}
            </Title>

            <Text ta="center" maw={600}>
              {t('thanks.description')}
            </Text>

            <SimpleGrid
              cols={{ base: 1, sm: 2 }}
              spacing="xl"
              mt="xl"
            >
              {MENTORS.map((member) => (
                <TeamCard
                  key={member.github}
                  name={member.name}
                  role={member.role}
                  github={member.github}
                />
              ))}
            </SimpleGrid>
          </Stack>

        </Stack>
      </Container>
    </Box>
  );
}
