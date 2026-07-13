import { Container } from '@mantine/core';
import { SignInForm } from '@/components/auth/SignInForm';
import { setRequestLocale } from 'next-intl/server';

export default async function SignInPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <Container size="xl" py={60}>
      <SignInForm />
    </Container>
  );
}
