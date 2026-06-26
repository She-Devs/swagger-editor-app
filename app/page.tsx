"use client";

import { ActionIcon, Container, useMantineColorScheme } from "@mantine/core";
import { useEffect, useState } from "react";

export default function HomePage() {
  const { toggleColorScheme, colorScheme } = useMantineColorScheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Container>
        <ActionIcon variant="default" size="xl" radius="md" />
      </Container>
    );
  }

  return (
    <Container>
      <ActionIcon
        onClick={() => toggleColorScheme()}
        variant="default"
        size="xl"
        radius="md"
      >
        {colorScheme === "dark" ? "🌙" : "☀️"}
      </ActionIcon>
    </Container>
  );
}
