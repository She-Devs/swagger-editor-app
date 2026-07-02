import type { Metadata } from 'next';
import '@mantine/core/styles.css'; 
import './globals.css';
import { ColorSchemeScript } from '@mantine/core';

export const metadata: Metadata = {
  title: 'Swagger',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning>
      <head>
        <ColorSchemeScript defaultColorScheme="auto" />
      </head>
      <body>{children}</body>
    </html>
  );
}
