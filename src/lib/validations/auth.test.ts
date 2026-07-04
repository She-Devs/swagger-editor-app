import { describe, it, expect } from 'vitest';
import { signInSchema, signUpSchema } from './auth';

describe('signInSchema', () => {
  it('validates valid credentials', () => {
    const result = signInSchema.safeParse({ email: 'user@example.com', password: 'anypassword' });
    expect(result.success).toBe(true);
  });

  it('rejects empty email', () => {
    const result = signInSchema.safeParse({ email: '', password: 'anypassword' });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe('emailRequired');
  });

  it('rejects invalid email format', () => {
    const result = signInSchema.safeParse({ email: 'not-an-email', password: 'anypassword' });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe('emailInvalid');
  });

  it('rejects empty password', () => {
    const result = signInSchema.safeParse({ email: 'user@example.com', password: '' });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe('passwordRequired');
  });
});

describe('signUpSchema', () => {
  const validData = {
    email: 'user@example.com',
    password: 'Password1!',
    confirmPassword: 'Password1!',
  };

  it('validates valid sign up data', () => {
    expect(signUpSchema.safeParse(validData).success).toBe(true);
  });

  it('rejects empty email', () => {
    const result = signUpSchema.safeParse({ ...validData, email: '' });
    expect(result.success).toBe(false);
    const emailError = result.error?.issues.find((i) => i.path[0] === 'email');
    expect(emailError?.message).toBe('emailRequired');
  });

  it('rejects invalid email format', () => {
    const result = signUpSchema.safeParse({ ...validData, email: 'bad@' });
    expect(result.success).toBe(false);
    const emailError = result.error?.issues.find((i) => i.path[0] === 'email');
    expect(emailError?.message).toBe('emailInvalid');
  });

  it('rejects empty password', () => {
    const result = signUpSchema.safeParse({ ...validData, password: '', confirmPassword: '' });
    expect(result.success).toBe(false);
    const pwError = result.error?.issues.find((i) => i.path[0] === 'password');
    expect(pwError?.message).toBe('passwordRequired');
  });

  it('rejects password shorter than 8 chars', () => {
    const result = signUpSchema.safeParse({ ...validData, password: 'Ab1!', confirmPassword: 'Ab1!' });
    expect(result.success).toBe(false);
    const pwError = result.error?.issues.find((i) => i.path[0] === 'password');
    expect(pwError?.message).toBe('passwordMin');
  });

  it('rejects password without special character', () => {
    const result = signUpSchema.safeParse({ ...validData, password: 'Password1', confirmPassword: 'Password1' });
    expect(result.success).toBe(false);
    const pwError = result.error?.issues.find((i) => i.path[0] === 'password');
    expect(pwError?.message).toBe('passwordWeak');
  });

  it('rejects password without digit', () => {
    const result = signUpSchema.safeParse({ ...validData, password: 'Password!', confirmPassword: 'Password!' });
    expect(result.success).toBe(false);
    const pwError = result.error?.issues.find((i) => i.path[0] === 'password');
    expect(pwError?.message).toBe('passwordWeak');
  });

  it('rejects password without letter', () => {
    const result = signUpSchema.safeParse({ ...validData, password: '12345678!', confirmPassword: '12345678!' });
    expect(result.success).toBe(false);
    const pwError = result.error?.issues.find((i) => i.path[0] === 'password');
    expect(pwError?.message).toBe('passwordWeak');
  });

  it('rejects mismatched passwords', () => {
    const result = signUpSchema.safeParse({ ...validData, confirmPassword: 'Different1!' });
    expect(result.success).toBe(false);
    const mismatch = result.error?.issues.find((i) => i.path[0] === 'confirmPassword');
    expect(mismatch?.message).toBe('passwordsMismatch');
  });

  it('accepts unicode letter in password', () => {
    const result = signUpSchema.safeParse({ ...validData, password: 'Пароль1!', confirmPassword: 'Пароль1!' });
    expect(result.success).toBe(true);
  });

  it('rejects empty confirmPassword', () => {
    const result = signUpSchema.safeParse({ ...validData, confirmPassword: '' });
    expect(result.success).toBe(false);
    const err = result.error?.issues.find((i) => i.path[0] === 'confirmPassword');
    expect(err?.message).toBe('confirmPasswordRequired');
  });
});
