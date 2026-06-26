import { Box, Button, Group, Text, Container } from "@mantine/core";
import "@mantine/core/styles.css";
import classes from "./Header.module.css";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { LanguageToggle } from "@/components/ui/LanguageToggle";

export function Header() {
  return (
    <Box component="header" className={classes.header}>
      <Container size="2xl" className={classes.container}>
        <Text component="a" href="/" className={classes.logo}>
          🦄 She-devs
        </Text>
        <Group gap="xl">
          <a href="#" className={classes.link}>
            About
          </a>
        </Group>
        <Group gap="sm">
          <Button variant="default" className={classes.loginBtn}>
            Log in
          </Button>
          <Button className={classes.signupBtn}>Sign up</Button>
          <ThemeToggle />
          <LanguageToggle />
        </Group>
      </Container>
    </Box>
  );
}
