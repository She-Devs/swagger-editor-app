import { Container } from '@mantine/core';
import { SignUpForm } from '@/components/auth/SignUpForm';
import { setRequestLocale } from 'next-intl/server';

export default async function SignUpPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <Container size="xl" py={60}>
      <SignUpForm />
    </Container>
  );
}
