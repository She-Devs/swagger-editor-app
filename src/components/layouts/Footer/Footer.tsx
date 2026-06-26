import { Box, Group, Text, Container, Anchor } from "@mantine/core";
import "@mantine/core/styles.css";
import classes from "./Footer.module.css";

export function Footer() {
  return (
    <Box component="footer" className={classes.footer}>
      <Container size="2xl" className={classes.container}>
        <Anchor
          className={classes.link}
          href="https://rs.school/courses/javascript"
          target="_blank"
        >
          <img src="/rss-logo.svg" alt="RS School" className={classes.rsLogo} />
          RS School
        </Anchor>
        <Group gap="xl">
          <a href="#" className={classes.link}>
            About
          </a>
        </Group>
        <Text className={classes.year}>2026</Text>
      </Container>
    </Box>
  );
}
