import { z } from 'zod';

// Password validation regex:
// - At least 8 characters
// - At least one letter (Unicode supported)
// - At least one digit
// - At least one special character
const passwordRegex = /^(?=.*[\p{L}])(?=.*\d)(?=.*[^\p{L}\d\s]).{8,}$/u;

export const signInSchema = z.object({
  email: z.string().min(1, 'emailRequired').email('emailInvalid'),
  password: z.string().min(1, 'passwordRequired'),
});

export const signUpSchema = z
  .object({
    email: z.string().min(1, 'emailRequired').email('emailInvalid'),
    password: z
      .string()
      .min(1, 'passwordRequired')
      .min(8, 'passwordMin')
      .regex(passwordRegex, 'passwordWeak'),
    confirmPassword: z.string().min(1, 'confirmPasswordRequired'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'passwordsMismatch',
    path: ['confirmPassword'],
  });

export type SignInFormData = z.infer<typeof signInSchema>;
export type SignUpFormData = z.infer<typeof signUpSchema>;
