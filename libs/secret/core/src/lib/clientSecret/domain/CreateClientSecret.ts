import { z } from 'zod';
import { ClientSecret } from './ClientSecret';

export const CreateClientSecret = ClientSecret.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type CreateClientSecret = z.infer<typeof CreateClientSecret>;
