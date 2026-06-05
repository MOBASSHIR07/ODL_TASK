import { z } from 'zod';

export const registerOrgSchema = z.object({
  body: z.object({
    orgName: z.string({ message: 'Organization name is required' }).min(2),
    timezone: z.string({ message: 'Timezone is required' }),
    adminName: z.string({ message: 'Admin name is required' }).min(2),
    email: z.string({ message: 'Admin email is required' }).email('Invalid email address'),
    password: z.string({ message: 'Password is required' }).min(6, 'Password must be at least 6 characters'),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string({ message: 'Email is required' }).email('Invalid email address'),
    password: z.string({ message: 'Password is required' }),
  }),
});
