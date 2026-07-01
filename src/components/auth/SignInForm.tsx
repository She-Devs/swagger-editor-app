'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { TextInput, PasswordInput, Button, Stack, Alert, Text, Anchor, Paper, Title } from '@mantine/core';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from '@/i18n/navigation';
import { signInSchema, type SignInFormData } from '@/lib/validations/auth';
import { Link } from '@/i18n/navigation';
import { IconAlertCircle } from '@tabler/icons-react';

export function SignInForm() {
  const t = useTranslations('Auth.signIn');
  const tErrors = useTranslations('Auth.errors');
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
  });

  const onSubmit = async (data: SignInFormData) => {
    try {
      setIsLoading(true);
      setError(null);

      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (signInError) {
        if (signInError.message.includes('Invalid login credentials')) {
          setError(tErrors('invalidCredentials'));
        } else {
          setError(tErrors('authFailed'));
        }
        return;
      }

      router.push('/');
    } catch (err) {
      setError(tErrors('authFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Paper withBorder shadow="md" p={30} mt={30} radius="md" maw={420} mx="auto">
      <Title order={2} ta="center" mb="xs">
        {t('title')}
      </Title>
      <Text c="dimmed" size="sm" ta="center" mb="md">
        {t('subtitle')}
      </Text>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack gap="md">
          {error && (
            <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light">
              {error}
            </Alert>
          )}

          <TextInput
            label={t('email')}
            placeholder="your@email.com"
            {...register('email')}
            error={errors.email && tErrors(errors.email.message as string)}
            disabled={isLoading}
          />

          <PasswordInput
            label={t('password')}
            placeholder="Your password"
            {...register('password')}
            error={errors.password && tErrors(errors.password.message as string)}
            disabled={isLoading}
          />

          <Button type="submit" fullWidth loading={isLoading}>
            {t('submit')}
          </Button>

          <Text c="dimmed" size="sm" ta="center">
            {t('noAccount')}{' '}
            <Anchor component={Link} href="/sign-up" size="sm">
              {t('signUpLink')}
            </Anchor>
          </Text>
        </Stack>
      </form>
    </Paper>
  );
}
