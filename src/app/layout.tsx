import type { Metadata } from 'next';
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
        <ColorSchemeScript />
      </head>
      <body>{children}</body>
    </html>
  );
}
