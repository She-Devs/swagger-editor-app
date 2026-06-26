import { Header } from "../components/layouts/Header/Header";
import type { ReactNode } from "react";
import "./globals.css";
import { MantineProvider } from "@mantine/core";
import { theme } from "./theme";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <MantineProvider theme={theme} defaultColorScheme="auto">
          <Header />
          {children}
        </MantineProvider>
      </body>
    </html>
  );
}
