import { z } from 'zod';

export const ElementaryUser = z.object({
  id: z.string().cuid(),
  email: z.string().email(),
  fullName: z.string().min(1),
  disabled: z.boolean().default(false),
});

export type ElementaryUser = z.infer<typeof ElementaryUser>;
