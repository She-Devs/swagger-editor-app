import { Header } from '@/components/layouts/Header/Header';
import { Footer } from '@/components/layouts/Footer/Footer';
import { MantineProvider } from '@mantine/core';
import { theme } from '../theme';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { AuthProvider } from '@/components/providers/AuthProvider';
import classes from './layout.module.css';
 
export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages({ locale });
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <MantineProvider theme={theme} defaultColorScheme="auto">
        <AuthProvider>
          <div className={classes.wrapper}>
            <Header />
            <main className={classes.main}>{children}</main>
            <Footer />
          </div>
        </AuthProvider>
      </MantineProvider>
    </NextIntlClientProvider>
  );
}
